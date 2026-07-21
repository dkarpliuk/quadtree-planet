import { AddressUtility } from './address-utility';
import { TreeNode } from './tree-node';
import { Direction } from './enums';
import { CalcMisc, type Vector3Like } from './calc-misc';
import { Sector } from './sector';
import { SectorMesh } from './sector-mesh';

//for each Z-order quadrant (0 1 / 2 3), the two sides lying on the parent's
//outer edge; the other two sides face siblings inside the parent
const OUTWARD_DIRECTIONS: Direction[][] = [
  [Direction.up, Direction.left],    //0 - top-left
  [Direction.up, Direction.right],   //1 - top-right
  [Direction.down, Direction.left],  //2 - bottom-left
  [Direction.down, Direction.right], //3 - bottom-right
];

export interface EngineOptions {
  minLod: number;
  maxLod: number;
  sphereRadius: number;
  //vertices per sector edge; must be even so edges halve cleanly when stitching
  density: number;
  //the three.js adapter injected into every sector; a layer supplies its own to
  //vary material and height
  sectorMeshFactory: () => SectorMesh;
}

export class Engine {
  /**
   * lifecycle hooks: the client attaches a sector's mesh to the scene on create
   * and detaches it on remove
   */
  onSectorCreated: (sector: Sector) => void = () => { };
  onSectorRemoved: (sector: Sector) => void = () => { };

  private readonly _minLod: number;
  private readonly _maxLod: number;
  private readonly _sphereRadius: number;
  private readonly _density: number;
  private readonly _sectorMeshFactory: () => SectorMesh;

  private readonly _tree: TreeNode<Sector>;
  private readonly _addresses = new Set<string>();
  private readonly _addressUtility = new AddressUtility();

  private _spectatorLocalPosition!: Vector3Like;

  /**
   * set when a split/merge changes the tree this tick, so the stitch pass runs
   * only when neighbor relationships could have changed
   */
  private _topologyDirty = false;

  constructor(options: EngineOptions) {
    this._validateOptions(options);

    this._minLod = options.minLod;
    this._maxLod = options.maxLod;
    this._sphereRadius = options.sphereRadius;
    this._density = options.density;
    this._sectorMeshFactory = options.sectorMeshFactory;
    this._tree = TreeNode.newRoot<Sector>();
  }

  private _validateOptions(options: EngineOptions) {
    if (options.minLod < 1 || options.maxLod < options.minLod)
      throw 'LOD range out of range. Require 1 <= minLod <= maxLod.';
    if (options.sphereRadius <= 0)
      throw 'Sphere radius out of range. Must be greater than 0.';
    if (options.density < 2 || options.density % 2 !== 0)
      throw 'Density out of range. Must be a positive even number.';
  }

  initialize() {
    const sectors = [
      this._createSector(),
      this._createSector(),
      this._createSector(),
      this._createSector(),
      this._createSector(),
      this._createSector()
    ];

    this._tree.setChildren(sectors);
    this._tree.children.forEach(c => {
      this._addresses.add(c.address.join(''));
      c.obj.instantiate(c.address);
      this.onSectorCreated(c.obj);
    });
  }

  execute(spectatorLocalPosition: Vector3Like) {
    this._spectatorLocalPosition = spectatorLocalPosition;
    this._topologyDirty = false;

    //merge first (coarsen what is too far), then split (refine what is close)
    this._tree.traverseLeafParents(this._processLodMerges.bind(this));
    this._tree.traverseLeaves(this._processLodSplits.bind(this));

    //re-stitch only when the tree actually changed this tick; otherwise every
    //leaf keeps the same neighbors and the previous stitching still holds
    if (this._topologyDirty)
      this._tree.traverseLeaves(this._stitchLeaf.bind(this));
  }

  /**
   * Second pass over the settled leaves: stitches each leaf edge that faces a
   * coarser neighbor, closing the LOD seams.
   *
   * Relies on the 2:1 (restricted quadtree) invariant kept by the _canSplit /
   * _canMerge balance guards: a coarser neighbor is at most one level below,
   * which is exactly what collapsing every other edge vertex fixes.
   */
  private _stitchLeaf(leafNode: TreeNode<Sector>) {
    const directions: Direction[] = [];

    for (const direction of Object.values(Direction)) {
      const neighbor = this._addressUtility.getNeighborAddress(leafNode.address, direction);

      //absence from the address set means no node exists at the neighbor's level,
      //i.e. that side is covered by a coarser (lower-LOD) sector -> needs stitching
      if (!this._addresses.has(neighbor.join('')))
        directions.push(direction);
    }

    leafNode.obj.stitch(directions);
  }

  private _processLodMerges(leafParent: TreeNode<Sector>) {
    if (leafParent.level < this._minLod) return;

    const mergeDistance = this._getProcessingDistance(leafParent.level);
    const wantsMerge = this._getDistanceToSpectator(leafParent.obj) >= mergeDistance;
    if (wantsMerge && this._canMerge(leafParent))
      this._decreaseLOD(leafParent);
  }

  private _processLodSplits(leafNode: TreeNode<Sector>) {
    if (leafNode.level >= this._maxLod) return;

    const splitDistance = this._getProcessingDistance(leafNode.level);
    const wantsSplit = this._getDistanceToSpectator(leafNode.obj) <= splitDistance;
    if ((leafNode.level < this._minLod || wantsSplit) && this._canSplit(leafNode))
      this._increaseLOD(leafNode);
  }

  private _getProcessingDistance = (level: number) =>
    this._sphereRadius / Math.pow(2, level - 2);

  /**
   * 2:1 balance guard for splitting: a leaf may split only if no edge-neighbor
   * is coarser than it. Otherwise the new children would sit two levels below
   * that neighbor and break the stitch invariant (we simply wait until the
   * neighbor refines on its own).
   *
   * A same-level neighbor address is present in the set exactly when a node
   * exists there at that level or finer; its absence means a coarser neighbor.
   * This is the same primitive the stitch pass uses.
   */
  private _canSplit(leafNode: TreeNode<Sector>): boolean {
    return Object.values(Direction).every(direction => {
      const neighbor = this._addressUtility.getNeighborAddress(leafNode.address, direction);
      return this._addresses.has(neighbor.join(''));
    });
  }

  /**
   * 2:1 balance guard for merging: collapsing the parent is safe only if no cell
   * touching its outer edge is two levels finer. For each child quadrant we test
   * just its two outward sides (those on the parent's boundary) and check whether
   * that same-level neighbor is itself subdivided - a '0' child in the address
   * set means a level ℓ+2 cell is pressed against the edge.
   */
  private _canMerge(parent: TreeNode<Sector>): boolean {
    return parent.children.every((child, quadrant) =>
      OUTWARD_DIRECTIONS[quadrant].every(direction => {
        const neighbor = this._addressUtility.getNeighborAddress(child.address, direction);
        return !this._addresses.has(neighbor.join('') + '0');
      }));
  }

  /**
   * distance from the spectator to the nearest point of the sector
   */
  private _getDistanceToSpectator(sector: Sector): number {
    const distance = CalcMisc.calcDistance(this._spectatorLocalPosition, sector.center);
    return Math.max(0, distance - sector.boundingRadius);
  }

  private _increaseLOD(leafNode: TreeNode<Sector>) {
    this._topologyDirty = true;
    this.onSectorRemoved(leafNode.obj);
    leafNode.obj.clear();
    leafNode.setChildren([
      this._createSector(),
      this._createSector(),
      this._createSector(),
      this._createSector()
    ]);

    for (const childNode of leafNode.children) {
      this._addresses.add(childNode.address.join(''));
      childNode.obj.instantiate(childNode.address);
      this.onSectorCreated(childNode.obj);
    }
  }

  private _decreaseLOD(leafNode: TreeNode<Sector>) {
    this._topologyDirty = true;

    for (const childNode of leafNode.children) {
      this.onSectorRemoved(childNode.obj);
      childNode.obj.clear();
    }

    leafNode.children.forEach(x => this._addresses.delete(x.address.join('')));
    leafNode.removeChildren();
    leafNode.obj.instantiate(leafNode.address);
    this.onSectorCreated(leafNode.obj);
  }

  private _createSector = () =>
    new Sector(this._sphereRadius, this._density, this._sectorMeshFactory());
}

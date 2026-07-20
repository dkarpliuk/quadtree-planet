import { AddressUtility } from './address-utility';
import { TreeNode } from './tree-node';
import { Direction } from './enums';
import { CalcMisc, type Vector3Like } from './calc-misc';
import { Sector } from './sector';
import { SectorMesh } from './sector-mesh';

//depth every sector is split to regardless of distance
const MIN_LOD = 4;

//for each Z-order quadrant (0 1 / 2 3), the two sides lying on the parent's
//outer edge; the other two sides face siblings inside the parent
const OUTWARD_DIRECTIONS: Direction[][] = [
  [Direction.up, Direction.left],    //0 - top-left
  [Direction.up, Direction.right],   //1 - top-right
  [Direction.down, Direction.left],  //2 - bottom-left
  [Direction.down, Direction.right], //3 - bottom-right
];

export class Engine {
  _maxLod!: number;
  _spectatorLocalPosition!: Vector3Like;
  _sphereRadius!: number;

  /**
   * makes the three.js adapter injected into every sector; a layer supplies its
   * own to vary material and height
   */
  _sectorMeshFactory: () => SectorMesh = () => new SectorMesh();

  /**
   * lifecycle hooks: the client attaches a sector's mesh to the scene on create
   * and detaches it on remove
   */
  onSectorCreated: (sector: Sector) => void = () => { };
  onSectorRemoved: (sector: Sector) => void = () => { };

  _tree: TreeNode<Sector>;
  _addresses: Set<string>;
  _addressUtility: AddressUtility;

  /**
   * set when a split/merge changes the tree this tick, so the stitch pass runs
   * only when neighbor relationships could have changed
   */
  _topologyDirty = false;

  get maxLod(): number { return this._maxLod; }

  get sphereRadius(): number { return this._sphereRadius; }

  constructor() {
    this._tree = TreeNode.newRoot<Sector>();
    this._addresses = new Set();
    this._addressUtility = new AddressUtility();
  }

  initialize() {
    let sectors = [
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
    this._tree.traverseLeaves(this._processLOD.bind(this));

    //re-stitch only when the tree actually changed this tick; otherwise every
    //leaf keeps the same neighbors and the previous stitching still holds
    if (this._topologyDirty) {
      this._tree.traverseLeaves(this._stitchLeaf.bind(this));
    }
  }

  /**
   * Second pass over the settled leaves: stitches each leaf edge that faces a
   * coarser neighbor, closing the LOD seams.
   *
   * Relies on the 2:1 (restricted quadtree) invariant kept by the _canSplit /
   * _canMerge balance guards: a coarser neighbor is at most one level below,
   * which is exactly what collapsing every other edge vertex fixes.
   */
  _stitchLeaf(leafNode: TreeNode<Sector>) {
    let directions: Direction[] = [];

    for (let direction of Object.values(Direction)) {
      let neighbor = this._addressUtility.getNeighborAddress(leafNode.address, direction);

      //absence from the address set means no node exists at the neighbor's level,
      //i.e. that side is covered by a coarser (lower-LOD) sector -> needs stitching
      if (!this._addresses.has(neighbor.join(''))) {
        directions.push(direction);
      }
    }

    leafNode.obj.stitch(directions);
  }

  _processLOD(leafNode: TreeNode<Sector>) {
    let splitDistance = this.sphereRadius / Math.pow(2, leafNode.level - 2);

    let wantsSplit = leafNode.level < MIN_LOD
      || leafNode.level < this.maxLod
      && this._getDistanceToSpectator(leafNode.obj) < splitDistance;

    //any processed leaf sits below the root, so its parent is never null
    let parent = leafNode.parent!;

    if (wantsSplit && this._canSplit(leafNode)) {
      this._increaseLOD(leafNode);
    } else if (!wantsSplit
      && parent.level > MIN_LOD
      && !parent.children.some(x => x.children.length)
      && this._getDistanceToSpectator(parent.obj) >= splitDistance * 2
      && this._canMerge(parent)) {

      this._decreaseLOD(parent);
    }
  }

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
  _canSplit(leafNode: TreeNode<Sector>): boolean {
    return Object.values(Direction).every(direction => {
      let neighbor = this._addressUtility.getNeighborAddress(leafNode.address, direction);
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
  _canMerge(parent: TreeNode<Sector>): boolean {
    return parent.children.every((child, quadrant) =>
      OUTWARD_DIRECTIONS[quadrant].every(direction => {
        let neighbor = this._addressUtility.getNeighborAddress(child.address, direction);
        return !this._addresses.has(neighbor.join('') + '0');
      }));
  }

  /**
   * distance from the spectator to the nearest point of the sector
   */
  _getDistanceToSpectator(sector: Sector): number {
    let distance = CalcMisc.calcDistance(this._spectatorLocalPosition, sector.center);
    return Math.max(0, distance - sector.boundingRadius);
  }

  _increaseLOD(leafNode: TreeNode<Sector>) {
    this._topologyDirty = true;
    this.onSectorRemoved(leafNode.obj);
    leafNode.obj.clear();
    leafNode.setChildren([
      this._createSector(),
      this._createSector(),
      this._createSector(),
      this._createSector()
    ]);

    for (let childNode of leafNode.children) {
      this._addresses.add(childNode.address.join(''));
      childNode.obj.instantiate(childNode.address);
      this.onSectorCreated(childNode.obj);
    }
  }

  _decreaseLOD(leafNode: TreeNode<Sector>) {
    this._topologyDirty = true;

    for (let childNode of leafNode.children) {
      this.onSectorRemoved(childNode.obj);
      childNode.obj.clear();
    }

    leafNode.children.forEach(x => this._addresses.delete(x.address.join('')));
    leafNode.removeChildren();
    leafNode.obj.instantiate(leafNode.address);
    this.onSectorCreated(leafNode.obj);
  }

  _createSector(): Sector {
    return new Sector(this.sphereRadius, this._sectorMeshFactory());
  }
}

import { AddressUtility } from './address-utility';
import { CalcMisc, type Vector3Like } from './calc-misc';
import { Direction } from './enums';
import { Sector, type SectorBuffer } from './sector';
import { TreeNode } from './tree-node';

//for each Z-order quadrant (0 1 / 2 3), the two sides lying on the parent's
//outer edge; the other two sides face siblings inside the parent
const OUTWARD_DIRECTIONS: Direction[][] = [
  [Direction.up, Direction.left],    //0 - top-left
  [Direction.up, Direction.right],   //1 - top-right
  [Direction.down, Direction.left],  //2 - bottom-left
  [Direction.down, Direction.right], //3 - bottom-right
];

export interface EngineOptions<T extends Sector> {
  minLod: number;
  maxLod: number;
  sphereRadius: number;
  density: number;
  sectorFactory: () => T;
}

export class Engine<T extends Sector> {
  onSectorBufferChanged: (address: string, buffer: SectorBuffer) => void = () => { };
  onSectorDisposed: (address: string) => void = () => { };

  private readonly _options: EngineOptions<T>;

  private readonly _tree: TreeNode<T>;
  private readonly _addresses = new Set<string>();

  private _spectatorLocalPosition!: Vector3Like;

  /**
   * set when a split/merge changes the tree topology this execution,
   * so the stitch pass runs only when neighbor relationships change
   */
  private _topologyDirty = false;

  constructor(options: EngineOptions<T>) {
    this._validateOptions(options);

    this._options = { ...options };
    this._tree = TreeNode.newRoot<T>();
  }

  private _validateOptions(options: EngineOptions<T>) {
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
      this._createSector(),
    ];

    this._tree.setChildren(sectors);
    this._tree.children.forEach(c => {
      this._addresses.add(c.address.join(''));
      c.obj.instantiate(c.address);
    });
  }

  execute(spectatorLocalPosition: Vector3Like) {
    this._spectatorLocalPosition = spectatorLocalPosition;
    this._topologyDirty = false;

    this._tree.traverseLeafParents(this._processLodMerges.bind(this));
    this._tree.traverseLeaves(this._processLodSplits.bind(this));

    if (this._topologyDirty)
      this._tree.traverseLeaves(this._stitchLeaf.bind(this));
  }

  /**
   * stitches each leaf edge that faces a coarser neighbor, closing the LOD seams.
   * Relies on the 2:1 (restricted quadtree) invariant
   * kept by the _canSplit /_canMerge balance guards
   */
  private _stitchLeaf(leafNode: TreeNode<T>) {
    const directions: Direction[] = [];

    for (const direction of Object.values(Direction)) {
      const neighbor = AddressUtility.getNeighborAddress(leafNode.address, direction);

      //absence from the address set means no node exists at the neighbor's level,
      //i.e. that side is covered by a coarser (lower-LOD) sector -> needs stitching
      if (!this._addresses.has(neighbor.join('')))
        directions.push(direction);
    }

    leafNode.obj.stitch(directions);
  }

  private _processLodMerges(leafParent: TreeNode<T>) {
    if (leafParent.level < this._options.minLod) return;

    const mergeDistance = this._getProcessingDistance(leafParent.level);
    const wantsMerge = this._getDistanceToSpectator(leafParent.obj) >= mergeDistance;
    if (wantsMerge && this._canMerge(leafParent))
      this._decreaseLOD(leafParent);
  }

  private _processLodSplits(leafNode: TreeNode<T>) {
    if (leafNode.level >= this._options.maxLod) return;

    const splitDistance = this._getProcessingDistance(leafNode.level);
    const wantsSplit = this._getDistanceToSpectator(leafNode.obj) <= splitDistance;
    const belowMinLevel = leafNode.level < this._options.minLod;
    if ((belowMinLevel || wantsSplit) && this._canSplit(leafNode))
      this._increaseLOD(leafNode);
  }

  private _getProcessingDistance = (level: number) =>
    this._options.sphereRadius / Math.pow(2, level - 2);

  private _getDistanceToSpectator(sector: Sector): number {
    const distance = CalcMisc.calcDistance(this._spectatorLocalPosition, sector.center);
    return Math.max(0, distance - sector.boundingRadius);
  }

  /**
   * 2:1 balance guard for splitting: a leaf may split only if no edge-neighbor is
   * coarser than it - checked by the neighbor's same-level address being in the
   * address set (its absence means a coarser neighbor).
   */
  private _canSplit(leafNode: TreeNode<T>): boolean {
    return Object.values(Direction).every(direction => {
      const neighbor = AddressUtility.getNeighborAddress(leafNode.address, direction);
      return this._addresses.has(neighbor.join(''));
    });
  }

  /**
   * 2:1 balance guard for merging: safe only if no cell touching the parent's
   * outer edge is two levels finer - checked by a `<neighbor>[0]` address being in
   * the address set (which means such a cell is pressed against the edge).
   */
  private _canMerge(parent: TreeNode<T>): boolean {
    return parent.children.every((child, quadrant) =>
      OUTWARD_DIRECTIONS[quadrant].every(direction => {
        const neighbor = AddressUtility.getNeighborAddress(child.address, direction);
        return !this._addresses.has(neighbor.join('') + '0');
      }));
  }

  private _increaseLOD(leafNode: TreeNode<T>) {
    this._topologyDirty = true;
    leafNode.obj.dispose();
    leafNode.setChildren([
      this._createSector(),
      this._createSector(),
      this._createSector(),
      this._createSector(),
    ]);

    for (const childNode of leafNode.children) {
      this._addresses.add(childNode.address.join(''));
      childNode.obj.instantiate(childNode.address);
    }
  }

  private _decreaseLOD(leafNode: TreeNode<T>) {
    this._topologyDirty = true;

    for (const childNode of leafNode.children) {
      childNode.obj.dispose();
    }

    leafNode.children.forEach(x => this._addresses.delete(x.address.join('')));
    leafNode.removeChildren();
    leafNode.obj.instantiate(leafNode.address);
  }

  private _createSector = (): T => {
    const sector = this._options.sectorFactory();
    
    sector.onBufferChanged = address =>
      this.onSectorBufferChanged(address, sector.buffer);
    sector.onDisposed = address =>
      this.onSectorDisposed(address);
    
    return sector;
  };
}

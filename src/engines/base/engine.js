import { Object3D } from 'three';
import { QuadtreeNeighborsFSM } from '../../core/quadtree-neighbours';
import { TreeNode } from '../../core/tree-node';
import { AxisEnum } from '../../enums/axis-enum';
import { Direction } from '../../enums/direction';
import { CalcMisc } from '../../helpers/calc-misc';
import { debounce } from '../../helpers/debounce';
import { Sector } from './sector';

export class Engine {
  _depthLevel = null;
  _executionDebounceMs = null;
  _spectatorRef = null;
  _sphereRadius = null;
  _tree = null;
  _sectorPool = new Map();

  /**
   * @type {Object3D}
   */
  get attractor() { return this._tree?.obj; }

  /**
   * @type {number}
   */
  get depthLevel() { return this._depthLevel; }

  /**
   * @type {number}
   */
  get executionDebounce() { return this._executionDebounceMs; }

  /**
   * @type {Object3D}
   */
  get spectatorRef() { return this._spectatorRef; }

  /**
   * @type {number}
   */
  get sphereRadius() { return this._sphereRadius; }

  constructor() {
    this._tree = new TreeNode(new Object3D(), null);
  }

  initialize() {
    if (this.executionDebounce > 0) {
      this.execute = debounce(this.execute, this.executionDebounce);
    }

    let sectors = [
      this._createSector([AxisEnum.abscissaPositive]),
      this._createSector([AxisEnum.abscissaNegative]),
      this._createSector([AxisEnum.ordinatePositive]),
      this._createSector([AxisEnum.ordinateNegative]),
      this._createSector([AxisEnum.applicataPositive]),
      this._createSector([AxisEnum.applicataNegative])
    ];

    this._tree.setChildren(sectors);
    sectors.forEach(sector => sector.instantiate(this.attractor));
  }

  execute() {
    this._tree.traverseLeaves(this._preprocess.bind(this));
  }

  /**
   * @param {TreeNode} leafNode 
   */
  _preprocess(leafNode) {
    let distanceToSpectator = this._getDistanceToSpectator(leafNode.obj);
    let splitDistanceBoundary = this.sphereRadius / Math.pow(2, leafNode.level - 1) * 2;
 
    if (distanceToSpectator < splitDistanceBoundary && leafNode.level < this.depthLevel) {
      this._increaseLOD(leafNode);
    } else if (distanceToSpectator > splitDistanceBoundary * 3 && leafNode.level > 1) {
      this._decreaseLOD(leafNode.parent);
    }
  }

  /**
   * computes distance between spectator and center of sector
   * @param {Sector} sector 
   * @returns {number}
   */
  _getDistanceToSpectator(sector) {
    let spectatorLocalPosition = this.attractor.worldToLocal(this._spectatorRef.position.clone());
    let distance = CalcMisc.calcDistance(spectatorLocalPosition, sector.center);
    return distance;
  }

  /**
   * @param {TreeNode} leafNode 
   */
  _increaseLOD(leafNode) {
    let sector = leafNode.obj;
    sector.visible = false;

    leafNode.setChildren([
      this._createSector([...sector.address, 0]),
      this._createSector([...sector.address, 1]),
      this._createSector([...sector.address, 2]),
      this._createSector([...sector.address, 3])
    ]);

    for (let childNode of leafNode.children) {
      childNode.obj.instantiate(this.attractor);
      this._sectorPool.set(childNode.obj.address.join(''), childNode.obj);
    }
  }

  /**
   * @param {TreeNode} leafNode 
   */
  _decreaseLOD(leafNode) {
    for (let childNode of leafNode.children) {
      childNode.obj.detach(this.attractor);
      childNode.obj.visible = false;
      this._sectorPool.delete(childNode.obj.address.join(''));
    }

    leafNode.removeChildren();
    leafNode.obj.visible = true;
  }

  /**
   * perform correct docking with adjacent sectors
   * @param {Sector} sector 
   */
  _dock(sector) {
    let level = sector.address.length - 1;
    if (level < 2) {
      return;
    }

    if (!this._findNeighbor(sector, Direction.right)) {
      sector.stich(Direction.right);
    }
    if (!this._findNeighbor(sector, Direction.left)) {
      sector.stich(Direction.left);
    }
    if (!this._findNeighbor(sector, Direction.down)) {
      sector.stich(Direction.down);
    }
    if (!this._findNeighbor(sector, Direction.up)) {
      sector.stich(Direction.up);
    }
  }

  /**
   * finds adjacent sector of the same level in the orthogonal direction
   * @param {Sector} sector 
   * @param {Direction} direction 
   * @returns {Sector}
   */
  _findNeighbor(sector, direction) {
    let neighborAddress = [...sector.address];
    let level = neighborAddress.length - 1;

    while (level > 0) {
      let quadrant = neighborAddress[level];
      let state = QuadtreeNeighborsFSM.get(direction)[quadrant];
      neighborAddress[level] = state.quadrant;

      if (state.halt) {
        break;
      } else {
        level--;
      }
    }

    return this._sectorPool.get(neighborAddress.join(''));
  }

  /**
   * @param {number[]} address 
   */
  _createSector(address) {
    return new Sector(address, this.sphereRadius);
  }
}
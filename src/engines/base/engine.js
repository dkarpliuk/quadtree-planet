import { Object3D } from 'three';
import { TreeNode } from '../../core/tree-node';
import { AxisEnum } from '../../enums/axis-enum';
import { CalcMisc } from '../../helpers/calc-misc';
import { debounce } from '../../helpers/debounce';
import { Sector } from './sector';

export class Engine {
  _depthLevel = null;
  _executionDebounceMs = null;
  _spectatorRef = null;
  _sphereRadius = null;
  _tree = null;
  _sectorPool = null;

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
    this._sectorPool = new Map();
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
    this._tree.traverseLeaves(this._work.bind(this));
  }

  /**
   * @param {TreeNode} leafNode 
   */
  _work(leafNode) {
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
   * gets neighbor of the same level in orthodonal direction
   * @param {number[]} address 
   * @param {string} direction 
   */
  _getNeighbour(address, direction) {
    let neighborAddress = [...address];
    let level = address.length - 1;

    let replace = QuadtreeOrthogonalNeighboursFSM[direction][address[level]];
    while (!replace.halt || level > 0) {
      neighborAddress[level] = replace.quadrant;
      level--;
    }

    return this._sectorPool.get(neighborAddress.join());
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

    leafNode.children.forEach(childNode => childNode.obj.instantiate(this.attractor));
  }

  /**
   * @param {TreeNode} leafNode 
   */
  _decreaseLOD(leafNode) {
    for (let childNode of leafNode.children) {
      childNode.obj.detach(this.attractor);
      childNode.obj.visible = false;
    }

    leafNode.removeChildren();
    leafNode.obj.visible = true;
  }

  /**
   * @param {number[]} address 
   */
  _createSector(address) {
    return new Sector(address, this.sphereRadius);
  }
}
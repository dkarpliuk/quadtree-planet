import { Object3D } from 'three';
import { TreeNode } from '../../core/tree-node';
import { Direction } from '../../enums/direction';
import { CalcMisc } from '../../helpers/calc-misc';
import { debounce } from '../../helpers/debounce';
import { Sector } from './sector';

export class Engine {
  _depthLevel = null;
  _executionDebounceMs = null;
  _spectatorRef = null;
  _sphereRadius = null;

  /**
   * @type {TreeNode<Sector}
   */
  _tree = null;

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
      this._createSector(),
      this._createSector(),
      this._createSector(),
      this._createSector(),
      this._createSector(),
      this._createSector()
    ];

    this._tree.setChildren(sectors);
    this._tree.children.forEach(c => c.obj.instantiate(this.attractor, c.address));
  }

  execute() {
    this._tree.traverseLeaves(this._preprocess.bind(this));
  }

  /**
   * @param {TreeNode<Sector>} leafNode 
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
   * @param {TreeNode<Sector>} leafNode 
   */
  _increaseLOD(leafNode) {
    let sector = leafNode.obj;
    sector.visible = false;

    leafNode.setChildren([
      this._createSector(),
      this._createSector(),
      this._createSector(),
      this._createSector()
    ]);

    for (let childNode of leafNode.children) {
      childNode.obj.instantiate(this.attractor, childNode.address);
    }
  }

  /**
   * @param {TreeNode<Sector>} leafNode 
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
   * perform correct docking with adjacent sectors
   * @param {TreeNode<Sector>} node 
   */
  _dock(node) {
    if (node.level < 2) {
      return;
    }

    let quadrantNumber = node.address[node.address.length - 1];
    if ((quadrantNumber == 0 || quadrantNumber == 1) && !node.findNeighbor(Direction.up)) {
      node.obj.stich(Direction.up);
    }
    if ((quadrantNumber == 1 || quadrantNumber == 3) && !node.findNeighbor(Direction.right)) {
      node.obj.stich(Direction.right);
    }
    if ((quadrantNumber == 3 || quadrantNumber == 2) && !node.findNeighbor(Direction.down)) {
      node.obj.stich(Direction.down);
    }
    if ((quadrantNumber == 2 || quadrantNumber == 0) && !node.findNeighbor(Direction.left)) {
      node.obj.stich(Direction.left);
    }
  }

  _createSector() {
    return new Sector(this.sphereRadius);
  }
}
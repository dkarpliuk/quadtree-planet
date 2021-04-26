import { TreeNode } from '@core';
import { Direction } from '@enums';
import { CalcMisc, debounce } from '@helpers';
import { Object3D } from 'three';
import { Sector } from './sector';

export class Engine {
  _depthLevel = null;
  _executionDebounceMs = null;
  _spectatorRef = null;
  _sphereRadius = null;

  /**
   * @type {Array<TreeNode<Sector>>}
   */
  _processStack = null;

  /**
   * @type {TreeNode<Sector>}
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
    this._processStack = new Array();
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
    this._tree.traverseLeaves(this._processLOD.bind(this));

    //TODO: implement intelligent terrain stitching based on orthogonal neighbors level
    while (this._processStack.length) {
      let node = this._processStack.pop();
      node.obj.stich(Direction.up);
      node.obj.stich(Direction.down);
      node.obj.stich(Direction.left);
      node.obj.stich(Direction.right);
    }
  }

  /**
   * @param {TreeNode<Sector>} leafNode 
   */
  _processLOD(leafNode) {
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
      this._processStack.push(childNode);
    }
  }

  /**
   * @param {TreeNode<Sector>} leafNode 
   */
  _decreaseLOD(leafNode) {
    for (let childNode of leafNode.children) {
      childNode.obj.detach(this.attractor);
    }

    leafNode.removeChildren();
    leafNode.obj.visible = true;
  }

  _createSector() {
    return new Sector(this.sphereRadius);
  }
}
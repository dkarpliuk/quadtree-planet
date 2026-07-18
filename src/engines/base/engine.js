import { AddressUtility, TreeNode } from '@core';
import { Direction, LOD } from '@enums';
import { CalcMisc, debounce } from '@helpers';
import { Object3D } from 'three';
import { Sector } from './sector';

export class Engine {
  _maxLod = null;
  _executionDebounceMs = null;
  _spectatorRef = null;
  _sphereRadius = null;

  /**
   * @type {TreeNode<Sector>}
   */
  _tree = null;

  /**
   * @type {Set<string>}
   */
  _addresses = null;

  /**
   * @type {AddressUtility}
   */
  _addressUtility = null;

  /**
   * set when a split/merge changes the tree this tick, so the stitch pass runs
   * only when neighbor relationships could have changed
   * @type {boolean}
   */
  _topologyDirty = false;

  /**
   * @type {Object3D}
   */
  get attractor() { return this._tree?.obj; }

  /**
   * @type {number}
   */
  get maxLod() { return this._maxLod; }

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
    this._addresses = new Set();
    this._addressUtility = new AddressUtility();
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
    this._tree.children.forEach(c => {
      this._addresses.add(c.address.join(''));
      c.obj.instantiate(this.attractor, c.address);
    });
  }

  execute() {
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
   * Assumes a 2:1 (restricted quadtree) invariant - a coarser neighbor is at
   * most one level below. This invariant will be guaranteed by the upcoming
   * split/merge balancing step; until then, boundaries steeper than 2:1 may
   * leave a residual crack.
   * @param {TreeNode<Sector>} leafNode
   */
  _stitchLeaf(leafNode) {
    let directions = [];

    for (let direction of [Direction.up, Direction.right, Direction.down, Direction.left]) {
      let neighbor = this._addressUtility.getNeighborAddress(leafNode.address, direction);

      //absence from the address set means no node exists at the neighbor's level,
      //i.e. that side is covered by a coarser (lower-LOD) sector -> needs stitching
      if (!this._addresses.has(neighbor.join(''))) {
        directions.push(direction);
      }
    }

    leafNode.obj.stitch(directions);
  }

  /**
   * @param {TreeNode<Sector>} leafNode 
   */
  _processLOD(leafNode) {
    let splitDistance = this.sphereRadius / Math.pow(2, leafNode.level - 2);
    let minLod = LOD.ultraLow;

    if (leafNode.level < minLod
      || leafNode.level < this.maxLod
      && this._getDistanceToSpectator(leafNode.obj) < splitDistance) {
      
      this._increaseLOD(leafNode);
    } else if (leafNode.parent.level > minLod
      && !leafNode.parent.children.some(x => x.children)
      && this._getDistanceToSpectator(leafNode.parent.obj) >= splitDistance * 2) {
      
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
    this._topologyDirty = true;
    leafNode.obj.clear(this.attractor);
    leafNode.setChildren([
      this._createSector(),
      this._createSector(),
      this._createSector(),
      this._createSector()
    ]);

    for (let childNode of leafNode.children) {
      this._addresses.add(childNode.address.join(''));
      childNode.obj.instantiate(this.attractor, childNode.address);
    }
  }

  /**
   * @param {TreeNode<Sector>} leafNode 
   */
  _decreaseLOD(leafNode) {
    this._topologyDirty = true;

    for (let childNode of leafNode.children) {
      childNode.obj.clear(this.attractor);
    }

    leafNode.children.forEach(x => this._addresses.delete(x.address.join('')));
    leafNode.removeChildren();
    leafNode.obj.instantiate(this.attractor, leafNode.address)
  }

  _createSector() {
    return new Sector(this.sphereRadius);
  }
}
import { QuadtreeNeighborsFSM } from '../core/quadtree-neighbours';

/** @template T */
export class TreeNode {
  /**
   * @type {Map<string, TreeNode<T>>}
   */
  _pool = null;

  /**
   * @type {number[]}
   */
  address = null;

  /**
   * @type {TreeNode<T>}
   */
  parent = null;

  /**
   * @type {TreeNode<T>[]}
   */
  children = null;

  /**
   * @type {T}
   */
  obj = null;

  /**
   * @type {number}
   */
  level = 0;

  /**
   * @param {any} obj 
   * @param {TreeNode<T>} parent 
   */
  constructor(obj, parent) {
    if (parent) {
      this.parent = parent;
      this.level = parent.level + 1;
      this._pool = parent._pool;
    } else {
      this._pool = new Map();
    }

    this.obj = obj;
  }

  /**
   * @param {T[]} childObjects 
   */
  setChildren(childObjects) {
    this.children = new Array();

    for (let i = 0; i < childObjects.length; i++) {
      let childNode = new TreeNode(childObjects[i], this);
      let address = this.address ? [...this.address, i] : [i];
      childNode.address = address;
      this.children.push(childNode);
      this._pool.set(address.join(''), childNode);
    }
  }

  removeChildren() {
    for (let child of this.children) {
      child.parent = null;
      this.children = null;
      this._pool.delete(child.address);
    }
  }

  /**
   * @callback TraverseCallback
   */

  /**
   * executes callback for each leaf 
   * @param {TraverseCallback} callback
   */
  traverseLeaves(callback) {
    if (this.children) {
      for (let child of this.children) {
        child.traverseLeaves(callback);
      }
    } else if (!this._isOrphan()) {
      callback(this);
    }
  }

  /**
   * @param {number[]} address
   * @returns {TreeNode<T>}
   */
  find(address) {
    return this._pool.get(address.join(''));
  }

  /**
   * finds adjacent node of the same level in the orthogonal direction
   * @param {Direction} direction 
   * @returns {TreeNode<T>}
   */
  findNeighbor(direction) {
    let neighborAddress = [...this.address];
    let level = this.level;

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

    return this._pool.find(neighborAddress.join(''));
  }

  /**
   * @returns {boolean}
   */
  _isOrphan() {
    return this.parent == null && this.level > 0;
  }
}
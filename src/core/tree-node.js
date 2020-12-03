/** @template T */
export class TreeNode {
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
    }
  }

  removeChildren() {
    for (let child of this.children) {
      child.parent = null;
    }

    this.children = null;
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
   * @returns {boolean}
   */
  _isOrphan() {
    return this.parent == null && this.level > 0;
  }
}
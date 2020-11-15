export class TreeNode {
  /**
   * @type {TreeNode}
   */
  parent = null;
  
  /**
   * @type {TreeNode[]}
   */
  children = null;
  
  obj = null;

  /**
   * @type {number}
   */
  level = 0;

  /**
   * @param {any} obj 
   * @param {TreeNode} parent 
   */
  constructor(obj, parent) {
    if (parent) {
      this.parent = parent;
      this.level = parent.level + 1;
    }

    this.obj = obj;
  }

  /**
   * @param {any[]} childrenObjects 
   */
  setChildren(childrenObjects) {
    this.children = new Array();

    for (let child of childrenObjects) {
      this.children.push(new TreeNode(child, this));
    }
  }

  removeChildren() {
    this.children.forEach(child => child.parent = null);
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
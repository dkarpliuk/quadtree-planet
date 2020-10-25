export class TreeNode {
  parent = null;
  children = null;
  obj = null;
  level = 0;

  constructor(obj, parent) {
    if (parent) {
      this.parent = parent;
      this.level = parent.level + 1;
    }

    this.obj = obj;
  }

  setChildren(children) {
    this.children = new Array();

    for (let child of children) {
      this.children.push(new TreeNode(child, this));
    }
  }

  removeChildren() {
    this.children = null;
  }

  traverseLeaves(callback) {
    if (this.children) {
      for (let child of this.children) {
        child.traverseLeaves(callback);
      }
    } else {
      callback(this);
    }
  }
}
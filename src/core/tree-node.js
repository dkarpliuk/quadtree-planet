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

  setChildren(...children) {
    this.children = new Array(children.length);

    for (let child of children) {
      this.children.push(new TreeNode(child, this));
    }
  }

  removeChildren() {
    this.children = null;
  }

  traverseLeaves(callback, node) {
    let children = node ? node.children : this.children;

    if (children) {
      for (let child of children) {
        this.traverseLeaves(callback, child);
      }
    } else {
      callback(node);
    }
  }
}
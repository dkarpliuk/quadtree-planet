export class TreeNode<T> {
  address: number[];
  parent: TreeNode<T> | null;
  children: TreeNode<T>[] = [];
  obj: T;
  level: number;

  constructor(obj: T, parent: TreeNode<T> | null, address: number[]) {
    this.obj = obj;
    this.parent = parent;
    this.address = address;
    this.level = parent ? parent.level + 1 : 0;
  }

  /**
   * the tree root is a structural container with no sector and an empty address
   */
  static newRoot<T>(): TreeNode<T> {
    return new TreeNode<T>({} as T, null, []);
  }

  setChildren(childObjects: T[]) {
    this.children = [];

    for (let i = 0; i < childObjects.length; i++) {
      this.children.push(new TreeNode(childObjects[i], this, [...this.address, i]));
    }
  }

  removeChildren() {
    for (const child of this.children) {
      child.parent = null;
    }

    this.children = [];
  }

  /**
   * executes callback for each leaf
   */
  traverseLeaves(callback: (node: TreeNode<T>) => void) {
    if (this.children.length) {
      for (const child of this.children) {
        child.traverseLeaves(callback);
      }
    } else if (!this._isOrphan()) {
      callback(this);
    }
  }

  _isOrphan(): boolean {
    return this.parent == null && this.level > 0;
  }
}

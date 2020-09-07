import { TreeNode } from '../core/tree-node';

export class EngineBase {
  tree = null;

  constructor(initialMass) {
    this.tree = new TreeNode(initialMass);
  }

  execute() {
    this.tree.traverseLeaves(this.work);
  }

  work(leafNode) {
    throw 'Method not implemented!';
  }
}
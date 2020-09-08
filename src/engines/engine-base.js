import { TreeNode } from '../core/tree-node';

export class EngineBase {
  tree = null;

  constructor(primarySector) {
    this.tree = new TreeNode(primarySector);
  }

  execute() {
    this.tree.traverseLeaves(this.work);
  }

  work(leafNode) {
    throw 'Method not implemented!';
  }
}
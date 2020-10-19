import { Object3D } from 'three';
import { AxisEnum } from '../../enums/axis-enum';
import { TreeNode } from '../../core/tree-node';
import { debounce } from '../../helpers/debounce';
import { Sector } from './sector';

export class Engine {
  _tree = null;
  _spectatorRef = null;
  _sphereRadius = 0;
  _depthLevel = 1;
  _executionDebounceMs = 0;

  get attractor() {
    return this._tree?.obj;
  }

  get sphereRadius() {
    return this._sphereRadius;
  }
  set sphereRadius(val) {
    if (val < 0) {
      throw 'Sphere radius out of range. Must be greater than 0.';
    } else {
      this._sphereRadius = val;
      this.initialize();
    }
  }

  get depthLevel() {
    return this._depthLevel;
  }
  set depthLevel(val) {
    if (val < 1) {
      throw 'Depth level out of range. Must be greater than 1.';
    } else {
      this._depthLevel = val;
      this.initialize();
    }
  }

  get executionDebounce() {
    return this._executionDebounceMs;
  }
  set executionDebounce(val) {
    if (val < 0) {
      throw 'Execution debounce out of range. Must be greater than 0.';
    } else {
      this._executionDebounceMs = val;
      this.initialize();
    }
  }

  constructor(spectator) {
    this._spectatorRef = spectator;
  }

  initialize(initialPosition) {
    if (!this._spectatorRef) {
      throw `Engine can not be initialized. Spectator is ${this._spectatorRef.toString()}`;
    }

    this._tree = new TreeNode(new Object3D(), null);
    if (this.executionDebounce > 0) {
      this.execute = debounce(this.execute, this.executionDebounce);
    }

    let sectors = [
      this._createSector(AxisEnum.abscissaPositive),
      this._createSector(AxisEnum.abscissaNegative),
      this._createSector(AxisEnum.ordinatePositive),
      this._createSector(AxisEnum.ordinateNegative),
      this._createSector(AxisEnum.applicataPositive),
      this._createSector(AxisEnum.applicataNegative)
    ];

    this._tree.setChildren(sectors);

    for (let side of sectors) {
      side.instantiate(this.attractor);
    }
  }

  execute() {
    if (this._tree) {
      this._tree.traverseLeaves(this._work);
    }
  }

  _work(leafNode) {
    let distance = leafNode.obj.getDistanceToMatter(this._spectatorRef.position);
    let splitDistanceBoundary = this.sphereRadius / Math.pow(2, leafNode.level);

    if (distance < splitDistanceBoundary && leafNode.level < this.depthLevel) {
      leafNode.setChildren(leafNode.obj.split());
      leafNode.obj.hide();
      for (let childNode of leafNode.children) {
        childNode.obj.instantiate(this.attractor);
      }
    } else if (distance > splitDistanceBoundary * 2 && leafNode.level > 1) {
      let parent = leafNode.parent;
      parent.removeChildren();
      parent.obj.show();
    }
  }

  _createSector(address, matrix) {
    return new Sector(address, matrix);
  }
}

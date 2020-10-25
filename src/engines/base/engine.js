import { Object3D } from 'three';
import { TreeNode } from '../../core/tree-node';
import { AxisEnum } from '../../enums/axis-enum';
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
    }
  }

  constructor(spectator) {
    this._spectatorRef = spectator;
  }

  initialize() {
    if (!this._spectatorRef) {
      throw `Engine can not be initialized. Spectator is ${this._spectatorRef.toString()}`;
    }

    this._tree = new TreeNode(new Object3D(), null);
    if (this.executionDebounce > 0) {
      this.execute = debounce(this.execute, this.executionDebounce);
    }

    let sectors = [
      //this._createSector([AxisEnum.abscissaPositive]),
      //this._createSector([AxisEnum.abscissaNegative]),
      //this._createSector([AxisEnum.ordinatePositive]),
      //this._createSector([AxisEnum.ordinateNegative]),
      this._createSector([AxisEnum.applicataPositive]),
      //this._createSector([AxisEnum.applicataNegative])
    ];

    this._tree.setChildren(sectors);

    for (let sector of sectors) {
      sector.instantiate(this.attractor);
    }
  }

  execute() {
    if (this._tree) {
      this._tree.traverseLeaves(this._work.bind(this));
    }
  }

  _work(leafNode) {
    let distance = leafNode.obj.calcDistanceToAreaCenter(this._spectatorRef.position);
    let splitDistanceBoundary = this.sphereRadius / Math.pow(2, leafNode.level - 1) * 2;

    if (distance < splitDistanceBoundary && leafNode.level < this.depthLevel) {
      leafNode.setChildren(this._splitSector(leafNode.obj));
      leafNode.obj.visible = false;
      for (let childNode of leafNode.children) {
        childNode.obj.instantiate(this.attractor);
      }
    }
    
    if (distance > splitDistanceBoundary * 3 && leafNode.level > 1) {
      let parent = leafNode.parent;
      parent.removeChildren();
      parent.obj.visible = true;
    }
  }

  _createSector(address) {
    return new Sector(address, this._sphereRadius);
  }

  _splitSector(sector) {
    return [
      this._createSector([...sector.address, 0]),
      this._createSector([...sector.address, 1]),
      this._createSector([...sector.address, 2]),
      this._createSector([...sector.address, 3])
    ];
  }
}

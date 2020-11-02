import { Object3D } from 'three';
import { TreeNode } from '../../core/tree-node';
import { AxisEnum } from '../../enums/axis-enum';
import { CalcMisc } from '../../helpers/calc-misc';
import { debounce } from '../../helpers/debounce';
import { Sector } from './sector';

export class Engine {
  _depthLevel = null;
  _executionDebounceMs = null;
  _spectatorRef = null;
  _sphereRadius = null;
  _tree = null;
  
  get attractor() { return this._tree?.obj; }
  get depthLevel() { return this._depthLevel; }
  get executionDebounce() { return this._executionDebounceMs; }
  get spectatorRef() { return this._spectatorRef; }
  get sphereRadius() { return this._sphereRadius; }
  
  constructor() {
    this._tree = new TreeNode(new Object3D(), null);
  }

  initialize() {
    if (this.executionDebounce > 0) {
      this.execute = debounce(this.execute, this.executionDebounce);
    }

    let sectors = [
      this._createSector([AxisEnum.abscissaPositive]),
      this._createSector([AxisEnum.abscissaNegative]),
      this._createSector([AxisEnum.ordinatePositive]),
      this._createSector([AxisEnum.ordinateNegative]),
      this._createSector([AxisEnum.applicataPositive]),
      this._createSector([AxisEnum.applicataNegative])
    ];

    this._tree.setChildren(sectors);
    sectors.forEach(sector => sector.instantiate(this.attractor));
  }

  execute() {
    this._tree.traverseLeaves(this._work.bind(this));
  }

  _work(leafNode) {
    let spectatorLocalPosition = this.attractor.worldToLocal(this._spectatorRef.position.clone());
    let distance = CalcMisc.calcDistance(spectatorLocalPosition, leafNode.obj.center);
    let splitDistanceBoundary = this.sphereRadius / Math.pow(2, leafNode.level - 1) * 2;

    if (distance < splitDistanceBoundary && leafNode.level < this.depthLevel) {
      leafNode.obj.visible = false;
      leafNode.setChildren(this._splitSector(leafNode.obj));
      leafNode.children.forEach(childNode => childNode.obj.instantiate(this.attractor));
    } else if (distance > splitDistanceBoundary * 3 && leafNode.level > 1) {
      let parent = leafNode.parent;
      parent.children.forEach(childNode => childNode.obj.detach(this.attractor));
      parent.removeChildren();
      parent.obj.visible = true;
    }
  }

  _splitSector(sector) {
    return [
      this._createSector([...sector.address, 0]),
      this._createSector([...sector.address, 1]),
      this._createSector([...sector.address, 2]),
      this._createSector([...sector.address, 3])
    ];
  }

  _createSector(address) {
    return new Sector(address, this.sphereRadius);
  }
}
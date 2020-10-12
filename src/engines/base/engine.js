import { Object3D } from 'three';
import { AxisEnum } from '../core/axis-enum';
import { TreeNode } from '../core/tree-node';
import { debounce } from '../helpers/debounce';
import { Sector } from './sector';

export class Engine {
  #spectatorRef = null;
  #tree = null;
  #sphereRadius = 0;
  #depthLevel = 1;
  #executionDebounceMs = 0;

  get spectator() {
    return this.#spectatorRef;
  }
  set spectator(spectator) {
    this.#spectatorRef = spectator;
  }

  get attractor() {
    return this.#tree?.obj;
  }

  get sphereRadius() {
    return this.#sphereRadius;
  }
  set sphereRadius(val) {
    if (val < 0) {
      throw 'Sphere radius out of range. Must be greater than 0.';
    } else {
      this.#sphereRadius = val;
      this.initialize();
    }
  }

  get depthLevel() {
    return this.#depthLevel;
  }
  set depthLevel(val) {
    if (val < 1) {
      throw 'Depth level out of range. Must be greater than 1.';
    } else {
      this.#depthLevel = val;
      this.initialize();
    }
  }

  get executionDebounce() {
    return this.#executionDebounceMs;
  }
  set executionDebounce(val) {
    if (val < 0) {
      throw 'Execution debounce out of range. Must be greater than 0.';
    } else {
      this.#executionDebounceMs = val;
      this.initialize();
    }
  }

  initialize() {
    if (!this.spectator) {
      throw `Engine can not be initialized. Spectator is ${this.spectator.toString()}`;
    }

    this.#tree = new TreeNode(new Object3D(), null);
    if (this.executionDebounce > 0) {
      this.execute = debounce(this.execute, this.executionDebounce);
    }

    let sectors = [
      this.#createSector(AxisEnum.abscissaPositive),
      this.#createSector(AxisEnum.abscissaNegative),
      this.#createSector(AxisEnum.ordinatePositive),
      this.#createSector(AxisEnum.ordinateNegative),
      this.#createSector(AxisEnum.applicataPositive),
      this.#createSector(AxisEnum.applicataNegative)
    ];

    this.#tree.setChildren(sectors);

    for (let side of sectors) {
      side.instantiate(this.attractor);
    }
  }

  execute() {
    if (this.#tree) {
      this.#tree.traverseLeaves(this.#work);
    }
  }

  #work(leafNode) {
    let distance = leafNode.obj.getDistanceToMatter(this.spectator.position);
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

  #createSector(address, matrix) {
    return new Sector(address, matrix);
  }
}

import { Engine } from './engine';
import type { SectorMesh } from './sector-mesh';

export class EngineBuilder {
  _obj!: Engine;

  get allPropertiesSet(): boolean {
    return !!(this._obj._minLod && this._obj._maxLod && this._obj._sphereRadius);
  }

  constructor() {
    this.reset();
  }

  setLod(minLod: number, maxLod: number): this {
    if (minLod < 1 || maxLod < minLod) {
      throw 'LOD range out of range. Require 1 <= minLod <= maxLod.';
    } else {
      this._obj._minLod = minLod;
      this._obj._maxLod = maxLod;
      return this;
    }
  }

  setSphereRadius(val: number): this {
    if (val < 0) {
      throw 'Sphere radius out of range. Must be greater than 0.';
    } else {
      this._obj._sphereRadius = val;
      return this;
    }
  }

  setSectorMeshFactory(factory: () => SectorMesh): this {
    if (!factory) {
      throw 'Argument is out of range';
    } else {
      this._obj._sectorMeshFactory = factory;
      return this;
    }
  }

  getResult(): Engine {
    this._validate();
    return this._obj;
  }

  reset() {
    this._obj = new Engine();
  }

  _validate() {
    if (!this.allPropertiesSet) {
      throw 'Some of engine properties did not set!';
    }
  }
}

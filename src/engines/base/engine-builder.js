import { Engine } from './engine';

export class EngineBuilder {
  _obj = null;

  /**
   * @type {boolean}
   */
  get allPropertiesSet() {
    let result =
      this._obj._depthLevel &&
      this._obj._executionDebounceMs &&
      this._obj._spectatorRef &&
      this._obj._sphereRadius;

    return result;
  }

  constructor() {
    this.reset();
  }

  setDepthLevel(val) {
    if (val < 1) {
      throw 'Depth level out of range. Must be greater than 1.';
    } else {
      this._obj._depthLevel = val;
      return this;
    }
  }

  setExecutionDebounce(val) {
    if (val < 0) {
      throw 'Execution debounce out of range. Must be greater than 0.';
    } else {
      this._obj._executionDebounceMs = val;
      return this;
    }
  }

  setSpectatorRef(val) {
    if (!val) {
      throw 'Argument is out of range';
    } else {
      this._obj._spectatorRef = val;
      return this;
    }
  }

  setSphereRadius(val) {
    if (val < 0) {
      throw 'Sphere radius out of range. Must be greater than 0.';
    } else {
      this._obj._sphereRadius = val;
      return this;
    }
  }

  getResult() {
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
import { Group } from 'three';
import { LandmassEngine } from '../engines/landmass/landmass-engine';

export class PlanetProcessor {
  _radius = 0;
  _spectatorRef = null;
  _engines = new Array();
  _position = null;
  _engineGroup = null;
  
  get radius() {
    return this._radius;
  }
  set radius(val) {
    this._radius = val;
  }

  get position() {
    return this._position;
  }

  get object3d() {
    return this._engineGroup;
  }

  constructor(spectator, position) {
    this._spectatorRef = spectator;
    this._position = position;

    this._engineGroup = new Group();
  }

  createLandmass(lod, processFrequency) {
    let landmassEngine = new LandmassEngine(this._spectatorRef);
    landmassEngine.executionDebounce = processFrequency;
    landmassEngine.depthLevel = lod;
    landmassEngine.sphereRadius = this._radius;
    this._engineGroup.add(landmassEngine);
    landmassEngine.position.set(0, 0, 0);
    this._engines.push(landmassEngine);
  }

  process() {
    for (let engine of this._engines) {
      engine.execute();
    }
  }
}

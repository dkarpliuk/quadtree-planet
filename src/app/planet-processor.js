import { Group } from 'three';
import { LandmassEngineBuilder } from '../engines/landmass/landmass-engine-builder';

export class PlanetProcessor {
  _radius = 0;
  _spectatorRef = null;
  _engines = new Array();
  _engineGroup = null;
  _seed = 0;

  get object3d() { return this._engineGroup; }

  constructor(spectatorRef, position, radius, seed) {
    this._spectatorRef = spectatorRef;
    this._radius = radius;

    this._engineGroup = new Group();
    this._engineGroup.position.copy(position);
    this._seed = seed;
  }

  initialize() {
    for (let engine of this._engines) {
      engine.initialize();
      this._engineGroup.add(engine.attractor);
    }
  }

  createLandmass(lod, processFrequency) {
    let engine = new LandmassEngineBuilder()
      .setSpectatorRef(this._spectatorRef)
      .setSphereRadius(this._radius)
      .setDepthLevel(lod)
      .setExecutionDebounce(processFrequency)
      .seed(this._seed)
      .getResult();

    this._engines.push(engine);
  }

  process() {
    for (let engine of this._engines) {
      engine.execute();
    }
  }
}
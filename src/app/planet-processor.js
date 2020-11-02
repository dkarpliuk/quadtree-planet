import { Group } from 'three';
import { LandmassEngineBuilder } from '../engines/landmass/landmass-engine-builder';

export class PlanetProcessor {
  _radius = 0;
  _spectatorRef = null;
  _engines = new Array();
  _position = null;
  _engineGroup = null;

  get object3d() { return this._engineGroup; }

  constructor(spectatorRef, position, radius) {
    this._spectatorRef = spectatorRef;
    this._position = position;
    this._radius = radius;

    this._engineGroup = new Group();
  }

  initialize() {
    for (let engine of this._engines) {
      engine.initialize();
      engine.attractor.position.set(this._position);
      this._engineGroup.add(engine.attractor);
    }
  }

  createLandmass(lod, processFrequency) {
    let engine = new LandmassEngineBuilder()
      .setSpectatorRef(this._spectatorRef)
      .setSphereRadius(this._radius)
      .setDepthLevel(lod)
      .setExecutionDebounce(processFrequency)
      .getResult();

    this._engines.push(engine);
  }

  process() {
    for (let engine of this._engines) {
      engine.execute();
    }
  }
}
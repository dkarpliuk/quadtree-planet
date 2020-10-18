import { Group } from 'three';
import { LandmassEngine } from '../engines/landmass/landmass-engine';

export class PlanetProcessor {
  #radius = 0;
  #spectatorRef = null;
  #engines = new Array();
  #position = null;
  #engineGroup = null;

  get radius() {
    return this.#radius;
  }
  set radius(val) {
    this.#radius = val;
  }

  get position() {
    return this.#position;
  }

  constructor(spectator, position) {
    this.#spectatorRef = spectator;
    this.#position = position;

    this.#engineGroup = new Group();
  }

  createLandmass(lod, processFrequency) {
    let landmassEngine = new LandmassEngine(this.#spectatorRef);
    landmassEngine.executionDebounce = processFrequency;
    landmassEngine.depthLevel = lod;
    landmassEngine.sphereRadius = this.#radius;
    this.#engineGroup.add(landmassEngine);
    landmassEngine.position.set(0, 0, 0);
    this.#engines.push(landmassEngine);
  }

  process() {
    for (let engine of this.#engines) {
      engine.execute();
    }
  }
}

import { Group } from 'three';
import { throttle } from 'lodash-es';
import seedrandom from 'seedrandom';
import { createNoise3D } from 'simplex-noise';
import { EngineBuilder } from '../lod-processor';
import { NoiseProcessor } from './noise-processor';
import { LandmassSectorMesh } from './landmass-sector-mesh';

export class PlanetProcessor {
  _radius = 0;
  _spectatorRef = null;
  _engines = new Array();
  _engineGroup = null;
  _seed = 0;
  _processFrequency = 0;

  get object3d() { return this._engineGroup; }

  constructor(spectatorRef, position, radius, seed, processFrequency) {
    this._spectatorRef = spectatorRef;
    this._radius = radius;

    this._engineGroup = new Group();
    this._engineGroup.position.copy(position);
    this._seed = seed;
    this._processFrequency = processFrequency;

    if (processFrequency > 0) {
      this.process = throttle(this.process.bind(this), processFrequency, { trailing: false });
    }
  }

  initialize() {
    for (let engine of this._engines) {
      engine.initialize();
    }
  }

  createLandmass(minLod, maxLod) {
    let noiseProcessor = this._createNoiseProcessor();

    let engine = new EngineBuilder()
      .setSphereRadius(this._radius)
      .setLod(minLod, maxLod)
      .setSectorMeshFactory(() => new LandmassSectorMesh(this._radius, noiseProcessor))
      .getResult();

    engine.onSectorCreated = sector => this._engineGroup.add(sector.mesh);
    engine.onSectorRemoved = sector => this._engineGroup.remove(sector.mesh);

    this._engines.push(engine);
  }

  process() {
    for (let engine of this._engines) {
      engine.execute(this._getSpectatorLocalPosition());
    }
  }

  _getSpectatorLocalPosition() {
    return this._engineGroup.worldToLocal(this._spectatorRef.position.clone());
  }

  _createNoiseProcessor() {
    let random = seedrandom(this._seed);
    return new NoiseProcessor(createNoise3D(random));
  }
}

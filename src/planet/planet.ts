import { Group, Object3D, Vector3 } from 'three';
import { throttle } from 'lodash-es';
import seedrandom from 'seedrandom';
import { createNoise3D } from 'simplex-noise';
import { Engine, EngineBuilder } from '../lod-processor';
import { NoiseProcessor } from './noise-processor';
import { LandmassMesh } from './landmass-mesh';

export class Planet {
  private _radius: number;
  private _spectatorRef: Object3D;
  private _engines: Engine[] = [];
  private _engineGroup: Group;
  private _seed: number;

  get object3d(): Group { return this._engineGroup; }

  constructor(spectatorRef: Object3D, position: Vector3, radius: number, seed: number, processFrequency: number) {
    this._spectatorRef = spectatorRef;
    this._radius = radius;

    this._engineGroup = new Group();
    this._engineGroup.position.copy(position);
    this._seed = seed;

    if (processFrequency > 0)
      this.process = throttle(this.process.bind(this), processFrequency, { trailing: false });
  }

  initialize() {
    for (const engine of this._engines) {
      engine.initialize();
    }
  }

  createLandmass(minLod: number, maxLod: number) {
    const noiseProcessor = this._createNoiseProcessor();

    const engine = new EngineBuilder()
      .setSphereRadius(this._radius)
      .setLod(minLod, maxLod)
      .setSectorMeshFactory(() => new LandmassMesh(this._radius, noiseProcessor))
      .build();

    engine.onSectorCreated = sector => this._engineGroup.add(sector.mesh);
    engine.onSectorRemoved = sector => this._engineGroup.remove(sector.mesh);

    this._engines.push(engine);
  }

  process() {
    for (const engine of this._engines) {
      engine.execute(this._getSpectatorLocalPosition());
    }
  }

  private _getSpectatorLocalPosition = () =>
    this._engineGroup.worldToLocal(this._spectatorRef.position.clone());

  private _createNoiseProcessor(): NoiseProcessor {
    const random = seedrandom(this._seed.toString());
    return new NoiseProcessor(createNoise3D(random));
  }
}

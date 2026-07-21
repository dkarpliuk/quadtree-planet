import { Group, Object3D, Vector3 } from 'three';
import { throttle } from 'lodash-es';
import { Engine } from './lod-processor';
import { LandmassMesh } from './sector-mesh';

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

  createLandmass(minLod: number, maxLod: number, density: number) {
    const engine = new Engine({
      minLod,
      maxLod,
      sphereRadius: this._radius,
      density,
      sectorMeshFactory: () => new LandmassMesh(this._radius, this._seed),
    });

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
}

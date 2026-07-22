import { Group, Object3D, Vector3 } from 'three';

import { createLandmassLayer } from './layers/landmass';
import type { LayerView } from './layers/layer-view';
import { asyncThrottle } from './lib/async-throttle';

export class Planet {
  private _radius: number;
  private _spectatorRef: Object3D;
  private _group: Group;
  private _seed: number;
  private _layers: LayerView[] = [];

  get object3d(): Group { return this._group; }

  constructor(spectatorRef: Object3D, position: Vector3, radius: number, seed: number, updateFrequency: number) {
    this._spectatorRef = spectatorRef;
    this._radius = radius;

    this._group = new Group();
    this._group.position.copy(position);
    this._seed = seed;

    if (updateFrequency > 0)
      this.update = asyncThrottle(this.update.bind(this), updateFrequency);
  }

  async createLandmass(minLod: number, maxLod: number, density: number) {
    const layer = await createLandmassLayer({
      minLod,
      maxLod,
      sphereRadius: this._radius,
      density,
      seed: this._seed,
    });

    this._group.add(layer.object3d);
    this._layers.push(layer);
  }

  initialize() {
    for (const layer of this._layers) {
      layer.initialize();
    }
  }

  async update() {
    const spectatorLocalPosition = this._getSpectatorLocalPosition();
    await Promise.all(this._layers.map(layer => layer.update(spectatorLocalPosition)));
  }

  private _getSpectatorLocalPosition = () =>
    this._group.worldToLocal(this._spectatorRef.position.clone());
}

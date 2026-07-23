import type { PlanetConfig } from '@config/planet-config';
import { Group, Object3D } from 'three';

import { createLandmassLayer } from './layers/landmass';
import type { LayerView } from './layers/layer-view';
import { asyncThrottle } from './lib/async-throttle';

export class Planet {
  private _spectatorRef: Object3D;
  private _group: Group;
  private _layers: LayerView[] = [];

  get object3d(): Group { return this._group; }

  constructor(spectatorRef: Object3D, config: PlanetConfig) {
    this._spectatorRef = spectatorRef;
    this._group = new Group();

    if (config.updateFrequency > 0)
      this.update = asyncThrottle(this.update.bind(this), config.updateFrequency);
  }

  async createLandmass() {
    const layer = await createLandmassLayer();
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

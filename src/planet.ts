import { Group, Object3D, Vector3 } from 'three';

import { createLandmassLayer } from './layers/landmass';
import type { LayerView } from './layers/layer-view';

export class Planet {
  private _spectatorRef: Object3D;
  private _group: Group;
  private _layers: LayerView[] = [];
  private readonly _spectatorLocal = new Vector3();

  get object3d(): Group { return this._group; }

  constructor(spectatorRef: Object3D) {
    this._spectatorRef = spectatorRef;
    this._group = new Group();
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

  update() {
    this._spectatorLocal.copy(this._spectatorRef.position);
    this._group.worldToLocal(this._spectatorLocal);

    for (const layer of this._layers) {
      layer.update(this._spectatorLocal);
    }
  }
}

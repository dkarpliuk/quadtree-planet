import { Group } from 'three';

import type { EngineChunk, IChunkEngine, Vector3Like } from '../engine';
import { asyncThrottle } from '../lib/async-throttle';
import type { SectorMesh } from './sector-mesh';

/**
 * main-side half of a layer: drives its worker engine
 * and turns the geometry chunks it streams back into meshes under one group.
 */
export class LayerView {
  private readonly _engine: IChunkEngine;
  private readonly _createMesh: () => SectorMesh;
  private readonly _group = new Group();
  private readonly _meshes = new Map<string, SectorMesh>();

  get object3d(): Group { return this._group; }

  constructor(engine: IChunkEngine, createMesh: () => SectorMesh, updateFrequencyMs = 0) {
    this._engine = engine;
    this._createMesh = createMesh;

    if (updateFrequencyMs > 0)
      this.update = asyncThrottle(this.update.bind(this), updateFrequencyMs);
  }

  async initialize() {
    this._apply(await this._engine.initialize());
  }

  async update(spectatorLocalPosition: Vector3Like) {
    const chunk = await this._engine.execute(spectatorLocalPosition);
    this._apply(chunk);
  }

  private _apply(chunk: EngineChunk) {
    for (const address of chunk.removed) {
      const mesh = this._meshes.get(address);
      if (mesh) {
        this._meshes.delete(address);
        this._group.remove(mesh.mesh);
        mesh.dispose();
      }
    }

    for (const { address, buffer } of chunk.upserts) {
      let mesh = this._meshes.get(address);
      if (!mesh) {
        mesh = this._createMesh();
        mesh.load(buffer);
        this._meshes.set(address, mesh);
        this._group.add(mesh.mesh);
      } else {
        mesh.load(buffer);
      }
    }
  }
}

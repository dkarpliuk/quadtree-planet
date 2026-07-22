import { Group, Object3D, Vector3 } from 'three';
import { throttle } from 'lodash-es';
import type { EngineChunk, Vector3Like } from './engine';
import { SectorMesh } from './layers/sector-mesh';
import { createLandmassEngine, LandmassMesh } from './layers/landmass';

//main-side view of a layer's engine running in its worker
interface LayerEngine {
  initialize(): Promise<EngineChunk>;
  execute(spectator: Vector3Like): Promise<EngineChunk>;
}

interface Layer {
  engine: LayerEngine;
  meshes: Map<string, SectorMesh>;
  createMesh: () => SectorMesh;
}

export class Planet {
  private _radius: number;
  private _spectatorRef: Object3D;
  private _group: Group;
  private _seed: number;
  private _layers: Layer[] = [];

  get object3d(): Group { return this._group; }

  constructor(spectatorRef: Object3D, position: Vector3, radius: number, seed: number, processFrequency: number) {
    this._spectatorRef = spectatorRef;
    this._radius = radius;

    this._group = new Group();
    this._group.position.copy(position);
    this._seed = seed;

    if (processFrequency > 0)
      this.process = throttle(this.process.bind(this), processFrequency, { trailing: false });
  }

  async createLandmass(minLod: number, maxLod: number, density: number) {
    const engine = await createLandmassEngine({
      minLod,
      maxLod,
      sphereRadius: this._radius,
      density,
      seed: this._seed,
    });

    this._layers.push({ engine, meshes: new Map(), createMesh: () => new LandmassMesh() });
  }

  initialize() {
    for (const layer of this._layers) {
      layer.engine.initialize().then(chunk => this._applyChunk(layer, chunk));
    }
  }

  process() {
    const spectator = this._getSpectatorLocalPosition();
    for (const layer of this._layers) {
      layer.engine.execute(spectator).then(chunk => this._applyChunk(layer, chunk));
    }
  }

  private _applyChunk(layer: Layer, chunk: EngineChunk) {
    for (const address of chunk.removed) {
      const mesh = layer.meshes.get(address);
      if (!mesh) continue;

      this._group.remove(mesh.mesh);
      mesh.dispose();
      layer.meshes.delete(address);
    }

    for (const { address, buffer } of chunk.upserts) {
      let mesh = layer.meshes.get(address);
      const isNew = !mesh;
      if (!mesh) {
        mesh = layer.createMesh();
        layer.meshes.set(address, mesh);
      }

      mesh.load(buffer);
      if (isNew) this._group.add(mesh.mesh);
    }
  }

  private _getSpectatorLocalPosition = () =>
    this._group.worldToLocal(this._spectatorRef.position.clone());
}

import { Material, MeshStandardMaterial } from 'three';
import { SectorMesh } from '../lod-processor';
import type { NoiseSampler, OctaveNoiseOptions } from './noise-sampler';

const material = new MeshStandardMaterial({ color: 0xffffff });

const heightScale = 0.03;

export class LandmassMesh extends SectorMesh {
  private _sphereRadius: number;
  private _noiseSampler: NoiseSampler;
  private _noiseOptions: OctaveNoiseOptions;

  constructor(sphereRadius: number, noiseSampler: NoiseSampler) {
    super();
    this._sphereRadius = sphereRadius;
    this._noiseSampler = noiseSampler;
    this._noiseOptions = {
      octaves: 12,
      persistence: 0.5,
      frequency: 0.75,
      radius: sphereRadius
    };
  }

  protected get _material(): Material { return material; }

  getHeightOffset(vx: number, vy: number, vz: number): number {
    const noise = this._noiseSampler.getOctaveNoise(vx, vy, vz, this._noiseOptions);
    return noise * this._sphereRadius * heightScale;
  }
}

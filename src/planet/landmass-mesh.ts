import { Material, MeshStandardMaterial } from 'three';
import { SectorMesh } from '../lod-processor';
import type { NoiseSampler, OctaveNoiseOptions } from './noise-sampler';

const material = new MeshStandardMaterial({ color: 0xffffff });

const heightScale = 0.03;
const noiseOptions: OctaveNoiseOptions = {
  octaves: 12,
  persistence: 0.5,
  frequency: 0.00025
};

export class LandmassMesh extends SectorMesh {
  private _sphereRadius: number;
  private _noiseSampler: NoiseSampler;

  constructor(sphereRadius: number, noiseSampler: NoiseSampler) {
    super();
    this._sphereRadius = sphereRadius;
    this._noiseSampler = noiseSampler;
  }

  protected get _material(): Material { return material; }

  getHeightOffset(vx: number, vy: number, vz: number): number {
    const noise = this._noiseSampler.getOctaveNoise(vx, vy, vz, noiseOptions);
    return noise * this._sphereRadius * heightScale;
  }
}

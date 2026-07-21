import { Material, MeshStandardMaterial } from 'three';
import seedrandom from 'seedrandom';
import { createNoise3D } from 'simplex-noise';
import { SectorMesh } from './sector-mesh';
import { NoiseSampler, type OctaveNoiseOptions } from './noise-sampler';

const material = new MeshStandardMaterial({ color: 0xffffff });

const heightScale = 0.03;

export class LandmassMesh extends SectorMesh {
  //one sampler shared by every landmass sector
  private static _noiseSampler: NoiseSampler | null = null;

  private _sphereRadius: number;
  private _noiseOptions: OctaveNoiseOptions;

  constructor(sphereRadius: number, seed: number) {
    super();
    this._sphereRadius = sphereRadius;
    LandmassMesh._noiseSampler ??= new NoiseSampler(createNoise3D(seedrandom(String(seed))));
    this._noiseOptions = {
      octaves: 12,
      persistence: 0.5,
      frequency: 0.75,
      radius: sphereRadius
    };
  }

  protected get _material(): Material { return material; }

  getHeightOffset(vx: number, vy: number, vz: number): number {
    const noise = LandmassMesh._noiseSampler!.getOctaveNoise(vx, vy, vz, this._noiseOptions);
    return noise * this._sphereRadius * heightScale;
  }
}

import seedrandom from 'seedrandom';
import { createNoise3D } from 'simplex-noise';
import { Sector } from '../../engine';
import { NoiseSampler, type OctaveNoiseOptions } from './noise-sampler';

const heightScale = 0.03;

export class LandmassSector extends Sector {
  //one sampler shared by every landmass sector
  private static _noiseSampler: NoiseSampler | null = null;

  private _noiseOptions: OctaveNoiseOptions;

  constructor(sphereRadius: number, density: number, seed: number) {
    super(sphereRadius, density);
    LandmassSector._noiseSampler ??= new NoiseSampler(createNoise3D(seedrandom(String(seed))));
    this._noiseOptions = {
      octaves: 12,
      persistence: 0.5,
      frequency: 0.75,
      radius: sphereRadius,
    };
  }

  protected getHeightOffset(vx: number, vy: number, vz: number): number {
    const noise = LandmassSector._noiseSampler!.getOctaveNoise(vx, vy, vz, this._noiseOptions);
    return noise * this._sphereRadius * heightScale;
  }
}

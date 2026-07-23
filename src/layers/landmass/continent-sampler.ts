import { METER_UNITS } from '@config/common';
import type { ContinentOptions } from '@config/landmass-config';

import { NoiseSampler } from '../../lib/noise-sampler';
import { SimplexNoiseSampler } from '../../lib/simplex-noise-sampler';

const OCTAVES = 3;
const PERSISTENCE = 0.5;
const FLATNESS_MAX_EXPONENT = 4;

export class ContinentSampler {
  private readonly _noise: NoiseSampler;
  private readonly _flatnessExponent: number;

  constructor(seed: number, options: ContinentOptions) {
    this._noise = new SimplexNoiseSampler(seed, {
      octaves: OCTAVES,
      persistence: PERSISTENCE,
      frequency: 1 / (options.sizeMeters * METER_UNITS),
    });
    this._flatnessExponent = 1 + options.flatnessFactor * (FLATNESS_MAX_EXPONENT - 1);
  }

  sample(vx: number, vy: number, vz: number): number {
    const elevation = this._noise.getOctaveNoise(vx, vy, vz);

    return Math.sign(elevation) * Math.pow(Math.abs(elevation), this._flatnessExponent);
  }
}

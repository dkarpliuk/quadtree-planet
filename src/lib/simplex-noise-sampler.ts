import seedrandom from 'seedrandom';
import { createNoise3D } from 'simplex-noise';

import { type Noise3D, NoiseSampler, type OctaveNoiseOptions } from './noise-sampler';

export class SimplexNoiseSampler extends NoiseSampler {
  protected readonly noise: Noise3D;

  constructor(seed: number, options: OctaveNoiseOptions) {
    super(options);
    this.noise = createNoise3D(seedrandom(seed.toString()));
  }
}

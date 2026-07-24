import seedrandom from 'seedrandom';
import { createNoise3D } from 'simplex-noise';

import { Noise, type Noise3D, type OctaveNoiseOptions } from './noise';

export class SimplexNoise extends Noise {
  protected readonly noise: Noise3D;

  constructor(seed: number, options: OctaveNoiseOptions) {
    super(options);
    this.noise = createNoise3D(seedrandom(seed.toString()));
  }
}

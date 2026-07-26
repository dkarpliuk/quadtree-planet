import { type Coordinate, METER_UNITS } from '@config/common';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { Noise } from '../../lib/noise';
import { SimplexNoise } from '../../lib/simplex-noise';

const OCTAVES = 3;
const PERSISTENCE = 0.5;

//a hill is this many times wider than it is tall
const ROUGHNESS_ASPECT = 10;

export class RoughnessSampler {
  private readonly _noise: Noise;

  constructor() {
    const options = landmassConfig.value.terrain.roughness;
    this._noise = new SimplexNoise(planetConfig.value.seed + 4, {
      octaves: OCTAVES,
      persistence: PERSISTENCE,
      frequency: 1 / (options.heightMeters * ROUGHNESS_ASPECT * METER_UNITS),
    });
  }

  sample(coord: Coordinate): number {
    return (this._noise.getFbm(coord.x, coord.y, coord.z) + 1) / 2;
  }
}

import { type Coordinate, METER_UNITS } from '@config/common';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { ElevationProfileSampler } from '../../lib/elevation-profile-sampler';
import { Noise } from '../../lib/noise';
import { SimplexNoise } from '../../lib/simplex-noise';

const OCTAVES = 8;
const PERSISTENCE = 0.5;
const NOISE_STD = 0.246; //dev: std-calc

export class ContinentSampler {
  private readonly _noise: Noise;
  private readonly _profile: ElevationProfileSampler;

  constructor() {
    const options = landmassConfig.value.terrain.continents;
    const size = options.sizeMeters * METER_UNITS;
    this._noise = new SimplexNoise(planetConfig.value.seed, {
      octaves: OCTAVES,
      persistence: PERSISTENCE,
      frequency: 1 / size,
    });
    this._profile = new ElevationProfileSampler(options.elevationProfile, {
      noiseStd: NOISE_STD,
      landFactor: options.landFactor,
    });
    this._profile.warm();
  }

  sample(coord: Coordinate): number {
    return this._profile.sample(this._noise.getFbm(coord.x, coord.y, coord.z));
  }
}

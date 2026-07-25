import { METER_UNITS } from '@config/common';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { ElevationProfileSampler } from '../../lib/elevation-profile-sampler';
import { Noise } from '../../lib/noise';
import { SimplexNoise } from '../../lib/simplex-noise';

const OCTAVES = 8;
const PERSISTENCE = 0.5;

export class ContinentSampler {
  private readonly _noise: Noise;
  private readonly _profile: ElevationProfileSampler;

  constructor() {
    const options = landmassConfig.value.terrain.continents;
    this._noise = new SimplexNoise(planetConfig.value.seed, {
      octaves: OCTAVES,
      persistence: PERSISTENCE,
      frequency: 1 / (options.sizeMeters * METER_UNITS),
    });
    this._profile = new ElevationProfileSampler(options.elevationProfile);
    this._profile.warm();
  }

  sample(vx: number, vy: number, vz: number): number {
    return this._profile.sample(this._noise.getFbm(vx, vy, vz));
  }
}

import { METER_UNITS } from '@config/common';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { DomainWarp } from '../../lib/domain-warp';
import { ElevationProfileSampler } from '../../lib/elevation-profile-sampler';
import { Noise } from '../../lib/noise';
import { SimplexNoise } from '../../lib/simplex-noise';

const OCTAVES = 8;
const PERSISTENCE = 0.5;
const NOISE_STD = 0.246; //dev: std-calc

const WARP_OCTAVES = 6;
const WARP_PERSISTENCE = 0.5;

export class ContinentSampler {
  private readonly _noise: Noise;
  private readonly _warp: DomainWarp;
  private readonly _profile: ElevationProfileSampler;

  constructor() {
    const options = landmassConfig.value.terrain.continents;
    const size = options.sizeMeters * METER_UNITS;
    this._noise = new SimplexNoise(planetConfig.value.seed, {
      octaves: OCTAVES,
      persistence: PERSISTENCE,
      frequency: 1 / size,
    });
    this._warp = new DomainWarp(planetConfig.value.seed + 1, size * options.tectonicFactor, {
      octaves: WARP_OCTAVES,
      persistence: WARP_PERSISTENCE,
      frequency: 1 / size,
    });
    this._profile = new ElevationProfileSampler(options.elevationProfile, {
      noiseStd: NOISE_STD
    });
    this._profile.warm();
  }

  sample(vx: number, vy: number, vz: number): number {
    const [wx, wy, wz] = this._warp.apply(vx, vy, vz);
    return this._profile.sample(this._noise.getFbm(wx, wy, wz));
  }
}

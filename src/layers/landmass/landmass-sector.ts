import { METER_UNITS } from '@config/constants';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { Sector } from '../../engine';
import { continentSampler } from './continent-sampler';
import { mountainSampler } from './mountain-sampler';
import { roughnessSampler } from './roughness-sampler';
import { createTerrainSample } from './terrain-sample';

export class LandmassSector extends Sector {
  private readonly _sample = createTerrainSample();

  constructor() {
    super(planetConfig.value.radiusMeters * METER_UNITS, landmassConfig.value.density);
  }

  protected getHeightOffset(vx: number, vy: number, vz: number): number {
    const sample = this._sample;
    sample.raw.x = vx;
    sample.raw.y = vy;
    sample.raw.z = vz;
    sample.base = 0;

    continentSampler.apply(sample);
    mountainSampler.apply(sample);
    roughnessSampler.apply(sample);

    return sample.base * METER_UNITS;
  }
}

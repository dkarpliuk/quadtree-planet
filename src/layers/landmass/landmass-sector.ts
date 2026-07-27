import { METER_UNITS } from '@config/constants';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { Sector } from '../../engine';
import { continentSampler } from './continent-sampler';
import { mountainSampler } from './mountain-sampler';
import { roughnessSampler } from './roughness-sampler';

export class LandmassSector extends Sector {
  constructor() {
    super(planetConfig.value.radiusMeters * METER_UNITS, landmassConfig.value.density);
  }

  protected getHeightOffset(vx: number, vy: number, vz: number): number {
    const raw = { x: vx, y: vy, z: vz };

    let { height: base, warped: continentWarped } = continentSampler.sample(raw);
    base += mountainSampler.sample({ raw, continentWarped, base });
    base += roughnessSampler.sample({ raw, continentWarped, base });

    return base * METER_UNITS;
  }
}

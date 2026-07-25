import { METER_UNITS } from '@config/common';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { Sector } from '../../engine';
import { ContinentSampler } from './continent-sampler';

export class LandmassSector extends Sector {
  private static _continent: ContinentSampler | null = null;

  constructor() {
    super(planetConfig.value.radiusMeters * METER_UNITS, landmassConfig.value.density);
    LandmassSector._continent ??= new ContinentSampler();
  }

  protected getHeightOffset(vx: number, vy: number, vz: number): number {
    return LandmassSector._continent!.sample(vx, vy, vz) * METER_UNITS;
  }
}

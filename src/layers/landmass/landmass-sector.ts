import { METER_UNITS } from '@config/common';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { Sector } from '../../engine';
import { ContinentSampler } from './continent-sampler';

export class LandmassSector extends Sector {
  private static _continent: ContinentSampler | null = null;

  private _amplitude: number;

  constructor() {
    super(planetConfig.value.radiusMeters * METER_UNITS, landmassConfig.value.density);

    const { amplitudeMeters, continents } = landmassConfig.value.terrain;
    this._amplitude = amplitudeMeters * METER_UNITS;
    LandmassSector._continent ??= new ContinentSampler(planetConfig.value.seed, continents);
  }

  protected getHeightOffset(vx: number, vy: number, vz: number): number {
    return LandmassSector._continent!.sample(vx, vy, vz) * this._amplitude;
  }
}

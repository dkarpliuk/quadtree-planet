import { METER_UNITS } from '@config/common';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { Sector } from '../../engine';
import { ContinentSampler } from './continent-sampler';

export class LandmassSector extends Sector {
  private static _continent: ContinentSampler | null = null;
  private _continentAmplitude: number;

  constructor() {
    super(planetConfig.value.radiusMeters * METER_UNITS, landmassConfig.value.density);
    const { amplitudeMeters } = landmassConfig.value.terrain.continents;
    this._continentAmplitude = amplitudeMeters * METER_UNITS;
    LandmassSector._continent ??= new ContinentSampler();
  }

  protected getHeightOffset(vx: number, vy: number, vz: number): number {
    const continentNoise = LandmassSector._continent!.sample(vx, vy, vz);
    return continentNoise * this._continentAmplitude;
  }
}

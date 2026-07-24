import { METER_UNITS } from '@config/common';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { Sector } from '../../engine';
import { ContinentSampler } from './continent-sampler';
import { MountainSampler } from './mountain-sampler';

export class LandmassSector extends Sector {
  private static _continent: ContinentSampler | null = null;
  private static _mountain: MountainSampler | null = null;

  private _continentAmplitude: number;

  constructor() {
    super(planetConfig.value.radiusMeters * METER_UNITS, landmassConfig.value.density);
    const { amplitudeMeters } = landmassConfig.value.terrain.continents;
    this._continentAmplitude = amplitudeMeters * METER_UNITS;
    
    LandmassSector._continent ??= new ContinentSampler();
    LandmassSector._mountain ??= new MountainSampler();
  }

  protected getHeightOffset(vx: number, vy: number, vz: number): number {
    const continentHeight = LandmassSector._continent!.sample(vx, vy, vz) * this._continentAmplitude;
    const mountainHeight = LandmassSector._mountain!.sample(vx, vy, vz, continentHeight);

    return continentHeight + mountainHeight;
  }
}

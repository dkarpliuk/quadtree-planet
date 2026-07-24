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

    const { continents, mountains } = landmassConfig.value.terrain;
    const seed = planetConfig.value.seed;
    this._continentAmplitude = continents.amplitudeMeters * METER_UNITS;
    LandmassSector._continent ??= new ContinentSampler(seed, continents);
    LandmassSector._mountain ??= new MountainSampler(seed, mountains);
  }

  protected getHeightOffset(vx: number, vy: number, vz: number): number {
    const continent = LandmassSector._continent!.sample(vx, vy, vz);

    return continent * this._continentAmplitude;
  }
}

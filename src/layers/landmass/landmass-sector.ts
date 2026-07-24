import { METER_UNITS } from '@config/common';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';
import { waterConfig } from '@config/water-config';

import { Sector } from '../../engine';
import { ContinentSampler } from './continent-sampler';
import { MountainSampler } from './mountain-sampler';

export class LandmassSector extends Sector {
  private static _continent: ContinentSampler | null = null;
  private static _mountain: MountainSampler | null = null;

  private _continentAmplitude: number;
  private _mountainAmplitude: number;
  private _seaLevel: number;
  private _shoreWidth: number;

  constructor() {
    super(planetConfig.value.radiusMeters * METER_UNITS, landmassConfig.value.density);

    const { continents, mountains } = landmassConfig.value.terrain;
    const seed = planetConfig.value.seed;
    this._continentAmplitude = continents.amplitudeMeters * METER_UNITS;
    this._mountainAmplitude = mountains.amplitudeMeters * METER_UNITS;
    this._seaLevel = waterConfig.value.seaLevelMeters / continents.amplitudeMeters;
    this._shoreWidth = continents.shoreWidthMeters / continents.amplitudeMeters;
    LandmassSector._continent ??= new ContinentSampler(seed, continents);
    LandmassSector._mountain ??= new MountainSampler(seed, mountains);
  }

  protected getHeightOffset(vx: number, vy: number, vz: number): number {
    const continent = LandmassSector._continent!.sample(vx, vy, vz);
    const t = Math.min(Math.max((continent - this._seaLevel) / this._shoreWidth, 0), 1);
    const land = t * t * (3 - 2 * t);
    const mountains = LandmassSector._mountain!.sample(vx, vy, vz) * land;

    return continent * this._continentAmplitude + mountains * this._mountainAmplitude;
  }
}

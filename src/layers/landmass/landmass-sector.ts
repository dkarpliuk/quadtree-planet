import { METER_UNITS } from '@config/common';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { Sector } from '../../engine';
import { smoothstep } from '../../lib/math';
import { ContinentSampler } from './continent-sampler';
import { MountainSampler } from './mountain-sampler';

//fraction of the mountain height over which they fade in from the coast
const COAST_FACTOR = 0.05;

export class LandmassSector extends Sector {
  private static _continent: ContinentSampler | null = null;
  private static _mountain: MountainSampler | null = null;

  private readonly _maxHeight: number;
  private readonly _coastWidth: number;

  constructor() {
    super(planetConfig.value.radiusMeters * METER_UNITS, landmassConfig.value.density);
    this._maxHeight = landmassConfig.value.terrain.mountains.maxHeightMeters;
    this._coastWidth = COAST_FACTOR * this._maxHeight;
    LandmassSector._continent ??= new ContinentSampler();
    LandmassSector._mountain ??= new MountainSampler();
  }

  protected getHeightOffset(vx: number, vy: number, vz: number): number {
    const continent = LandmassSector._continent!.sample(vx, vy, vz);
    const ceiling = this._maxHeight * smoothstep(0, this._coastWidth, continent);
    const headroom = Math.max(0, ceiling - continent);
    const mountains = LandmassSector._mountain!.sample(vx, vy, vz) * headroom;

    return (continent + mountains) * METER_UNITS;
  }
}

import { METER_UNITS } from '@config/common';
import { planetConfig } from '@config/planet-config';
import { waterConfig } from '@config/water-config';

import { Sector } from '../../engine';

export class WaterSector extends Sector {
  private _seaLevel: number;

  constructor() {
    super(planetConfig.value.radiusMeters * METER_UNITS, waterConfig.value.density);
    this._seaLevel = waterConfig.value.seaLevelMeters * METER_UNITS;
  }

  protected getHeightOffset(): number {
    return this._seaLevel;
  }
}


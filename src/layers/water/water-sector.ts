import { METER_UNITS } from '@config/common';
import { planetConfig } from '@config/planet-config';
import { waterConfig } from '@config/water-config';

import { Sector } from '../../engine';

export class WaterSector extends Sector {
  constructor() {
    super(planetConfig.value.radiusMeters * METER_UNITS, waterConfig.value.density);
  }
}

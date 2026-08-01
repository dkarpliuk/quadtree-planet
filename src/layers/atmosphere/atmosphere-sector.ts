import { atmosphereConfig, shellHeightMeters } from '@config/atmosphere-config';
import { METER_UNITS } from '@config/constants';
import { planetConfig } from '@config/planet-config';

import { Sector } from '../../engine';

export class AtmosphereSector extends Sector {
  constructor() {
    super(
      (planetConfig.value.radiusMeters + shellHeightMeters()) * METER_UNITS,
      atmosphereConfig.value.density,
    );
  }
}

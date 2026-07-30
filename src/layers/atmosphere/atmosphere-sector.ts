import { atmosphereConfig } from '@config/atmosphere-config';
import { METER_UNITS } from '@config/constants';
import { planetConfig } from '@config/planet-config';

import { Sector } from '../../engine';

export class AtmosphereSector extends Sector {
  constructor() {
    const atmosphere = atmosphereConfig.value;
    super(
      (planetConfig.value.radiusMeters + atmosphere.heightMeters) * METER_UNITS,
      atmosphere.density,
    );
  }
}

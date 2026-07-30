import { atmosphereConfig } from '@config/atmosphere-config';
import { warmConfig } from '@config/config-service';
import { METER_UNITS } from '@config/constants';
import { planetConfig } from '@config/planet-config';
import { expose } from 'comlink';

import { ChunkEngine } from '../../engine';
import { AtmosphereSector } from './atmosphere-sector';

await warmConfig();

export class AtmosphereWorker extends ChunkEngine<AtmosphereSector> {
  constructor() {
    const atmosphere = atmosphereConfig.value;
    super({
      minLod: atmosphere.minLod,
      maxLod: atmosphere.maxLod,
      density: atmosphere.density,
      sphereRadius: (planetConfig.value.radiusMeters + atmosphere.heightMeters) * METER_UNITS,
      sectorFactory: () => new AtmosphereSector(),
    });
  }
}

expose(AtmosphereWorker);

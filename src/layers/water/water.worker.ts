import { warmConfig } from '@config/config-service';
import { METER_UNITS } from '@config/constants';
import { planetConfig } from '@config/planet-config';
import { waterConfig } from '@config/water-config';
import { expose } from 'comlink';

import { ChunkEngine } from '../../engine';
import { WaterSector } from './water-sector';

await warmConfig();

export class WaterWorker extends ChunkEngine<WaterSector> {
  constructor() {
    const water = waterConfig.value;
    super({
      minLod: water.minLod,
      maxLod: water.maxLod,
      density: water.density,
      sphereRadius: planetConfig.value.radiusMeters * METER_UNITS,
      sectorFactory: () => new WaterSector(),
    });
  }
}

expose(WaterWorker);

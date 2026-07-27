import { warmConfig } from '@config/config-service';
import { METER_UNITS } from '@config/constants';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';
import { expose } from 'comlink';

import { ChunkEngine } from '../../engine';
import { continentSampler } from './continent-sampler';
import { LandmassSector } from './landmass-sector';
import { mountainSampler } from './mountain-sampler';
import { roughnessSampler } from './roughness-sampler';

//warm the config before the engine is built, so the constructor can read it
await warmConfig();

//warm feature-samplers
continentSampler.warm();
mountainSampler.warm();
roughnessSampler.warm();

//worker bundle root: builds the engine with a landmass sector factory
export class LandmassWorker extends ChunkEngine<LandmassSector> {
  constructor() {
    const landmass = landmassConfig.value;
    super({
      minLod: landmass.minLod,
      maxLod: landmass.maxLod,
      density: landmass.density,
      sphereRadius: planetConfig.value.radiusMeters * METER_UNITS,
      sectorFactory: () => new LandmassSector(),
    });
  }
}

expose(LandmassWorker);

import { expose } from 'comlink';
import { EngineWorker } from '../../engine';
import { LandmassSector } from './landmass-sector';
import type { LandmassParams } from './types';

//worker bundle root: builds the engine with a landmass sector factory
export class LandmassEngineWorker extends EngineWorker<LandmassSector> {
  constructor(params: LandmassParams) {
    super({
      minLod: params.minLod,
      maxLod: params.maxLod,
      sphereRadius: params.sphereRadius,
      density: params.density,
      sectorFactory: () => new LandmassSector(params.sphereRadius, params.density, params.seed),
    });
  }
}

expose(LandmassEngineWorker);

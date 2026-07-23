import { METER_UNITS } from '@config/common';
import { landmassConfig, type TerrainOptions } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';
import seedrandom from 'seedrandom';
import { createNoise3D } from 'simplex-noise';

import { Sector } from '../../engine';
import { NoiseSampler, type OctaveNoiseOptions } from './noise-sampler';

export class LandmassSector extends Sector {
  //one sampler shared by every landmass sector
  private static _noiseSampler: NoiseSampler | null = null;
  private _noiseOptions: OctaveNoiseOptions;
  private _terrainOptions: TerrainOptions;
  
  constructor() {
    const radius = planetConfig.value.radiusMeters * METER_UNITS;
    super(radius, landmassConfig.value.density);
    const seed = planetConfig.value.seed.toString();
    LandmassSector._noiseSampler ??= new NoiseSampler(createNoise3D(seedrandom(seed)));
    this._terrainOptions = landmassConfig.value.terrain;
    this._noiseOptions = {
      octaves: this._terrainOptions.noiseOctaves,
      persistence: this._terrainOptions.noisePersistence,
      frequency: this._terrainOptions.noiseFrequency / radius,
    };
  }

  protected getHeightOffset(vx: number, vy: number, vz: number): number {
    const noise = LandmassSector._noiseSampler!.getOctaveNoise(vx, vy, vz, this._noiseOptions);
    return noise * this._sphereRadius * this._terrainOptions.heightScale;
  }
}

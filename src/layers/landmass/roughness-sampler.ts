import { METER_UNITS } from '@config/constants';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { smoothstep } from '../../lib/math';
import { Noise } from '../../lib/noise';
import { SimplexNoise } from '../../lib/simplex-noise';
import type { Coordinate } from '../../lib/types';

const OCTAVES = 3;
const PERSISTENCE = 0.6;

//a hill is this many times wider than it is tall
const ROUGHNESS_ASPECT = 30;

//a roughness region is this many times wider than a hill
const REGION_ASPECT = 5;

//how soft the region border is: 0 is a hard edge, 0.5 fades over the whole noise range
const REGION_SOFTNESS = 0.5;

//fraction of the hill height over which they fade in from the coast
const COAST_FACTOR = 0.05;

export interface RoughnessSampleOptions {
  raw: Coordinate;
  continentWarped: Coordinate;
  base: number;
}

class RoughnessSampler {
  private _noise!: Noise;
  private _region!: Noise;
  private _height!: number;
  private _coast!: number;
  private _waterEnabled!: boolean;

  warm(): void {
    const options = landmassConfig.value.terrain.roughness;
    const seed = planetConfig.value.seed;
    this._noise = new SimplexNoise(seed + 4, {
      octaves: OCTAVES,
      persistence: PERSISTENCE,
      frequency: 1 / (options.heightMeters * ROUGHNESS_ASPECT * METER_UNITS),
    });
    this._region = new SimplexNoise(seed + 6, {
      octaves: 2,
      persistence: 1,
      frequency: 1 / (options.heightMeters * ROUGHNESS_ASPECT * REGION_ASPECT * METER_UNITS),
    });
    this._height = options.heightMeters;
    this._coast = COAST_FACTOR * options.heightMeters;
    this._waterEnabled = planetConfig.value.waterEnabled;
  }

  sample({ raw, continentWarped, base }: RoughnessSampleOptions): number {
    //hills fill wherever the region noise is positive, blending across a band around its sign flip
    const region = this._region.getFbm(continentWarped.x, continentWarped.y, continentWarped.z);
    if (region <= -REGION_SOFTNESS) return 0;

    const mask = smoothstep(-REGION_SOFTNESS, REGION_SOFTNESS, region);
    const hills = this._noise.getBillow(raw.x, raw.y, raw.z) * mask;
    if (!this._waterEnabled) return hills * this._height;

    //fade to the waterline so hills never surface as islands or texture the coast
    const distance = Math.abs(base);
    const ceiling = Math.min(this._height, distance);

    return hills * ceiling * smoothstep(0, this._coast, distance);
  }
}

export const roughnessSampler = new RoughnessSampler();

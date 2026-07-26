import { METER_UNITS } from '@config/common';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { smoothstep } from '../../lib/math';
import { Noise } from '../../lib/noise';
import { SimplexNoise } from '../../lib/simplex-noise';

const RIDGE_OCTAVES = 4;
const RIDGE_PERSISTENCE = 0.5;
const REGION_OCTAVES = 2;
const REGION_PERSISTENCE = 0.5;

//a mountain is this many times wider than it is tall
const MOUNTAIN_ASPECT = 6;

//width of the region border fade, in region-noise units (smaller = tighter border)
const REGION_FADE = 0.15;

export class MountainSampler {
  private readonly _ridge: Noise;
  private readonly _region: Noise;
  private readonly _regionThreshold: number;

  constructor() {
    const options = landmassConfig.value.terrain.mountains;
    const seed = planetConfig.value.seed;
    this._ridge = new SimplexNoise(seed + 2, {
      octaves: RIDGE_OCTAVES,
      persistence: RIDGE_PERSISTENCE,
      frequency: 1 / (options.maxHeightMeters * MOUNTAIN_ASPECT * METER_UNITS),
    });
    this._region = new SimplexNoise(seed + 3, {
      octaves: REGION_OCTAVES,
      persistence: REGION_PERSISTENCE,
      frequency: 1 / (options.regionSizeMeters * METER_UNITS),
    });
    this._regionThreshold = 1 - options.coverageFactor;
  }

  sample(vx: number, vy: number, vz: number): number {
    const region = (this._region.getFbm(vx, vy, vz) + 1) / 2;
    if (region <= this._regionThreshold) return 0;

    const mask = smoothstep(this._regionThreshold, this._regionThreshold + REGION_FADE, region);
    return this._ridge.getRidgedFbm(vx, vy, vz) * mask;
  }
}

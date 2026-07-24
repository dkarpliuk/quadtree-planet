import { METER_UNITS } from '@config/common';
import type { MountainOptions } from '@config/landmass-config';

import { NoiseSampler } from '../../lib/noise-sampler';
import { SimplexNoiseSampler } from '../../lib/simplex-noise-sampler';

const RIDGE_OCTAVES = 4;
const RIDGE_PERSISTENCE = 0.5;
const REGION_OCTAVES = 2;
const REGION_PERSISTENCE = 0.5;

//a mountain is this many times wider than it is tall (realistic ~25-30° slopes)
const MOUNTAIN_ASPECT = 4;

export class MountainSampler {
  private readonly _ridge: NoiseSampler;
  private readonly _region: NoiseSampler;
  private readonly _regionThreshold: number;

  constructor(seed: number, options: MountainOptions) {
    this._ridge = new SimplexNoiseSampler(seed + 1, {
      octaves: RIDGE_OCTAVES,
      persistence: RIDGE_PERSISTENCE,
      frequency: 1 / (options.amplitudeMeters * MOUNTAIN_ASPECT * METER_UNITS),
    });
    this._region = new SimplexNoiseSampler(seed + 2, {
      octaves: REGION_OCTAVES,
      persistence: REGION_PERSISTENCE,
      frequency: 1 / (options.regionSizeMeters * METER_UNITS),
    });
    this._regionThreshold = 1 - options.coverageFactor;
  }

  sample(vx: number, vy: number, vz: number): number {
    const region = (this._region.getOctaveNoise(vx, vy, vz) + 1) / 2;
    if (region <= this._regionThreshold) return 0;

    const mask = (region - this._regionThreshold) / (1 - this._regionThreshold);
    return this._ridge.getRidged(vx, vy, vz) * mask;
  }
}

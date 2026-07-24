import { METER_UNITS } from '@config/common';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { DomainWarp } from '../../lib/domain-warp';
import { smoothstep } from '../../lib/math';
import { NoiseSampler } from '../../lib/noise-sampler';
import { SimplexNoiseSampler } from '../../lib/simplex-noise-sampler';

const RIDGE_OCTAVES = 4;
const RIDGE_PERSISTENCE = 0.5;
const REGION_OCTAVES = 2;
const REGION_PERSISTENCE = 0.5;
const WARP_OCTAVES = 1;

//a mountain is this many times wider than it is tall (realistic ~25-30° slopes)
const MOUNTAIN_ASPECT = 4;

export class MountainSampler {
  private readonly _ridge: NoiseSampler;
  private readonly _region: NoiseSampler;
  private readonly _warp: DomainWarp;
  private readonly _regionThreshold: number;
  private readonly _maxHeight: number;
  private readonly _coastHeight: number;

  constructor() {
    const { mountains, continents } = landmassConfig.value.terrain;
    const seed = planetConfig.value.seed;

    this._ridge = new SimplexNoiseSampler(seed + 1, {
      octaves: RIDGE_OCTAVES,
      persistence: RIDGE_PERSISTENCE,
      frequency: 1 / (mountains.maxHeightMeters * MOUNTAIN_ASPECT * METER_UNITS),
    });
    this._warp = new DomainWarp(seed + 7, mountains.warpStrengthMeters * METER_UNITS, {
      octaves: WARP_OCTAVES,
      persistence: RIDGE_PERSISTENCE,
      frequency: 1 / (mountains.warpSizeMeters * METER_UNITS),
    });
    this._region = new SimplexNoiseSampler(seed + 2, {
      octaves: REGION_OCTAVES,
      persistence: REGION_PERSISTENCE,
      frequency: 1 / (mountains.regionSizeMeters * METER_UNITS),
    });
    this._regionThreshold = 1 - mountains.coverageFactor;
    this._maxHeight = mountains.maxHeightMeters * METER_UNITS;
    this._coastHeight = continents.coastHeightMeters * METER_UNITS;
  }

  sample(vx: number, vy: number, vz: number, continentHeight: number): number {
    const [wx, wy, wz] = this._warp.apply(vx, vy, vz);
    const region = (this._region.getOctaveNoise(wx, wy, wz) + 1) / 2;
    if (region <= this._regionThreshold) return 0;

    const mask = (region - this._regionThreshold) / (1 - this._regionThreshold);
    const ridge = this._ridge.getRidged(vx, vy, vz) * mask;

    let amplitude: number;
    if (continentHeight < 0) {
      //ocean floor: rise up to the waterline, so amplitude is the depth
      amplitude = -continentHeight;
    } else if (continentHeight < this._coastHeight) {
      //coast: fade in over the shore band
      amplitude = smoothstep(0, this._coastHeight, continentHeight) * (this._maxHeight - continentHeight);
    } else {
      //inland: fill the room left up to the max mountain height
      amplitude = this._maxHeight - continentHeight;
    }

    return ridge * amplitude;
  }
}

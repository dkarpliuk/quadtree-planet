import { METER_UNITS } from '@config/constants';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { lerp3D, smoothstep } from '../../lib/math';
import { Noise } from '../../lib/noise';
import { SimplexNoise } from '../../lib/simplex-noise';
import type { Coordinate } from '../../lib/types';
import type { TerrainSample } from './terrain-sample';

const RIDGE_OCTAVES = 6;
const RIDGE_PERSISTENCE = 0.5;
const RIDGE_CREASE = 0.9;
const RIDGE_GAIN = 0.6;

const REGION_OCTAVES = 2;
const REGION_PERSISTENCE = 0.5;

//a mountain is this many times wider than it is tall
const MOUNTAIN_ASPECT = 6;

//width of the region border fade, in region-noise units (smaller = tighter border)
const REGION_FADE = 0.3;

//fraction of the mountain height over which they fade in from the coast
const COAST_FACTOR = 0.05;

//extra warp strength for mountain regions, relative to the continent warp
const MOUNTAIN_WARP = 2;

class MountainSampler {
  private _noise!: Noise;
  private _region!: Noise;
  private _regionThreshold!: number;
  private _maxHeight!: number;
  private _coast!: number;

  //reused so that a vertex costs no allocations
  private readonly _warped: Coordinate = { x: 0, y: 0, z: 0 };

  warm(): void {
    const options = landmassConfig.value.terrain.mountains;
    const seed = planetConfig.value.seed;
    this._noise = new SimplexNoise(seed + 2, {
      octaves: RIDGE_OCTAVES,
      persistence: RIDGE_PERSISTENCE,
      frequency: 1 / (options.maxHeightMeters * MOUNTAIN_ASPECT * METER_UNITS),
      crease: RIDGE_CREASE,
      gain: RIDGE_GAIN,
    });
    this._region = new SimplexNoise(seed + 3, {
      octaves: REGION_OCTAVES,
      persistence: REGION_PERSISTENCE,
      frequency: 1 / (options.regionSizeMeters * METER_UNITS),
    });
    this._regionThreshold = 1 - options.coverageFactor;
    this._maxHeight = options.maxHeightMeters;
    this._coast = COAST_FACTOR * options.maxHeightMeters;
  }

  apply(sample: TerrainSample): void {
    const { raw, base } = sample;
    const warped = this._warped;
    lerp3D(raw, sample.continentWarped, MOUNTAIN_WARP, warped);
    const region = (this._region.getFbm(warped.x, warped.y, warped.z) + 1) / 2;
    if (region <= this._regionThreshold) return;

    //room left under the coast-faded ceiling, so underwater ridges rise only up to the waterline
    const headroom = Math.max(0, this._maxHeight * smoothstep(0, this._coast, base) - base);
    const mask = smoothstep(this._regionThreshold, this._regionThreshold + REGION_FADE, region);

    sample.base += this._noise.getRidged(raw.x, raw.y, raw.z) * mask * headroom;
  }
}

export const mountainSampler = new MountainSampler();

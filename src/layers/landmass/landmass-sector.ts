import { type Coordinate, METER_UNITS } from '@config/common';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { Sector } from '../../engine';
import { DomainWarp } from '../../lib/domain-warp';
import { smoothstep } from '../../lib/math';
import { ContinentSampler } from './continent-sampler';
import { MountainSampler } from './mountain-sampler';

//fraction of the mountain height over which they fade in from the coast
const COAST_FACTOR = 0.05;

const WARP_OCTAVES = 6;
const WARP_PERSISTENCE = 0.5;

//extra warp strength for mountain regions, relative to the continent warp
const MOUNTAIN_WARP = 2;

//scales the shared warp displacement (warped - raw) by a factor, no extra noise sampling
function scaleWarp(raw: Coordinate, warped: Coordinate, factor: number): Coordinate {
  return {
    x: raw.x + factor * (warped.x - raw.x),
    y: raw.y + factor * (warped.y - raw.y),
    z: raw.z + factor * (warped.z - raw.z),
  };
}

export class LandmassSector extends Sector {
  private static _continent: ContinentSampler | null = null;
  private static _mountain: MountainSampler | null = null;
  private static _continentWarp: DomainWarp | null = null;

  private readonly _maxHeight: number;
  private readonly _coastWidth: number;

  constructor() {
    super(planetConfig.value.radiusMeters * METER_UNITS, landmassConfig.value.density);
    this._maxHeight = landmassConfig.value.terrain.mountains.maxHeightMeters;
    this._coastWidth = COAST_FACTOR * this._maxHeight;
    LandmassSector._continent ??= new ContinentSampler();
    LandmassSector._mountain ??= new MountainSampler();
    LandmassSector._continentWarp ??= LandmassSector.buildContinentWarp();
  }

  private static buildContinentWarp(): DomainWarp {
    const continents = landmassConfig.value.terrain.continents;
    const size = continents.sizeMeters * METER_UNITS;
    return new DomainWarp(planetConfig.value.seed + 1, size * continents.tectonicFactor, {
      octaves: WARP_OCTAVES,
      persistence: WARP_PERSISTENCE,
      frequency: 1 / size,
    });
  }

  protected getHeightOffset(vx: number, vy: number, vz: number): number {
    const raw = { x: vx, y: vy, z: vz };
    const warped = LandmassSector._continentWarp!.apply(raw);

    const continent = LandmassSector._continent!.sample(warped);
    const ceiling = this._maxHeight * smoothstep(0, this._coastWidth, continent);
    const headroom = Math.max(0, ceiling - continent);

    const mountainWarped = scaleWarp(raw, warped, MOUNTAIN_WARP);
    const mountains = LandmassSector._mountain!.sample(raw, mountainWarped) * headroom;

    return (continent + mountains) * METER_UNITS;
  }
}

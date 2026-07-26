import { type Coordinate, KM, METER_UNITS } from '@config/common';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { Sector } from '../../engine';
import { DomainWarp } from '../../lib/domain-warp';
import { smoothstep } from '../../lib/math';
import { ContinentSampler } from './continent-sampler';
import { MountainSampler } from './mountain-sampler';
import { RoughnessSampler } from './roughness-sampler';

//fraction of the mountain height over which they fade in from the coast
const COAST_FACTOR = 0.05;

const WARP_OCTAVES = 5;
const WARP_PERSISTENCE = 0.5;

//extra warp strength for mountain regions, relative to the continent warp
const MOUNTAIN_WARP = 2;

//fine single-octave warp that frays the coastline; strength is a fraction of its feature size
const COAST_WARP_SIZE = 40 * KM;
const COAST_WARP_STRENGTH = 0.1;

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
  private static _roughness: RoughnessSampler | null = null;
  private static _continentWarp: DomainWarp | null = null;
  private static _coastWarp: DomainWarp | null = null;

  private readonly _maxHeight: number;
  private readonly _mountainCoast: number;
  private readonly _roughnessHeight: number;
  private readonly _roughnessCoast: number;
  private readonly _waterEnabled: boolean;

  constructor() {
    super(planetConfig.value.radiusMeters * METER_UNITS, landmassConfig.value.density);
    this._maxHeight = landmassConfig.value.terrain.mountains.maxHeightMeters;
    this._mountainCoast = COAST_FACTOR * this._maxHeight;
    this._roughnessHeight = landmassConfig.value.terrain.roughness.heightMeters;
    this._roughnessCoast = COAST_FACTOR * this._roughnessHeight;
    this._waterEnabled = planetConfig.value.waterEnabled;
    LandmassSector._continent ??= new ContinentSampler();
    LandmassSector._mountain ??= new MountainSampler();
    LandmassSector._roughness ??= new RoughnessSampler();
    LandmassSector._continentWarp ??= LandmassSector.buildContinentWarp();
    LandmassSector._coastWarp ??= LandmassSector.buildCoastWarp();
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

  private static buildCoastWarp(): DomainWarp {
    const size = COAST_WARP_SIZE * METER_UNITS;
    return new DomainWarp(planetConfig.value.seed + 5, COAST_WARP_STRENGTH * size, {
      octaves: 1,
      persistence: WARP_PERSISTENCE,
      frequency: 1 / size,
    });
  }

  protected getHeightOffset(vx: number, vy: number, vz: number): number {
    const raw = { x: vx, y: vy, z: vz };
    const coastWarped = LandmassSector._coastWarp!.apply(raw);
    const warped = LandmassSector._continentWarp!.apply(coastWarped);

    let base = LandmassSector._continent!.sample(warped);

    const mountainCeiling = this._maxHeight * smoothstep(0, this._mountainCoast, base);
    const mountainHeadroom = Math.max(0, mountainCeiling - base);
    const mountainWarped = scaleWarp(raw, warped, MOUNTAIN_WARP);
    base += LandmassSector._mountain!.sample(raw, mountainWarped) * mountainHeadroom;

    const roughness = LandmassSector._roughness!.sample(raw);
    if (this._waterEnabled) {
      //fade to the waterline so hills never surface as islands or texture the coast
      const ceiling = Math.min(this._roughnessHeight, Math.abs(base));
      const mask = smoothstep(0, this._roughnessCoast, Math.abs(base));
      base += roughness * ceiling * mask;
    } else {
      base += roughness * this._roughnessHeight;
    }

    return base * METER_UNITS;
  }
}

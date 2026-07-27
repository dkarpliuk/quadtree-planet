import { KM, METER_UNITS } from '@config/constants';
import { type ElevationProfile, landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { distribution, type QuantileFn } from '../../lib/distribution';
import { DomainWarp } from '../../lib/domain-warp';
import { ElevationSampler } from '../../lib/elevation-sampler';
import { Noise } from '../../lib/noise';
import { SimplexNoise } from '../../lib/simplex-noise';
import type { Coordinate } from '../../lib/types';
import seedrandom from 'seedrandom';

const OCTAVES = 8;
const PERSISTENCE = 0.5;

const WARP_OCTAVES = 5;
const WARP_PERSISTENCE = 0.5;

//fine single-octave warp that frays the coastline; strength is a fraction of its feature size
const COAST_WARP_SIZE = 30 * KM;
const COAST_WARP_STRENGTH = 0.1;

export interface ContinentSample {
  height: number;
  warped: Coordinate; //continent-warped coordinate, for downstream features
}

//the hypsometry profile is normalized by default (50:50 land/water)
//landFactor shifts the control point to the desired split
function shiftLand(profile: ElevationProfile, landFactor: number): ElevationProfile {
  const anchor = 1 - 2 * landFactor;

  return profile.map(([x, y]): [number, number] => {
    if (x <= 0) //water side: remap [-1, 0] onto [-1, anchor]
      return [-1 + (x + 1) * (anchor + 1), y];
    else //land side: remap [0, 1] onto [anchor, 1]
      return [anchor + x * (1 - anchor), y];
  });
}

class ContinentSampler {
  private _noise!: Noise;
  private _warp!: DomainWarp;
  private _coastWarp!: DomainWarp;
  private readonly _elevation = new ElevationSampler();

  warm(): void {
    const options = landmassConfig.value.terrain.continents;
    const seed = planetConfig.value.seed;
    const size = options.sizeMeters * METER_UNITS;
    this._noise = new SimplexNoise(seed, {
      octaves: OCTAVES,
      persistence: PERSISTENCE,
      frequency: 1 / size,
    });
    this._warp = new DomainWarp(seed + 1, size * options.tectonicFactor, {
      octaves: WARP_OCTAVES,
      persistence: WARP_PERSISTENCE,
      frequency: 1 / size,
    });

    const coastSize = COAST_WARP_SIZE * METER_UNITS;
    this._coastWarp = new DomainWarp(seed + 5, COAST_WARP_STRENGTH * coastSize, {
      octaves: 1,
      persistence: WARP_PERSISTENCE,
      frequency: 1 / coastSize,
    });

    const profile = shiftLand(options.elevationProfile, options.landFactor);
    const quantile = this._getDistribution(size);
    const cdfAdjusted = profile.map(([x, y]): [number, number] => [quantile((x + 1) / 2), y]);
    this._elevation.warm(cdfAdjusted);
  }

  private _getDistribution(size: number): QuantileFn {
    const spread = size * 1000;
    const random = seedrandom(planetConfig.value.seed.toString());
    return distribution(() => this._noise.getFbm(
      random() * spread,
      random() * spread,
      random() * spread,
    ));
  }

  sample(raw: Coordinate): ContinentSample {
    const warped = this._warp.apply(this._coastWarp.apply(raw));

    return {
      height: this._elevation.sample(this._noise.getFbm(warped.x, warped.y, warped.z)),
      warped,
    };
  }
}

export const continentSampler = new ContinentSampler();

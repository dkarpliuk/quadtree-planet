import { METER_UNITS } from '@config/common';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { NoiseSampler } from '../../lib/noise-sampler';
import { SimplexNoiseSampler } from '../../lib/simplex-noise-sampler';

const OCTAVES = 3;
const PERSISTENCE = 0.5;
const FLATNESS_MAX_EXPONENT = 4;

export class ContinentSampler {
  private readonly _noise: NoiseSampler;
  private readonly _flatnessExponent: number;
  private readonly _coastSlope: number = 0;

  constructor() {
    const options = landmassConfig.value.terrain.continents;
    const { seed, waterEnabled } = planetConfig.value;

    this._noise = new SimplexNoiseSampler(seed, {
      octaves: OCTAVES,
      persistence: PERSISTENCE,
      frequency: 1 / (options.sizeMeters * METER_UNITS),
    });
    this._flatnessExponent = 1 + options.flatnessFactor * (FLATNESS_MAX_EXPONENT - 1);

    if (waterEnabled) {
      //slope of the linear coast, set so it meets the exponential exactly at the coast height
      const coastHeightNorm = options.coastHeightMeters / options.amplitudeMeters;
      const coastExponent = (this._flatnessExponent - 1) / this._flatnessExponent;
      this._coastSlope = Math.pow(coastHeightNorm, coastExponent);
    }
  }

  sample(vx: number, vy: number, vz: number): number {
    const raw = this._noise.getOctaveNoise(vx, vy, vz);
    const magnitude = Math.abs(raw);

    const linear = this._coastSlope * magnitude;
    const exponential = Math.pow(magnitude, this._flatnessExponent);

    return Math.sign(raw) * Math.max(linear, exponential);
  }
}

import { METER_UNITS } from '@config/common';
import { landmassConfig } from '@config/landmass-config';
import { planetConfig } from '@config/planet-config';

import { smoothstep } from '../../lib/math';
import { NoiseSampler } from '../../lib/noise-sampler';
import { SimplexNoiseSampler } from '../../lib/simplex-noise-sampler';

const OCTAVES = 2;
const PERSISTENCE = 0.5;

//fade the roughness out over twice its amplitude near the waterline: keeps it below the
//local depth so the upward bumps never breach into islands
const COAST_FADE = 2;

export class RoughnessSampler {
  private readonly _noise: NoiseSampler;
  private readonly _amplitude: number;
  private readonly _fadeBand: number;
  private readonly _waterEnabled: boolean;

  constructor() {
    const { roughness } = landmassConfig.value.terrain;
    const { seed, waterEnabled } = planetConfig.value;

    this._noise = new SimplexNoiseSampler(seed + 3, {
      octaves: OCTAVES,
      persistence: PERSISTENCE,
      frequency: 1 / (roughness.sizeMeters * METER_UNITS),
    });
    this._amplitude = roughness.amplitudeMeters * METER_UNITS;
    this._fadeBand = this._amplitude * COAST_FADE;
    this._waterEnabled = waterEnabled;
  }

  sample(vx: number, vy: number, vz: number, baseHeight: number): number {
    const roughness = (this._noise.getOctaveNoise(vx, vy, vz) + 1) / 2 * this._amplitude;

    if (!this._waterEnabled) return roughness;

    return roughness * smoothstep(0, this._fadeBand, Math.abs(baseHeight));
  }
}

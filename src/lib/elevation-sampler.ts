import type { ElevationProfile } from '@config/landmass-config';

import { lerp } from './math';
import { Spline } from './spline';

const RESOLUTION = 512;
const SCALE = (RESOLUTION - 1) / 2;

export class ElevationSampler {
  private readonly _lut = new Float64Array(RESOLUTION);

  warm(profile: ElevationProfile): void {
    const spline = new Spline(profile);

    for (let i = 0; i < RESOLUTION; i++) {
      const noise = -1 + (2 * i) / (RESOLUTION - 1);
      this._lut[i] = spline.at(noise);
    }
  }

  sample(noise: number): number {
    //lut fractional index
    const f = (noise + 1) * SCALE;
    
    //clamp to a valid segment; the tail extrapolates via f
    const i = Math.min(Math.max(f | 0, 0), RESOLUTION - 2);
    const t = f - i;
    
    //linear interpolation between nodes
    //extrapolated past the ends by the edge segment slope
    return lerp(this._lut[i], this._lut[i + 1], t);
  }
}

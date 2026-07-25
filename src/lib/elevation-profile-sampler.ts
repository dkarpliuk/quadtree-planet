import { monotoneCubic } from './math';

export type ElevationProfile = [number, number][];

const RESOLUTION = 512;

export class ElevationProfileSampler {
  private readonly _profile: ElevationProfile;
  private readonly _lut = new Float64Array(RESOLUTION);
  private readonly _scale = (RESOLUTION - 1) / 2; //hot path optimization

  constructor(profile: ElevationProfile) {
    this._profile = profile;
  }

  warm(): void {
    const xs = this._profile.map((point) => point[0]);
    const ys = this._profile.map((point) => point[1]);
    const curve = monotoneCubic(xs, ys);

    for (let i = 0; i < RESOLUTION; i++) {
      const noise = -1 + (2 * i) / (RESOLUTION - 1);
      this._lut[i] = curve(noise);
    }
  }

  sample(noise: number): number {
    //lut fractional index
    const t = (noise + 1) * this._scale;
    
    //clamp to a valid segment; the tail extrapolates via f
    const i = Math.min(Math.max(t | 0, 0), RESOLUTION - 2);
    const f = t - i;
    
    //linear interpolation between nodes
    //extrapolated past the ends by the edge segment slope
    return this._lut[i] + (this._lut[i + 1] - this._lut[i]) * f;
  }
}

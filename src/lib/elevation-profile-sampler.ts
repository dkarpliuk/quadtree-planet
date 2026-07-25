import { monotoneCubic } from './math';

export type ElevationProfile = [number, number][];

const RESOLUTION = 512;
const SIGMA = 1 / 3; //noise ±1 sits at ±3σ

//logistic approximation of the normal CDF
function gaussianCdf(x: number, sigma: number): number {
  return 1 / (1 + Math.exp((-1.702 * x) / sigma));
}

export class ElevationProfileSampler {
  private readonly _profile: ElevationProfile;
  private readonly _raw: boolean;
  private readonly _lut = new Float64Array(RESOLUTION);
  private readonly _scale = (RESOLUTION - 1) / 2; //hot path optimization

  constructor(profile: ElevationProfile, raw = false) {
    this._profile = profile;
    this._raw = raw;
  }

  warm(): void {
    const xs = this._profile.map((point) => point[0]);
    const ys = this._profile.map((point) => point[1]);
    const curve = monotoneCubic(xs, ys);

    for (let i = 0; i < RESOLUTION; i++) {
      const noise = -1 + (2 * i) / (RESOLUTION - 1);
      //redistribute noise onto area fraction
      //so the profile reads as hypsometry, unless raw
      this._lut[i] = this._raw
        ? curve(noise)
        : curve(2 * gaussianCdf(noise, SIGMA) - 1);
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

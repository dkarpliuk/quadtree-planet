import { monotoneCubic } from './math';

export type ElevationProfile = [number, number][];

const RESOLUTION = 512;

//logistic approximation of the normal CDF
function gaussianCdf(x: number, std: number): number {
  return 1 / (1 + Math.exp((-1.702 * x) / std));
}

export interface HypsometryOptions {
  noiseStd: number;
  landFactor: number;
}

//the hypsometry profile is normalized by default (50:50 land/water)
//landFactor shifts the sea-level control point to the desired split
function shiftLandWater(profile: ElevationProfile, landFactor?: number): ElevationProfile {
  if (!landFactor) return profile;
  const anchor = 1 - 2 * landFactor;

  return profile.map(([x, y]): [number, number] => {
    if (x <= 0) {
      //water side: remap [-1, 0] onto [-1, anchor]
      return [-1 + (x + 1) * (anchor + 1), y];
    }

    //land side: remap [0, 1] onto [anchor, 1]
    return [anchor + x * (1 - anchor), y];
  });
}

export class ElevationProfileSampler {
  private readonly _profile: ElevationProfile;
  private readonly _hypsometry?: HypsometryOptions;
  private readonly _lut = new Float64Array(RESOLUTION);
  private readonly _scale = (RESOLUTION - 1) / 2; //hot path optimization

  constructor(profile: ElevationProfile, hypsometry?: HypsometryOptions) {
    this._profile = shiftLandWater(profile, hypsometry?.landFactor);
    this._hypsometry = hypsometry;
  }

  warm(): void {
    const xs = this._profile.map((point) => point[0]);
    const ys = this._profile.map((point) => point[1]);
    const curve = monotoneCubic(xs, ys);

    for (let i = 0; i < RESOLUTION; i++) {
      const noise = -1 + (2 * i) / (RESOLUTION - 1);
      this._lut[i] = this._hypsometry
        ? curve(2 * gaussianCdf(noise, this._hypsometry.noiseStd) - 1)
        : curve(noise);
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

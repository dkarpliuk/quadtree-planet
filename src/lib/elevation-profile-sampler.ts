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
    const t = (noise + 1) * this._scale; //lut fractional index
    if (t <= 0) return this._lut[0];
    if (t >= RESOLUTION - 1) return this._lut[RESOLUTION - 1];

    const i = t | 0; //fast truncate
    const f = t - i;
    //linear interpolation between adjacent nodes
    return this._lut[i] + (this._lut[i + 1] - this._lut[i]) * f;
  }
}

import { softAbs } from './math';

export type Noise3D = (x: number, y: number, z: number) => number;

const DEFAULT_GAIN = 2;

export interface OctaveNoiseOptions {
  octaves: number;
  persistence: number;
  frequency: number;
  //half-width of the rounded band at the zero level, in noise units (0 leaves the crease sharp)
  crease?: number;
  //how sharply the ridged octaves are gated by the coarser ones
  gain?: number;
}

export abstract class Noise {
  protected abstract readonly noise: Noise3D;
  private readonly _options: OctaveNoiseOptions;
  private readonly _crease: number;
  private readonly _invCrease: number; //for performance
  private readonly _gain: number;

  constructor(options: OctaveNoiseOptions) {
    this._options = options;
    this._crease = options.crease ?? 0;
    this._invCrease = this._crease > 0 ? 1 / this._crease : 0;
    this._gain = options.gain ?? DEFAULT_GAIN;
  }

  //output [-1, 1]
  getFbm(x: number, y: number, z: number): number {
    const { octaves, persistence } = this._options;
    let frequency = this._options.frequency;
    let total = 0;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      const value = this.noise(x * frequency, y * frequency, z * frequency);
      total += value * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }

  /**
   * Detail is gated by the coarser octaves, so roughness grows with height:
   * foothills come out smooth, crests keep the fine, broken relief.
   * @see Musgrave, "Texturing & Modeling: A Procedural Approach"
   * output [0, 1]
   */
  getRidgedFbm(x: number, y: number, z: number): number {
    const { octaves, persistence } = this._options;
    let frequency = this._options.frequency;
    let total = 0;
    let amplitude = 1;
    let maxValue = 0;
    let weight = 1;

    for (let i = 0; i < octaves; i++) {
      const raw = this.noise(x * frequency, y * frequency, z * frequency);
      const ridge = 1 - softAbs(raw, this._crease, this._invCrease);
      const signal = ridge * ridge * weight;
      weight = Math.min(1, signal * this._gain);

      total += signal * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }

  //output [0, 1]
  getBillow(x: number, y: number, z: number): number {
    const { octaves, persistence } = this._options;
    let frequency = this._options.frequency;
    let total = 0;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      const raw = this.noise(x * frequency, y * frequency, z * frequency);
      const value = softAbs(raw, this._crease, this._invCrease);
      total += value * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }
}

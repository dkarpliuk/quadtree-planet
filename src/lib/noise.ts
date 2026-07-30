import { softAbs } from './math';

export type Noise3D = (x: number, y: number, z: number) => number;

export interface OctaveNoiseOptions {
  octaves: number;
  persistence: number;
  frequency: number;
  //how sharp the folds of the noise are: 1 keeps them sharp, 0 smooths them away
  crease?: number;
  //how much the small octaves follow the big ones: 0 ignores them, 1 follows fully
  gain?: number;
}

export abstract class Noise {
  protected abstract readonly noise: Noise3D;
  private readonly _options: OctaveNoiseOptions;
  private readonly _smoothing: number;
  private readonly _invSmoothing: number; //for performance
  private readonly _invGain: number; //for performance, 0 turns the weighting off

  constructor(options: OctaveNoiseOptions) {
    this._options = options;
    this._smoothing = 1 - (options.crease ?? 1);
    this._invSmoothing = this._smoothing > 0 ? 1 / this._smoothing : 0;
    const gain = options.gain ?? 0;
    this._invGain = gain > 0 ? 1 / gain : 0;
  }

  /**
   * output [-1, 1]
   */
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
   * Small octaves only show up where the big ones are high,
   * so ridge tops are rough and the slopes below them are smooth.
   * Adapted from {@link http://www.kenmusgrave.com/dissertation.pdf | Ken Musgrave},
   * section 2.3.2.5.
   * 
   * output [0, 1]
   */
  getRidged(x: number, y: number, z: number): number {
    const { octaves, persistence } = this._options;
    let frequency = this._options.frequency;
    let total = 0;
    let amplitude = 1;
    let maxValue = 0;
    let weight = 1;

    for (let i = 0; i < octaves; i++) {
      const raw = this.noise(x * frequency, y * frequency, z * frequency);
      const folded = 1 - softAbs(raw, this._smoothing, this._invSmoothing);
      const signal = folded * folded * weight;

      total += signal * amplitude;
      maxValue += amplitude;
      weight = this._invGain === 0 ? 1 : Math.min(1, signal * this._invGain);
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }

  /**
   * Small octaves only show up where the big ones are low,
   * so valley bottoms are rough and the hills above them are smooth.
   * 
   * output [0, 1]
   */
  getBillow(x: number, y: number, z: number): number {
    const { octaves, persistence } = this._options;
    let frequency = this._options.frequency;
    let total = 0;
    let amplitude = 1;
    let maxValue = 0;
    let weight = 1;

    for (let i = 0; i < octaves; i++) {
      const raw = this.noise(x * frequency, y * frequency, z * frequency);
      const folded = softAbs(raw, this._smoothing, this._invSmoothing);
      const signal = folded * weight;
      const groove = 1 - folded;
      const gate = groove * groove * weight;

      total += signal * amplitude;
      //the gated octaves are missing from the sum, so they are left out of the range too
      maxValue += amplitude * weight;
      weight = this._invGain === 0 ? 1 : Math.min(1, gate * this._invGain);
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }
}

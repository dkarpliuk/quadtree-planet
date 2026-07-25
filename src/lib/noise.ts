export type Noise3D = (x: number, y: number, z: number) => number;

export interface OctaveNoiseOptions {
  octaves: number;
  persistence: number;
  frequency: number;
}

export abstract class Noise {
  protected abstract readonly noise: Noise3D;
  private readonly _options: OctaveNoiseOptions;

  constructor(options: OctaveNoiseOptions) {
    this._options = options;
  }

  //standard deviation of the fBM output, measured over a batch of samples
  getStd(samples: number): number {
    const spread = 1000 / this._options.frequency; //span many feature periods so samples decorrelate
    let sum = 0;
    let sumSquares = 0;

    for (let i = 0; i < samples; i++) {
      const value = this.getFbm(Math.random() * spread, Math.random() * spread, Math.random() * spread);
      sum += value;
      sumSquares += value * value;
    }

    const mean = sum / samples;
    return Math.sqrt(sumSquares / samples - mean * mean);
  }

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

  //output [0, 1]
  getRidgedFbm(x: number, y: number, z: number): number {
    const { octaves, persistence } = this._options;
    let frequency = this._options.frequency;
    let total = 0;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      const ridge = 1 - Math.abs(this.noise(x * frequency, y * frequency, z * frequency));
      total += ridge * ridge * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  }
}

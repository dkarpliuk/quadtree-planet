export type Noise3D = (x: number, y: number, z: number) => number;

export interface OctaveNoiseOptions {
  octaves: number;
  persistence: number;
  frequency: number;
}

export abstract class NoiseSampler {
  protected abstract readonly noise: Noise3D;
  private readonly _options: OctaveNoiseOptions;

  constructor(options: OctaveNoiseOptions) {
    this._options = options;
  }

  getOctaveNoise(x: number, y: number, z: number): number {
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

  //ridged fBm for sharp ridges, output [0, 1]
  getRidged(x: number, y: number, z: number): number {
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

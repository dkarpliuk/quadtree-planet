export type Noise3D = (x: number, y: number, z: number) => number;

export interface OctaveNoiseOptions {
  octaves: number;
  persistence: number;
  frequency: number;
}

export class NoiseSampler {
  noise: Noise3D;

  constructor(noiseFn: Noise3D) {
    this.noise = noiseFn;
  }

  getOctaveNoise(x: number, y: number, z: number, options: OctaveNoiseOptions): number {
    const { octaves, persistence } = options;
    let frequency = options.frequency;
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

  normalize = (x: number, min: number, max: number) =>
    Math.abs(x - min) / (max - min);
}

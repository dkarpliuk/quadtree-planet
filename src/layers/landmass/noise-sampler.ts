export type Noise3D = (x: number, y: number, z: number) => number;

export interface OctaveNoiseOptions {
  octaves: number;
  persistence: number;
  frequency: number;
  //planet radius: coordinates are normalized by it so the noise is scale-invariant
  radius: number;
}

export class NoiseSampler {
  noise: Noise3D;

  constructor(noiseFn: Noise3D) {
    this.noise = noiseFn;
  }

  getOctaveNoise(x: number, y: number, z: number, options: OctaveNoiseOptions): number {
    const { octaves, persistence, radius } = options;
    let frequency = options.frequency;
    let total = 0;
    let amplitude = 1;
    let maxValue = 0;

    //normalize to the unit sphere so feature scale is independent of planet size
    const nx = x / radius;
    const ny = y / radius;
    const nz = z / radius;

    for (let i = 0; i < octaves; i++) {
      const value = this.noise(nx * frequency, ny * frequency, nz * frequency);
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

export class NoiseProcessor {
  defaultFrequency = 0.02;
  defaultPersistence = 0.4;
  
  constructor(noiseFn) {
    this.noise = noiseFn;
  }

  getOctaveNoise(x, y, z, octaves, persistence = this.defaultPersistence, frequency = this.defaultFrequency) {
    let total = 0;
    let amplitude = 1;
    let maxValue = 0;

    for (let i = 0; i < octaves; i++) {
      let value = this.noise.eval(x * frequency, y * frequency, z * frequency);
      total += value * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }

    return total / maxValue;
  };

  normalize(x, min, max) {
    return Math.abs(x - min) / (max - min);
  };
}
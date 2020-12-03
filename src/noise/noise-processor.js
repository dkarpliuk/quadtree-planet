export class NoiseProcessor {
  constructor(noiseFn) {
    this.noise = noiseFn;
  }

  getOctaveNoise(x, y, z, octaves, persistence, frequency) {
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

  getNoiseArray2D(size) {
    let resultArray = [];
    for (let i = 0; i < size; i++) {
      resultArray[i] = [];
      for (let j = 0; j < size; j++) {
        let value = this.getOctaveNoise(i, j, 0, 8, 0.4, 0.02);
        value = this.normalize(value, -1, 1);
        value = Math.pow(value, 3);
        resultArray[i][j] = value;
      }
    }

    return resultArray;
  }
}
import { expose } from 'comlink';

import { SimplexNoise } from '../lib/simplex-noise';

const STEP = 0.0001;

export interface CalibrationOptions {
  seeds: number;
  samples: number;
  octaves: number;
  persistence: number;
  percentile: number;
}

function measureSeedQuantile(options: CalibrationOptions): number {
  const { samples, octaves, persistence, percentile } = options;

  const noise = new SimplexNoise(Math.random(), { octaves, persistence, frequency: 1 });
  const counts: number[] = [];

  for (let i = 0; i < samples; i++) {
    const value = Math.abs(noise.getFbm(Math.random() * 1000, Math.random() * 1000, Math.random() * 1000));
    const index = (value / STEP) | 0;
    counts[index] = (counts[index] ?? 0) + 1;
  }
  
  let cumulative = 0;
  const target = samples * percentile;
  let bin = 0;
  while (cumulative < target) {
    cumulative += counts[bin++] ?? 0;
  }

  return bin * STEP;
}

function measureFbmQuantile(options: CalibrationOptions): number {
  let sum = 0;
  for (let s = 0; s < options.seeds; s++) {
    sum += measureSeedQuantile(options);
  }

  return sum / options.seeds;
}

expose(measureFbmQuantile);

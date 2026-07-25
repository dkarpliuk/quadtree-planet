import { expose } from 'comlink';

import { SimplexNoise } from '../lib/simplex-noise';

export interface StdOptions {
  samples: number;
  octaves: number;
  persistence: number;
}

function measureStd(options: StdOptions): number {
  const noise = new SimplexNoise(Math.random(), {
    octaves: options.octaves,
    persistence: options.persistence,
    frequency: 1
  });
  
  return noise.getStd(options.samples);
}

expose(measureStd);

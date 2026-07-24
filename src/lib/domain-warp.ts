import { NoiseSampler, type OctaveNoiseOptions } from './noise-sampler';
import { SimplexNoiseSampler } from './simplex-noise-sampler';

export class DomainWarp {
  private readonly _x: NoiseSampler;
  private readonly _y: NoiseSampler;
  private readonly _z: NoiseSampler;
  private readonly _strength: number;

  constructor(seed: number, strength: number, options: OctaveNoiseOptions) {
    this._x = new SimplexNoiseSampler(seed, options);
    this._y = new SimplexNoiseSampler(seed + 1, options);
    this._z = new SimplexNoiseSampler(seed + 2, options);
    this._strength = strength;
  }

  apply(vx: number, vy: number, vz: number): [number, number, number] {
    return [
      vx + this._strength * this._x.getOctaveNoise(vx, vy, vz),
      vy + this._strength * this._y.getOctaveNoise(vx, vy, vz),
      vz + this._strength * this._z.getOctaveNoise(vx, vy, vz),
    ];
  }
}

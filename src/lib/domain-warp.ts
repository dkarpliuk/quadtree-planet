import { Noise, type OctaveNoiseOptions } from './noise';
import { SimplexNoise } from './simplex-noise';
import type { Coordinate } from './types';

//Offsets from Inigo Quilez, "Domain Warping"
const OFFSET_Y: [number, number, number] = [5.2, 1.3, 8.3];
const OFFSET_Z: [number, number, number] = [1.7, 9.2, 2.8];

/**
 * Warping (domain distortion) is a computer graphics technique for procedural 
 * textures and geometry. Used to bend, twist, stretch, or deform shapes.
 * @see https://iquilezles.org/articles/warp/
 */
export class DomainWarp {
  private readonly _noise: Noise;
  private readonly _strength: number;
  private readonly _offsetY: [number, number, number];
  private readonly _offsetZ: [number, number, number];

  constructor(seed: number, strength: number, options: OctaveNoiseOptions) {
    this._noise = new SimplexNoise(seed, options);
    this._strength = strength;

    const featureSize = 1 / options.frequency;
    this._offsetY = [OFFSET_Y[0] * featureSize, OFFSET_Y[1] * featureSize, OFFSET_Y[2] * featureSize];
    this._offsetZ = [OFFSET_Z[0] * featureSize, OFFSET_Z[1] * featureSize, OFFSET_Z[2] * featureSize];
  }

  apply(coord: Coordinate): Coordinate {
    const { x, y, z } = coord;
    return {
      x: x + this._strength * this._noise.getFbm(x, y, z),
      y: y + this._strength * this._noise.getFbm(x + this._offsetY[0], y + this._offsetY[1], z + this._offsetY[2]),
      z: z + this._strength * this._noise.getFbm(x + this._offsetZ[0], y + this._offsetZ[1], z + this._offsetZ[2]),
    };
  }
}

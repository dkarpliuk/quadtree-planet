import { NoiseProcessor } from './noise-processor';
import { MeshStandardMaterial } from 'three';
import { Sector } from '../lod-processor';

const material = new MeshStandardMaterial({ color: 0xffffff });

const heightScale = 0.03;

export class LandmassSector extends Sector {
  /**
   * @type {NoiseProcessor}
   */
  _noiseProcessor = null;

  get _material() { return material; }

  constructor(sphereRadius, noiseProcessor) {
    super(sphereRadius);
    this._noiseProcessor = noiseProcessor;
  }

  _computeHeightOffset(vx, vy, vz) {
    let noise = this._noiseProcessor.getOctaveNoise(vx, vy, vz, 12, 0.5, 0.00025);
    return noise * this._sphereRadius * heightScale;
  }
}

import { NoiseProcessor } from '@noise';
import { MeshStandardMaterial } from 'three';
import { Sector } from '../base/sector';

const material = new MeshStandardMaterial({ color: 0xffffff, wireframe: false });

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
    let noise = this._noiseProcessor.getOctaveNoise(vx, vy, vz, 8, 0.7, 0.001);
    return noise * noise * this._sphereRadius * 0.03;
  }
}
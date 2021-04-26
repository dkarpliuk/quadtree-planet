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

  _computeHeightCalibrationValue(vx, vy, vz) {
    let res = this._noiseProcessor.getOctaveNoise(vx, vy, vz, 8);
    return res * this._sphereRadius * 0.003;
  }
}
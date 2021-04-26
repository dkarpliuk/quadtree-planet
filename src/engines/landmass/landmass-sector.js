import { NoiseProcessor } from '../../noise/noise-processor';
import { Sector } from '../base/sector';

export class LandmassSector extends Sector {
  /**
   * @type {NoiseProcessor}
   */
  _noiseProcessor = null;

  constructor(sphereRadius, noiseProcessor) {
    super(sphereRadius);
    this._noiseProcessor = noiseProcessor;
  }

  _computeHeightCalibrationValue(vx, vy, vz) {
    let res = this._noiseProcessor.getOctaveNoise(vx, vy, vz, 8);
    return res * this._sphereRadius * 0.003;
  }
}
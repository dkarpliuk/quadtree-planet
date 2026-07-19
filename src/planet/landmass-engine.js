import { NoiseProcessor } from './noise-processor';
import { Engine } from '../lod-processor';
import { LandmassSector } from './landmass-sector';

export class LandmassEngine extends Engine {
  /**
   * @type {NoiseProcessor}
   */
  noiseProcessor = null;

  _createSector() {
    return new LandmassSector(this.sphereRadius, this.noiseProcessor);
  }
}
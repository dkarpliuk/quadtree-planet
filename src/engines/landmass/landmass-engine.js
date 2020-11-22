import { Engine } from '../base/engine';
import { LandmassSector } from './landmass-sector';

export class LandmassEngine extends Engine {
  _createSector() {
    return new LandmassSector(this.sphereRadius);
  }
}
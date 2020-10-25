import { Engine } from '../base/engine';
import { LandmassSector } from './landmass-sector';

export class LandmassEngine extends Engine {
  _createSector(address) {
    return new LandmassSector(address, this._sphereRadius);
  }
}
import { Sector } from '../base/sector';
import { LandmassArea } from './landmass-area';

export class LandmassSector extends Sector {
  _createArea() {
    return new LandmassArea();
  }
}
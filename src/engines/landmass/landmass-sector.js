import { MeshBasicMaterial } from 'three';
import { Sector } from '../base/sector';

export class LandmassSector extends Sector {
  get _material() {
    let quadrant = this.address[this.address.length - 1];

    let clr;

    if (this.address.length == 1) {
      clr = 0xffffff;
    } else if (quadrant == 0) {
      clr = 0xff0000;
    } else if (quadrant == 1) {
      clr = 0x00ff00;
    } else if (quadrant == 2) {
      clr = 0x0000ff;
    } else if (quadrant == 3) {
      clr = 0xff00ff;
    }

    return new MeshBasicMaterial({ color: clr, wireframe: true });

  }
}
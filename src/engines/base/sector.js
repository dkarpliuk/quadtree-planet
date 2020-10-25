import { AxisRotationMatrix } from '../../core/axis-rotation-matrix';
import { AxisEnum } from '../../enums/axis-enum';
import { Area } from './area';

export class Sector {
  _address = new Array();
  _area = null;
  _matrix = null;
  _sphereRadius = 0;

  get address() {
    return this._address;
  }

  get visible() {
    return this._area?.visible;
  }
  set visible(value) {
    if (this._area) {
      this._area.visible = value;
    }
  }

  constructor(address, sphereRadius) {
    this._address = address;
    this._sphereRadius = sphereRadius;
    this._matrix = this._calculateMarix();
    this._area = this._createArea();
  }

  instantiate(attractor) {
    this._area.instantiate(attractor, this._matrix);
  }

  calcDistanceToAreaCenter(fromVector) {
    let center = this._area.center;

    let a = fromVector.x - center.x;
    let b = fromVector.y - center.y;
    let c = fromVector.z - center.z;

    return Math.sqrt(a * a + b * b + c * c);
  }

  _calculateMarix() {
    let matrix = AxisRotationMatrix.slice(this.address[0] * 16, (this.address[0] + 1) * 16);

    let scale = this._sphereRadius / Math.pow(2, this.address.length - 1);
    matrix[0] *= scale;
    matrix[1] *= scale;
    matrix[2] *= scale;
    matrix[4] *= scale;
    matrix[5] *= scale;
    matrix[6] *= scale;
    matrix[8] *= scale;
    matrix[9] *= scale;
    matrix[10] *= scale;

    let translation = this._calculateTranslation();
    matrix[3] = translation.x;
    matrix[7] = translation.y;
    matrix[11] = translation.z;

    return matrix;
  }

  _calculateTranslation() {
    let a = 0;
    let b = 0;
    for (let i = 1; i < this.address.length; i++) {
      let factor = Math.pow(2, i);
      switch (this.address[i]) {
        case 0:
          a -= this._sphereRadius / factor;
          b += this._sphereRadius / factor;
          break;
        case 1:
          a += this._sphereRadius / factor;
          b += this._sphereRadius / factor;
          break;
        case 2:
          a += this._sphereRadius / factor;
          b -= this._sphereRadius / factor;
          break;
        case 3:
          a -= this._sphereRadius / factor;
          b -= this._sphereRadius / factor;
          break;
        default:
          throw `Invalid sector address: ${this.address.join('-')}`;
      }
    }

    switch (this.address[0]) {
      case AxisEnum.abscissaPositive:
        return { x: this._sphereRadius, y: b, z: a };
      case AxisEnum.abscissaNegative:
        return { x: -this._sphereRadius, y: -b, z: -a };
      case AxisEnum.ordinatePositive:
        return { x: a, y: this._sphereRadius, z: b };
      case AxisEnum.ordinateNegative:
        return { x: -a, y: -this._sphereRadius, z: -b };
      case AxisEnum.applicataPositive:
        return { x: a, y: b, z: this._sphereRadius };
      case AxisEnum.applicataNegative:
        return { x: -a, y: -b, z: -this._sphereRadius };
      default:
        throw `Invalid sector address: ${this.address.join('-')}`;
    }
  }

  _createArea() {
    return new Area();
  }
}

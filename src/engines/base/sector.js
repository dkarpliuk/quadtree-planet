import { AxisEnum } from '../../enums/axis-enum';
import { Area } from './area';

export class Sector {
  _matrix = null;
  _area = null;
  _address = new Array();

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

  constructor(address, matrix) {
    this._address = address;
    this._matrix = matrix;
    this._area = this._createArea();
  }

  instantiate(attractor) {
    this._area.instantiate(attractor, this._matrix);
  }

  split() {
    return [
      this._createSubsector(0),
      this._createSubsector(1),
      this._createSubsector(2),
      this._createSubsector(3),
    ];
  }

  getCenterAreaDistance(toVector) {
    let center = this._area.center;

    let a = toVector.x - center.x;
    let b = toVector.y - center.y;
    let c = toVector.z - center.z;

    return Math.sqrt(a * a + b * b + c * c);
  }

  _createSubsector(number) {
    let matrix = this._matrix.clone();
    let address = [...this.address, number];

    matrix.makeScale(.5, .5, .5);
    this._adjustPosition(address, matrix);

    return this._createSector(address, matrix);
  }

  _adjustPosition(address, matrix) {
    let level = address.length - 1;
    let sphereRadius = matrix.getMaxScaleOnAxis();
    let shiftDistanceOnAxis = sphereRadius / Math.pow(2, level);

    let subsectorNumber = address[address.length - 1];
    let a = shiftDistanceOnAxis * [-1, 1, 1, -1][subsectorNumber];
    let b = shiftDistanceOnAxis * [1, 1, -1, -1][subsectorNumber];

    switch (address[0]) {
      case AxisEnum.abscissaPositive:
        matrix.makeTranslation(0, b, a);
        break;
      case AxisEnum.abscissaNegative:
        matrix.makeTranslation(0, -b, -a);
        break;
      case AxisEnum.ordinatePositive:
        matrix.makeTranslation(a, 0, b);
        break;
      case AxisEnum.ordinateNegative:
        matrix.makeTranslation(-a, 0, -b);
        break;
      case AxisEnum.applicataPositive:
        matrix.makeTranslation(a, b, 0);
        break;
      case AxisEnum.applicataNegative:
        matrix.makeTranslation(-a, -b, 0);
        break;
      default:
        throw `Invalid sector address: ${address.join('-')}`;
    }
  }

  _createArea() {
    return new Area();
  }

  _createSector(address, matrix) {
    return new Sector(address, matrix);
  }
}

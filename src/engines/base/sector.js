import { AxisEnum } from '../../enums/axis-enum';
import { Area } from './area';

export class Sector {
  #matrix = null;
  #area = null;
  #address = new Array();

  get address() {
    return this.#address;
  }

  get visible() {
    return this.#area?.visible;
  }
  set visible(value) {
    if (this.#area) {
      this.#area.visible = value;
    }
  }

  constructor(address, matrix) {
    this.#address = address;
    this.#matrix = matrix;
    this.#area = this.#createArea();
  }

  instantiate(attractor) {
    this.#area.instantiate(attractor, this.#matrix);
  }

  split() {
    return [
      this.#createSubsector(0),
      this.#createSubsector(1),
      this.#createSubsector(2),
      this.#createSubsector(3),
    ];
  }

  getCenterAreaDistance(toVector) {
    let center = this.#area.center;

    let a = toVector.x - center.x;
    let b = toVector.y - center.y;
    let c = toVector.z - center.z;

    return Math.sqrt(a * a + b * b + c * c);
  }

  #createSubsector(number) {
    let matrix = this.#matrix.clone();
    let address = [...this.address, number];

    matrix.makeScale(.5, .5, .5);
    this.#adjustPosition(address, matrix);

    return this.#createSector(address, matrix);
  }

  #adjustPosition(address, matrix) {
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

  #createArea() {
    return new Area();
  }

  #createSector(address, matrix) {
    return new Sector(address, matrix);
  }
}

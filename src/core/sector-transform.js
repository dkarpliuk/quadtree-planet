import { AxisEnum } from '../enums/axis-enum';

/**
 * transformation matrices (rotation only) for each side of the cube for better performance
 */
const AxisRotationMatrixBase = [
  //abscissaPositive
  0, 0, -1, 0,
  0, 1, 0, 0,
  1, 0, 0, 0,
  0, 0, 0, 1,

  //abscissaNegative
  0, 0, 1, 0,
  0, 1, 0, 0,
  -1, 0, 0, 0,
  0, 0, 0, 1,

  //ordinatePositive
  1, 0, 0, 0,
  0, 0, -1, 0,
  0, 1, 0, 0,
  0, 0, 0, 1,

  //ordinateNegative
  1, 0, 0, 0,
  0, 0, 1, 0,
  0, -1, 0, 0,
  0, 0, 0, 1,

  //applicataPositive
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,

  //applicataNegative
  1, 0, 0, 0,
  0, -1, 0, 0,
  0, 0, -1, 0,
  0, 0, 0, 1
];

Object.freeze(AxisRotationMatrixBase);

/**
 * Class used to calculate initial transformation matrix
 * used to properly place sector on the cube
 */
export class SectorTransform {
  static calculateTransformationMatrix(address, sphereRadius) {
    let matrix = AxisRotationMatrixBase.slice(address[0] * 16, (address[0] + 1) * 16);

    let scale = sphereRadius / Math.pow(2, address.length - 1);
    matrix[0] *= scale;
    matrix[1] *= scale;
    matrix[2] *= scale;
    matrix[4] *= scale;
    matrix[5] *= scale;
    matrix[6] *= scale;
    matrix[8] *= scale;
    matrix[9] *= scale;
    matrix[10] *= scale;

    let translation = SectorTransform.calculateTranslation(address, sphereRadius);
    matrix[3] = translation.x;
    matrix[7] = translation.y;
    matrix[11] = translation.z;

    return matrix;
  }

  static calculateTranslation(address, sphereRadius) {
    let a = 0;
    let b = 0;
    //first calculates relative translation
    //sum of translation of the quadrant on each level
    for (let i = 1; i < address.length; i++) {
      let factor = Math.pow(2, i);
      switch (address[i]) {
        case 0:
          a -= sphereRadius / factor;
          b += sphereRadius / factor;
          break;
        case 1:
          a += sphereRadius / factor;
          b += sphereRadius / factor;
          break;
        case 2:
          a -= sphereRadius / factor;
          b -= sphereRadius / factor;
          break;
        case 3:
          a += sphereRadius / factor;
          b -= sphereRadius / factor;
          break;
        default:
          throw `Invalid sector address: ${address.toString()}`;
      }
    }

    //then turns relative translation to absolute (for particular side of the cube)
    switch (address[0]) {
      case AxisEnum.abscissaPositive:
        return { x: sphereRadius, y: b, z: a };
      case AxisEnum.abscissaNegative:
        return { x: -sphereRadius, y: -b, z: -a };
      case AxisEnum.ordinatePositive:
        return { x: a, y: sphereRadius, z: b };
      case AxisEnum.ordinateNegative:
        return { x: -a, y: -sphereRadius, z: -b };
      case AxisEnum.applicataPositive:
        return { x: a, y: b, z: sphereRadius };
      case AxisEnum.applicataNegative:
        return { x: -a, y: -b, z: -sphereRadius };
      default:
        throw `Invalid sector address: ${address.toString()}`;
    }
  }
}
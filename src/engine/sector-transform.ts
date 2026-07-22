import { Axis } from './enums';
import type { Vector3Like } from './calc-misc';

export type ModelMatrix = [
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
  number, number, number, number,
];

//the base matrices work in a normalized coordinate system of radius 1
export const UNIT_RADIUS = 1;

/**
 * rotation-only base matrix per cube face
 */
const AxisRotationMatrixBase: Record<Axis, ModelMatrix> = {
  [Axis.xPos]: [
    0, 0, 1, 0,
    0, 1, 0, 0,
    -1, 0, 0, 0,
    0, 0, 0, 1,
  ],
  [Axis.xNeg]: [
    0, 0, -1, 0,
    0, 1, 0, 0,
    1, 0, 0, 0,
    0, 0, 0, 1,
  ],
  [Axis.yPos]: [
    1, 0, 0, 0,
    0, 0, 1, 0,
    0, -1, 0, 0,
    0, 0, 0, 1,
  ],
  [Axis.yNeg]: [
    1, 0, 0, 0,
    0, 0, -1, 0,
    0, 1, 0, 0,
    0, 0, 0, 1,
  ],
  [Axis.zPos]: [
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ],
  [Axis.zNeg]: [
    1, 0, 0, 0,
    0, -1, 0, 0,
    0, 0, -1, 0,
    0, 0, 0, 1,
  ],
};

/**
 * Calculates the initial transformation matrix used to place a sector on the cube.
 */
export class SectorTransform {
  static calculateModelMatrix(address: number[], sphereRadius: number): ModelMatrix {
    const matrix = [...AxisRotationMatrixBase[address[0] as Axis]];

    const scale = sphereRadius / Math.pow(2, address.length - 1);
    matrix[0] *= scale;
    matrix[1] *= scale;
    matrix[2] *= scale;
    matrix[4] *= scale;
    matrix[5] *= scale;
    matrix[6] *= scale;
    matrix[8] *= scale;
    matrix[9] *= scale;
    matrix[10] *= scale;

    const translation = SectorTransform.calculateTranslation(address, sphereRadius);
    matrix[3] = translation.x;
    matrix[7] = translation.y;
    matrix[11] = translation.z;

    return matrix as ModelMatrix;
  }

  static calculateTranslation(address: number[], sphereRadius: number): Vector3Like {
    let a = 0;
    let b = 0;
    //first calculates relative translation
    //sum of translation of the quadrant on each level
    for (let i = 1; i < address.length; i++) {
      const factor = Math.pow(2, i);
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
          throw `Invalid sector address: ${address.join('')}`;
      }
    }

    //then turns relative translation to absolute (for particular side of the cube)
    switch (address[0]) {
      case Axis.xPos:
        return { x: sphereRadius, y: b, z: -a };
      case Axis.xNeg:
        return { x: -sphereRadius, y: b, z: a };
      case Axis.yPos:
        return { x: a, y: sphereRadius, z: -b };
      case Axis.yNeg:
        return { x: a, y: -sphereRadius, z: b };
      case Axis.zPos:
        return { x: a, y: b, z: sphereRadius };
      case Axis.zNeg:
        return { x: a, y: -b, z: -sphereRadius };
      default:
        throw `Invalid sector address: ${address.join('')}`;
    }
  }
}

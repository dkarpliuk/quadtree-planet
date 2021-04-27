/**
 * Helper class for miscellaneous calculations
 */
export class CalcMisc {
  static calcDistance(fromVector, toVector) {
    let a = fromVector.x - toVector.x;
    let b = fromVector.y - toVector.y;
    let c = fromVector.z - toVector.z;

    return Math.sqrt(a * a + b * b + c * c);
  }
}
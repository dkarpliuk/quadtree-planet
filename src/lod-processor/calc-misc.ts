export interface Vector3Like {
  x: number;
  y: number;
  z: number;
}

export class CalcMisc {
  static calcDistance(fromVector: Vector3Like, toVector: Vector3Like): number {
    const a = fromVector.x - toVector.x;
    const b = fromVector.y - toVector.y;
    const c = fromVector.z - toVector.z;

    return Math.sqrt(a * a + b * b + c * c);
  }
}

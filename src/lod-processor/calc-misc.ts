export interface Vector3Like {
  x: number;
  y: number;
  z: number;
}

//flat buffer indices of the perimeter, computed once and reused
const perimeterCache = new Map<number, Int32Array>();

export class CalcMisc {
  static calcDistance(fromVector: Vector3Like, toVector: Vector3Like): number {
    const a = fromVector.x - toVector.x;
    const b = fromVector.y - toVector.y;
    const c = fromVector.z - toVector.z;

    return Math.sqrt(a * a + b * b + c * c);
  }

  /**
   * Flat x/y/z buffer indices for the perimeter vertices of an n x n row-major
   * grid, walking clockwise from the top-left corner.
   */
  static getPerimeterIndices(n: number): Int32Array {
    let indices = perimeterCache.get(n);
    if (indices) return indices;

    const vertices: number[] = [];
    for (let col = 0; col < n; col++) vertices.push(col);
    for (let row = 1; row < n; row++) vertices.push(row * n + (n - 1));
    for (let col = n - 2; col >= 0; col--) vertices.push((n - 1) * n + col);
    for (let row = n - 2; row >= 1; row--) vertices.push(row * n);

    indices = Int32Array.from(vertices.flatMap(i => [i * 3, i * 3 + 1, i * 3 + 2]));
    perimeterCache.set(n, indices);
    return indices;
  }
}

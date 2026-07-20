import { Matrix4, PlaneGeometry, Vector3 } from 'three';
import type { ModelMatrix } from './sector-transform';

//the padded work grid is shared scratch, built once and only re-transformed per
//sector; it stays alive between the two calls of a single instantiate
let workGeometry: PlaneGeometry | null = null;
let workGridTemplate: Float32Array | null = null;
const workVertex = new Vector3();
const workMatrix = new Matrix4();

/**
 * Generic geometry maths backed by three.js - grid generation, matrix transform
 * and vertex normals. The unique planetary algorithm (tangent warp, spherize,
 * edge-collapse stitch) stays in the Sector; this only keeps three's wheels out
 * of it. Stateful scratch, but the methods are a static utility.
 */
export class GeometryMath {
  /**
   * Builds the sector's work grid - a plane padded by one cell on every side -
   * placed on the cube by the raw 16-number transform. Returns the reused
   * position buffer for the caller to warp and spherize in place.
   */
  static buildWorkGrid(density: number, modelMatrix: ModelMatrix): Float32Array {
    let segments = density + 2;
    if (!workGeometry || workGeometry.parameters.widthSegments !== segments) {
      let size = 2 + 4 / density;
      workGeometry = new PlaneGeometry(size, size, segments, segments);
      workGridTemplate = Float32Array.from(workGeometry.attributes.position.array);
    }

    workMatrix.set(...modelMatrix);
    let template = workGridTemplate!;
    let positions = workGeometry!.attributes.position.array as Float32Array;
    for (let i = 0; i < template.length; i += 3) {
      workVertex
        .set(template[i], template[i + 1], template[i + 2])
        .applyMatrix4(workMatrix)
        .toArray(positions, i);
    }

    return positions;
  }

  /**
   * Recomputes normals from the work grid positions mutated since buildWorkGrid.
   */
  static computeNormals(): Float32Array {
    workGeometry!.computeVertexNormals();
    return workGeometry!.attributes.normal.array as Float32Array;
  }
}

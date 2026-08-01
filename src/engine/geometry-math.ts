import { BufferAttribute, BufferGeometry, Matrix4, Vector3 } from 'three';

import { getGridTemplate } from '../lib/grid';
import { type ModelMatrix, NORMALIZED } from './sector-transform';

/**
 * Returns a fresh `density`*`density` segments grid, transformed by the `modelMatrix`.
 *
 * Additional `scaleFactor` can be applied (default = 1).
 */
export function buildGrid(
  density: number,
  modelMatrix: ModelMatrix,
  scaleFactor: number = 1): Float32Array {
  //copy: applyMatrix4 mutates in place, the template must stay pristine
  const positions = Float32Array.from(getGridTemplate(density).positions);
  const geometry = new BufferGeometry();
  //the template is one unit wide, a cube face spans twice the normalized half width
  const scale = scaleFactor * NORMALIZED * 2;
  const matrix = new Matrix4()
    .set(...modelMatrix)
    .scale(new Vector3(scale, scale, scale));

  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.applyMatrix4(matrix);

  return positions;
}

/**
 * Computes vertex normals for the given square grid `positions`.
 */
export function computeNormals(positions: Float32Array): Float32Array {
  const density = Math.sqrt(positions.length / 3) - 1;
  if (!Number.isInteger(density) || density < 1)
    throw 'Positions do not form a square grid.';

  const geometry = new BufferGeometry();
  //position by reference (read-only here), index shared, normals written fresh
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setIndex(getGridTemplate(density).index);
  geometry.computeVertexNormals();

  return geometry.attributes.normal.array as Float32Array;
}

import { BufferAttribute, BufferGeometry, Matrix4, PlaneGeometry, Vector3 } from 'three';

import { type ModelMatrix, NORMALIZED } from './sector-transform';

interface GridTemplate {
  //pristine planar positions to transform from
  positions: Float32Array;
  //shared triangle topology, immutable across builds
  index: BufferAttribute;
}

const _gridTemplates = new Map<number, GridTemplate>();

//flat buffer indices of the perimeter, computed once and reused
const _perimeterCache = new Map<number, Int32Array>();

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
  const positions = Float32Array.from(_getOrAddTemplate(density).positions);
  const geometry = new BufferGeometry();
  const matrix = new Matrix4()
    .set(...modelMatrix)
    .scale(new Vector3(scaleFactor, scaleFactor, scaleFactor));

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
  geometry.setIndex(_getOrAddTemplate(density).index);
  geometry.computeVertexNormals();

  return geometry.attributes.normal.array as Float32Array;
}

function _getOrAddTemplate(density: number): GridTemplate {
  let template = _gridTemplates.get(density);
  if (!template) {
    const plane = new PlaneGeometry(NORMALIZED * 2, NORMALIZED * 2, density, density);
    template = {
      positions: Float32Array.from(plane.attributes.position.array),
      index: plane.index!,
    };
    _gridTemplates.set(density, template);
  }

  return template;
}

/**
 * Flat x/y/z buffer indices for the perimeter vertices of an n x n row-major
 * grid, walking clockwise from the top-left corner.
 */
export function getPerimeterIndices(n: number): Int32Array {
  let indices = _perimeterCache.get(n);
  if (indices) return indices;

  const vertices: number[] = [];
  for (let col = 0; col < n; col++) vertices.push(col);
  for (let row = 1; row < n; row++) vertices.push(row * n + (n - 1));
  for (let col = n - 2; col >= 0; col--) vertices.push((n - 1) * n + col);
  for (let row = n - 2; row >= 1; row--) vertices.push(row * n);

  indices = Int32Array.from(vertices.flatMap(i => [i * 3, i * 3 + 1, i * 3 + 2]));
  _perimeterCache.set(n, indices);
  return indices;
}

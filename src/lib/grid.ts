import { type BufferAttribute, PlaneGeometry } from 'three';

/**
 * everything about a square grid that does not depend on where it sits,
 * so everyone building on that density can share it
 */
export interface GridTemplate {
  //positions of a grid one unit wide, to scale and place from
  positions: Float32Array;
  //triangle topology, immutable across builds
  index: BufferAttribute;
  //texture coordinates, spanning the grid from 0 to 1
  uv: BufferAttribute;
}

const _templates = new Map<number, GridTemplate>();

//flat buffer indices of the perimeter, computed once and reused
const _perimeterCache = new Map<number, Int32Array>();

/**
 * The parts of a `density`*`density` segments grid that every build on it has
 * in common, so that none of them starts from scratch.
 */
export function getGridTemplate(density: number): GridTemplate {
  let template = _templates.get(density);

  if (!template) {
    const plane = new PlaneGeometry(1, 1, density, density);

    template = {
      positions: Float32Array.from(plane.attributes.position.array),
      index: plane.index!,
      uv: plane.attributes.uv as BufferAttribute,
    };

    _templates.set(density, template);
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

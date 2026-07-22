import { BufferAttribute, BufferGeometry, Matrix4, PlaneGeometry, Vector3 } from 'three';

import { type ModelMatrix, UNIT_RADIUS } from './sector-transform';

interface GridTemplate {
  //pristine planar positions to transform from
  positions: Float32Array;
  //shared triangle topology, immutable across builds
  index: BufferAttribute;
}

export class GeometryMath {
  private static readonly _templates = new Map<number, GridTemplate>();

  /**
   * Returns a fresh `density`*`density` segments grid, transformed by the `modelMatrix`.
   * 
   * Additional `scaleFactor` can be applied (default = 1).
   */
  static buildGrid(
    density: number,
    modelMatrix: ModelMatrix,
    scaleFactor: number = 1): Float32Array {
    //copy: applyMatrix4 mutates in place, the template must stay pristine
    const positions = Float32Array.from(GeometryMath._getOrAddTemplate(density).positions);
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
  static computeNormals(positions: Float32Array): Float32Array {
    const density = Math.sqrt(positions.length / 3) - 1;
    if (!Number.isInteger(density) || density < 1)
      throw 'Positions do not form a square grid.';

    const geometry = new BufferGeometry();
    //position by reference (read-only here), index shared, normals written fresh
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.setIndex(GeometryMath._getOrAddTemplate(density).index);
    geometry.computeVertexNormals();

    return geometry.attributes.normal.array as Float32Array;
  }

  private static _getOrAddTemplate(density: number): GridTemplate {
    let template = GeometryMath._templates.get(density);
    if (!template) {
      const plane = new PlaneGeometry(UNIT_RADIUS * 2, UNIT_RADIUS * 2, density, density);
      template = {
        positions: Float32Array.from(plane.attributes.position.array),
        index: plane.index!,
      };
      GeometryMath._templates.set(density, template);
    }

    return template;
  }
}

import { Material, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';
import type { SectorBuffer } from '../engine';

const defaultMaterial = new MeshBasicMaterial({ color: 0xffffff, wireframe: true });

/**
 * main-side three adapter: turns a sector's geometry buffer into a renderable Mesh.
 * A layer subclasses this to supply its material.
 */
export class SectorMesh {
  protected _geometry: PlaneGeometry | null = null;
  protected _mesh: Mesh | null = null;

  get mesh(): Mesh { return this._mesh!; }

  /**
   * template method: the material the sector is drawn with
   */
  protected get _material(): Material { return defaultMaterial; }

  /**
   * builds the mesh on the first buffer, refills it on later ones
   */
  load(buffer: SectorBuffer) {
    if (!this._geometry) {
      //size is irrelevant (positions are overwritten); only the segment count,
      //which fixes the triangle topology (index), matters
      const density = Math.sqrt(buffer.positions.length / 3) - 1;
      this._geometry = new PlaneGeometry(1, 1, density, density);
      this._mesh = new Mesh(this._geometry, this._material);
    }

    //memcpy, not a new attribute: three never frees the old GL buffer on a swap
    //https://github.com/mrdoob/three.js/issues/26835
    const position = this._geometry.attributes.position;
    const normal = this._geometry.attributes.normal;
    (position.array as Float32Array).set(buffer.positions);
    (normal.array as Float32Array).set(buffer.normals);
    position.needsUpdate = true;
    normal.needsUpdate = true;
  }

  dispose() {
    if (this._geometry) {
      this._geometry.dispose();
      this._geometry = null;
      this._mesh = null;
    }
  }
}

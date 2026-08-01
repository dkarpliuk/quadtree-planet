import { BufferAttribute, BufferGeometry, Material, Mesh, MeshBasicMaterial } from 'three';

import type { SectorBuffer } from '../engine';
import { getGridTemplate } from '../lib/grid';

const defaultMaterial = new MeshBasicMaterial({ color: 0xffffff, wireframe: true });

/**
 * main-side three adapter: turns a sector's geometry buffer into a renderable Mesh.
 * A layer subclasses this to supply its material.
 */
export class SectorMesh {
  protected _geometry: BufferGeometry | null = null;
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
      this._geometry = createGeometry(buffer);
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
      //the shared ones belong to every other sector too, so detach them first
      this._geometry.setIndex(null);
      this._geometry.deleteAttribute('uv');

      this._geometry.dispose();
      this._geometry = null;
      this._mesh = null;
    }
  }
}

function createGeometry(buffer: SectorBuffer): BufferGeometry {
  const vertices = buffer.positions.length / 3;
  const { index, uv } = getGridTemplate(Math.sqrt(vertices) - 1);
  const geometry = new BufferGeometry();

  geometry.setIndex(index);
  geometry.setAttribute('uv', uv);
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(vertices * 3), 3));
  geometry.setAttribute('normal', new BufferAttribute(new Float32Array(vertices * 3), 3));

  return geometry;
}

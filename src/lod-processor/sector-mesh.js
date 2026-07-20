import { Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';

const defaultMaterial = new MeshBasicMaterial({ color: 0xffffff, wireframe: true });

/**
 * three.js adapter for a Sector. The Sector does the maths and drives this
 * through the interface below; a layer supplies a concrete subclass, overriding
 * the template methods (material, height offset) to vary how the surface looks
 * and rises, without the Sector knowing which layer it belongs to.
 */
export class SectorMesh {
  _geometry = null;
  _mesh = null;

  get mesh() { return this._mesh; }
  get positions() { return this._geometry.attributes.position.array; }
  get normals() { return this._geometry.attributes.normal.array; }

  /**
   * template method: the material the sector is drawn with
   */
  get _material() { return defaultMaterial; }

  /**
   * template method: height above the base sphere at a surface point
   */
  getHeightOffset(vx, vy, vz) { return 0; }

  /**
   * @param {number} density
   */
  allocate(density) {
    this._geometry = new PlaneGeometry(2, 2, density, density);
    this._mesh = new Mesh(this._geometry, this._material);
  }

  /**
   * flags the buffers for re-upload after the sector wrote into them
   */
  commit() {
    this._geometry.attributes.position.needsUpdate = true;
    this._geometry.attributes.normal.needsUpdate = true;
  }

  dispose() {
    if (this._geometry) {
      this._geometry.dispose();
      this._geometry = null;
      this._mesh = null;
    }
  }
}

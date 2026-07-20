import { Material, Mesh, MeshBasicMaterial, PlaneGeometry } from 'three';

const defaultMaterial = new MeshBasicMaterial({ color: 0xffffff, wireframe: true });

/**
 * three.js adapter for a Sector. The Sector does the maths and drives this
 * through the interface below; a layer supplies a concrete subclass, overriding
 * the template methods (material, height offset) to vary how the surface looks
 * and rises, without the Sector knowing which layer it belongs to.
 */
export class SectorMesh {
  protected _geometry: PlaneGeometry | null = null;
  protected _mesh: Mesh | null = null;

  get mesh(): Mesh { return this._mesh!; }
  get positions(): Float32Array { return this._geometry!.attributes.position.array as Float32Array; }
  get normals(): Float32Array { return this._geometry!.attributes.normal.array as Float32Array; }

  /**
   * template method: the material the sector is drawn with
   */
  protected get _material(): Material { return defaultMaterial; }

  /**
   * template method: height above the base sphere at a surface point
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getHeightOffset(vx: number, vy: number, vz: number): number { return 0; }

  allocate(density: number) {
    this._geometry = new PlaneGeometry(2, 2, density, density);
    this._mesh = new Mesh(this._geometry, this._material);
  }

  /**
   * flags the buffers for re-upload after the sector wrote into them
   */
  commit() {
    this._geometry!.attributes.position.needsUpdate = true;
    this._geometry!.attributes.normal.needsUpdate = true;
  }

  dispose() {
    if (this._geometry) {
      this._geometry.dispose();
      this._geometry = null;
      this._mesh = null;
    }
  }
}

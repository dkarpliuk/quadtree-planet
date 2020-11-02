import { Matrix4, Mesh, MeshBasicMaterial, PlaneBufferGeometry, Vector3 } from 'three';
import { SectorTransform } from '../../core/sector-transform';

const density = 16; //must be power of 2
const material = new MeshBasicMaterial({ color: 0xffffff, wireframe: true })

export class Sector {
  _address = null;
  _center = null;
  _mesh = null;
  _sphereRadius = null;

  get _density() { return density; }
  get _material() { return material; }

  get address() { return this._address; }
  get center() {
    if (!this._center) {
      this._center = this._calculateCenter();
    }

    return this._center;
  }

  get visible() { return this._mesh?.visible; }
  set visible(value) {
    if (this._mesh) {
      this._mesh.visible = value;
    }
  }

  constructor(address, sphereRadius) {
    this._address = address;
    this._sphereRadius = sphereRadius;
  }

  instantiate(attractor) {
    let geometry = new PlaneBufferGeometry(2, 2, this._density, this._density);
    this._mesh = new Mesh(geometry, this._material);

    attractor.add(this._mesh);

    let rawMatrix = SectorTransform.calculateTransformationMatrix(this.address, this._sphereRadius);
    let transformationMatrix = new Matrix4().set(...rawMatrix);
    this._mesh.geometry.applyMatrix4(transformationMatrix);
    this._spherize();
  }
  
  detach(attractor) {
    attractor.remove(this._mesh);
  }
  
  _calculateCenter() {
    let vertices = this._mesh.geometry.attributes.position.array;
    let mid = Math.round((vertices.length - 1) / 2);
    return new Vector3(vertices[mid - 1], vertices[mid], vertices[mid + 1])
      .normalize()
      .multiplyScalar(this._sphereRadius);
  }

  _spherize() {
    let vertices = this._mesh.geometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
      let vx = vertices[i];
      let vy = vertices[i + 1];
      let vz = vertices[i + 2];

      let factor = this._sphereRadius / Math.sqrt(vx * vx + vy * vy + vz * vz);

      vertices[i] *= factor;
      vertices[i + 1] *= factor;
      vertices[i + 2] *= factor;
    }
  }
}
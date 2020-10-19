import { Matrix4, Mesh, MeshBasicMaterial, PlaneBufferGeometry, Vector3 } from 'three';

const density = 128; //must be power of 2
const material = new MeshBasicMaterial({ color: 0xfff, wireframe: false })

export class Area {
  _mesh = null;

  get _geometry() {
    return this._mesh?.geometry;
  }

  get _density() {
    return density;
  }

  get _material() {
    return material;
  }

  get center() {
    if (!this._geometry) {
      return null;
    }

    let vertices = this._geometry.attributes.position.array;
    let mid = Math.round(vertices / 2);
    return new Vector3(mid - 1, mid, mid + 1);
  }

  get visible() {
    return this._mesh?.visible;
  }
  set visible(value) {
    if (this._mesh) {
      this._mesh.visible = value;
    }
  }

  constructor() {
    let geometry = new PlaneBufferGeometry(1, 1, this._density, this._density);
    this._mesh = new Mesh(geometry, this._material);
  }

  instantiate(attractor, matrix) {
    attractor.add(this._mesh);
    let transformMatrix = new Matrix4().fromArray(matrix);
    this._geometry.applyMatrix4(transformMatrix);

    let sphereRadius = transformMatrix.getMaxScaleOnAxis();
    this._spherize(sphereRadius);
  }

  _spherize(sphereRadius) {
    let vertices = this._geometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
      let vx = vertices[i];
      let vy = vertices[i + 1];
      let vz = vertices[i + 2];

      let factor = Math.sqrt(vx * vx + vy * vy + vz * vz) * sphereRadius;

      vertices[i] *= factor;
      vertices[i + 1] *= factor;
      vertices[i + 2] *= factor;
    }
  }
}

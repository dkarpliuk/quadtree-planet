import { Matrix4, Mesh, MeshBasicMaterial, PlaneBufferGeometry, Ray, Vector3 } from 'three';

const density = 8; //must be power of 2
const material = new MeshBasicMaterial({ color: 0xffffff, wireframe: true })

export class Area {
  _mesh = null;
  _center = null;

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
    return this._center;
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
    let geometry = new PlaneBufferGeometry(2, 2, this._density, this._density);
    this._mesh = new Mesh(geometry, this._material);
  }

  instantiate(attractor, matrix) {
    attractor.add(this._mesh);
    let transformationMatrix = new Matrix4().set(...matrix);
    this._geometry.applyMatrix4(transformationMatrix);

    let sphereRadius = this._getMaxTranslationOnAxis(matrix);
    this._center = this._calculateCenter(sphereRadius);
    this._spherize(sphereRadius);
  }

  _getMaxTranslationOnAxis(matrix) {
    let result = Math.abs(matrix[3]);
    if (Math.abs(matrix[7]) > result) {
      result = Math.abs(matrix[7]);
    }
    if (Math.abs(matrix[11]) > result) {
      result = Math.abs(matrix[11]);
    }

    return result;
  }

  _calculateCenter(sphereRadius) {
    let vertices = this._geometry.attributes.position.array;
    let mid = Math.round(vertices.length / 2);
    return new Vector3(vertices[mid - 1], vertices[mid], vertices[mid + 1])
      .normalize()
      .multiplyScalar(sphereRadius);
  }

  _spherize(sphereRadius) {
    let vertices = this._geometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
      let vx = vertices[i];
      let vy = vertices[i + 1];
      let vz = vertices[i + 2];

      let factor = sphereRadius / Math.sqrt(vx * vx + vy * vy + vz * vz);

      vertices[i] *= factor;
      vertices[i + 1] *= factor;
      vertices[i + 2] *= factor;
    }
  }
}

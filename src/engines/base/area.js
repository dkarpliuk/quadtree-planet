import { Matrix4, Mesh, MeshBasicMaterial, PlaneBufferGeometry, Vector3 } from 'three';

const density = 128; //must be power of 2
const material = new MeshBasicMaterial({ color: 0xfff, wireframe: false })

export class Area {
  #mesh = null;

  get #geometry() {
    return this.#mesh?.geometry;
  }

  get #density() {
    return density;
  }

  get #material() {
    return material;
  }

  get center() {
    if (!this.#geometry) {
      return null;
    }

    let vertices = this.#geometry.attributes.position.array;
    let mid = Math.round(vertices / 2);
    return new Vector3(mid - 1, mid, mid + 1);
  }

  get visible() {
    return this.#mesh?.visible;
  }
  set visible(value) {
    if (this.#mesh) {
      this.#mesh.visible = value;
    }
  }

  constructor() {
    let geometry = new PlaneBufferGeometry(1, 1, this.#density, this.#density);
    this.#mesh = new Mesh(geometry, this.#material);
  }

  instantiate(attractor, matrix) {
    attractor.add(this.#mesh);
    let transformMatrix = new Matrix4().fromArray(matrix);
    this.#geometry.applyMatrix4(transformMatrix);

    let sphereRadius = transformMatrix.getMaxScaleOnAxis();
    this.#spherize(sphereRadius);
  }

  #spherize(sphereRadius) {
    let vertices = this.#geometry.attributes.position.array;

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

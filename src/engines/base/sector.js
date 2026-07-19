import { SectorTransform } from '@core';
import { Direction } from '@enums';
import { Matrix4, Mesh, MeshBasicMaterial, Object3D, PlaneBufferGeometry, Vector3 } from 'three';

const density = 32; //must be even so edges halve cleanly when stitching
const material = new MeshBasicMaterial({ color: 0xffffff, wireframe: true });

export class Sector {
  _center = null;
  _mesh = null;
  _sphereRadius = null;

  /**
   * pristine full-resolution vertex positions, captured before the first stitch
   * so that edges can be restored and re-stitched when neighbor LOD changes
   * @type {Float32Array}
   */
  _pristinePositions = null;

  /**
   * set of directions currently stitched (joined), to skip redundant work
   * @type {string}
   */
  _stitchedKey = null;

  get _density() { return density; }
  get _material() { return material; }

  /**
   * @type {Vector3}
   */
  get center() {
    if (!this._center) {
      this._center = this._calculateCenter();
    }

    return this._center;
  }

  /**
   * @type {boolean}
   */
  get visible() { return this._mesh?.visible; }
  set visible(value) {
    if (this._mesh) {
      this._mesh.visible = value;
    }
  }

  /**
   * @param {number} sphereRadius 
   */
  constructor(sphereRadius) {
    this._sphereRadius = sphereRadius;
  }

  /**
   * instantiates the sector in 3D space and performs the initial transformation
   * @param {Object3D} attractor 
   * @param {number[]} address 
   */
  instantiate(attractor, address) {
    let geometry = new PlaneBufferGeometry(2, 2, this._density, this._density);
    this._mesh = new Mesh(geometry, this._material);

    attractor.add(this._mesh);

    //place sector on the cube
    let rawMatrix = SectorTransform.calculateTransformationMatrix(address, this._sphereRadius);
    let transformationMatrix = new Matrix4().set(...rawMatrix);
    this._mesh.geometry.applyMatrix4(transformationMatrix);

    //then spherize
    this._applyTangentWarp();
    this._spherize();
    this._mesh.geometry.computeVertexNormals();

    //fresh geometry: drop any stitching state from a previous instantiation
    this._pristinePositions = null;
    this._stitchedKey = null;
  }

  /**
   * Removes mesh from render
   * @param {Object3D} attractor 
   */
  clear(attractor) {
    if (!this._mesh) {
      return;
    }

    attractor.remove(this._mesh);
    scene.remove(this._mesh);
    this._mesh.geometry.dispose();
    this._mesh = null;

    //release the stitch snapshot right away instead of waiting for GC/reinstance
    this._pristinePositions = null;
    this._stitchedKey = null;
  }

  /**
   * Docks this sector with lower-LOD neighbors on the given sides, closing the
   * seams. Non-destructive across passes: full resolution is restored before
   * re-applying, so the sector unstitches cleanly when a neighbor refines.
   * @param {Direction[]} directions
   */
  stitch(directions) {
    let key = directions.join('');
    if (key === this._stitchedKey) {
      return;
    }

    let position = this._mesh.geometry.attributes.position;

    //restore full-resolution edges captured before the first stitch
    if (this._pristinePositions) {
      position.array.set(this._pristinePositions);
    }

    if (directions.length > 0) {
      if (!this._pristinePositions) {
        this._pristinePositions = Float32Array.from(position.array);
      }

      for (let direction of directions) {
        this._stitchEdge(direction);
      }
    }

    this._stitchedKey = key;
    position.needsUpdate = true;
    this._mesh.geometry.computeVertexNormals();
  }

  /**
   * collapses every other vertex along one edge onto its neighbor, degenerating
   * the in-between triangles so the edge matches a neighbor of half the density
   * (i.e. a 2:1 / one-level-coarser neighbor)
   * @param {Direction} direction
   */
  _stitchEdge(direction) {
    let n = this._density + 1; //sector grid dimension

    if (direction == Direction.up) {
      for (let x = 1, y = 0; x < n; x += 2) {
        this._mergeVertices(n * y + x, n * y + x - 1);
      }
    } else if (direction == Direction.right) {
      for (let x = n - 1, y = 1; y < n; y += 2) {
        this._mergeVertices(n * y + x, n * (y + 1) + x);
      }
    } else if (direction == Direction.down) {
      for (let x = n - 2, y = n - 1; x >= 0; x -= 2) {
        this._mergeVertices(n * y + x, n * y + x + 1);
      }
    } else if (direction == Direction.left) {
      for (let x = 0, y = n - 2; y >= 0; y -= 2) {
        this._mergeVertices(n * y + x, n * (y - 1) + x);
      }
    }
  }

  _calculateCenter() {
    let vertices = this._mesh.geometry.attributes.position.array;
    let mid = Math.round((vertices.length - 1) / 2);
    return new Vector3(vertices[mid - 1], vertices[mid], vertices[mid + 1])
      .normalize()
      .multiplyScalar(this._sphereRadius);
  }

  /**
   * Redistributes the grid across the cube face so that spherizing it yields
   * cells of near-equal angular size, instead of cells shrinking towards the
   * face edges.
   *
   * The grid stays axis-aligned after the face transform, so each tangential
   * axis only holds (density + 1) distinct coordinates - they are warped once
   * and reused, rather than calling tan per vertex.
   */
  _applyTangentWarp() {
    let vertices = this._mesh.geometry.attributes.position.array;
    let n = this._density + 1;

    //the axis that stays constant is the face axis; the other two are tangential
    let columnAxis = -1;
    let rowAxis = -1;
    for (let axis = 0; axis < 3; axis++) {
      if (vertices[3 + axis] !== vertices[axis]) columnAxis = axis;
      if (vertices[n * 3 + axis] !== vertices[axis]) rowAxis = axis;
    }

    let warp = (coordinate) =>
      Math.tan(coordinate / this._sphereRadius * Math.PI / 4) * this._sphereRadius;

    let columnValues = new Float64Array(n);
    let rowValues = new Float64Array(n);
    for (let k = 0; k < n; k++) {
      columnValues[k] = warp(vertices[k * 3 + columnAxis]);
      rowValues[k] = warp(vertices[k * n * 3 + rowAxis]);
    }

    for (let row = 0; row < n; row++) {
      for (let column = 0; column < n; column++) {
        let i = (row * n + column) * 3;
        vertices[i + columnAxis] = columnValues[column];
        vertices[i + rowAxis] = rowValues[row];
      }
    }
  }

  /**
   * key method that turns a cube into a sphere
   * (moves each vertex to be the same distance from the center)
   */
  _spherize() {
    let vertices = this._mesh.geometry.attributes.position.array;

    for (let i = 0; i < vertices.length; i += 3) {
      let vx = vertices[i];
      let vy = vertices[i + 1];
      let vz = vertices[i + 2];

      let length = Math.sqrt(vx * vx + vy * vy + vz * vz);
      let scale = this._sphereRadius / length;

      let heightOffset = this._computeHeightOffset(vx * scale, vy * scale, vz * scale);
      let factor = (this._sphereRadius + heightOffset) / length;

      vertices[i] *= factor;
      vertices[i + 1] *= factor;
      vertices[i + 2] *= factor;
    }
  }

  /**
   * set vertex1 position same as vertex2 position
   * @param {number} v1Number
   * @param {number} v2Number
   */
  _mergeVertices(v1Number, v2Number) {
    let vertices = this._mesh.geometry.attributes.position.array;

    vertices[v1Number * 3] = vertices[v2Number * 3];
    vertices[v1Number * 3 + 1] = vertices[v2Number * 3 + 1];
    vertices[v1Number * 3 + 2] = vertices[v2Number * 3 + 2];
  }

  /**
   * @param {number} vx 
   * @param {number} vy 
   * @param {number} vz 
   */
  _computeHeightOffset(vx, vy, vz) {
    return 0;
  }
}
import { SectorTransform } from '@core';
import { Direction } from '@enums';
import { Matrix4, Mesh, MeshBasicMaterial, Object3D, PlaneBufferGeometry, Vector3 } from 'three';

const density = 32; //must be even so edges halve cleanly when stitching
const material = new MeshBasicMaterial({ color: 0xffffff, wireframe: true });

//every sector shares the same padded grid, so it is built once and only
//re-transformed per sector; scratch, alive within a single instantiate
let workGridTemplate = null;
let workGrid = null;
const workVertex = new Vector3();

export class Sector {
  _center = null;
  _boundingRadius = null;
  _mesh = null;
  _sphereRadius = null;

  /**
   * pristine full-resolution vertex positions, captured before the first stitch
   * so that edges can be restored and re-stitched when neighbor LOD changes
   * @type {Float32Array}
   */
  _pristinePositions = null;

  /**
   * @type {Float32Array}
   */
  _pristineNormals = null;

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
      let n = this._density + 1;
      this._center = this._readVertex((n * n - 1) / 2);
    }

    return this._center;
  }

  /**
   * approximated from the four corners - the patch is convex, so they are its
   * farthest points apart from terrain bulging in the middle
   * @type {number}
   */
  get boundingRadius() {
    if (this._boundingRadius === null) {
      let n = this._density + 1;
      let corners = [0, n - 1, n * (n - 1), n * n - 1];
      this._boundingRadius = Math.max(...corners.map(v => this._readVertex(v).distanceTo(this.center)));
    }

    return this._boundingRadius;
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

    //then spherize
    let workGrid = this._buildWorkGrid(transformationMatrix);
    this._applyTangentWarp(workGrid, this._density + 3);
    this._spherize(workGrid);
    this._copyInnerGrid(workGrid, geometry.attributes.position.array);
    this._computeNormals(workGrid, geometry.attributes.normal.array);

    //fresh geometry: drop everything cached from a previous instantiation
    this._center = null;
    this._boundingRadius = null;
    this._pristinePositions = null;
    this._pristineNormals = null;
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

    this._pristinePositions = null;
    this._pristineNormals = null;
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
    let normal = this._mesh.geometry.attributes.normal;

    //restore full-resolution edges captured before the first stitch
    if (this._pristinePositions) {
      position.array.set(this._pristinePositions);
      normal.array.set(this._pristineNormals);
    }

    if (directions.length > 0) {
      if (!this._pristinePositions) {
        this._pristinePositions = Float32Array.from(position.array);
        this._pristineNormals = Float32Array.from(normal.array);
      }

      for (let direction of directions) {
        this._stitchEdge(direction);
      }
    }

    this._stitchedKey = key;
    position.needsUpdate = true;
    normal.needsUpdate = true;
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

  /**
   * Grid covering the sector plus one cell of padding on every side, placed on
   * the cube by the same transform. The padding gives the sector's edge vertices
   * neighbours on all sides, which the rendered grid alone cannot provide.
   * @param {Matrix4} transformationMatrix
   * @returns {Float32Array}
   */
  _buildWorkGrid(transformationMatrix) {
    let vertexCount = Math.pow(this._density + 3, 2);
    if (!workGridTemplate || workGridTemplate.count !== vertexCount) {
      let segments = this._density + 2;
      let size = 2 + 4 / this._density;
      workGridTemplate = new PlaneBufferGeometry(size, size, segments, segments).attributes.position;
      workGrid = new Float32Array(workGridTemplate.array.length);
    }

    for (let i = 0; i < workGridTemplate.count; i++) {
      workVertex.fromBufferAttribute(workGridTemplate, i)
        .applyMatrix4(transformationMatrix)
        .toArray(workGrid, i * 3);
    }

    return workGrid;
  }

  /**
   * @param {Float32Array} source work grid, padded by one cell on every side
   * @param {Float32Array} target rendered grid
   */
  _copyInnerGrid(source, target) {
    let n = this._density + 1;
    let stride = n + 2;

    for (let row = 0; row < n; row++) {
      for (let column = 0; column < n; column++) {
        let from = ((row + 1) * stride + column + 1) * 3;
        let to = (row * n + column) * 3;
        target[to] = source[from];
        target[to + 1] = source[from + 1];
        target[to + 2] = source[from + 2];
      }
    }
  }

  /**
   * Normal of every rendered vertex, from central differences over its four
   * neighbours in the work grid. Because it depends only on position, two
   * sectors meeting at a shared vertex derive the same normal and the lighting
   * runs seamlessly across the boundary.
   * @param {Float32Array} source work grid, padded by one cell on every side
   * @param {Float32Array} target rendered grid normals
   */
  _computeNormals(source, target) {
    let n = this._density + 1;
    let stride = n + 2;

    for (let row = 0; row < n; row++) {
      for (let column = 0; column < n; column++) {
        let left = ((row + 1) * stride + column) * 3;
        let right = left + 6;
        let up = (row * stride + column + 1) * 3;
        let down = up + stride * 6;

        let ax = source[right] - source[left];
        let ay = source[right + 1] - source[left + 1];
        let az = source[right + 2] - source[left + 2];

        let bx = source[down] - source[up];
        let by = source[down + 1] - source[up + 1];
        let bz = source[down + 2] - source[up + 2];

        let nx = by * az - bz * ay;
        let ny = bz * ax - bx * az;
        let nz = bx * ay - by * ax;

        //the planet sits at the origin, so an outward normal points away from it
        let center = up + stride * 3;
        if (nx * source[center] + ny * source[center + 1] + nz * source[center + 2] < 0) {
          nx = -nx;
          ny = -ny;
          nz = -nz;
        }

        let length = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
        let to = (row * n + column) * 3;
        target[to] = nx / length;
        target[to + 1] = ny / length;
        target[to + 2] = nz / length;
      }
    }
  }

  /**
   * @param {number} index
   * @returns {Vector3}
   */
  _readVertex(index) {
    let vertices = this._mesh.geometry.attributes.position.array;
    let i = index * 3;
    return new Vector3(vertices[i], vertices[i + 1], vertices[i + 2]);
  }

  /**
   * Redistributes the grid across the cube face so that spherizing it yields
   * cells of near-equal angular size.
   *
   * The grid stays axis-aligned after the face transform, so each tangential
   * axis only holds n distinct coordinates, warped once and reused.
   * @param {Float32Array} vertices
   * @param {number} n grid dimension in vertices
   */
  _applyTangentWarp(vertices, n) {
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
   * @param {Float32Array} vertices
   */
  _spherize(vertices) {
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
   * moves vertex1 onto vertex2, normal included
   * @param {number} v1Number
   * @param {number} v2Number
   */
  _mergeVertices(v1Number, v2Number) {
    let positions = this._mesh.geometry.attributes.position.array;
    let normals = this._mesh.geometry.attributes.normal.array;
    let i1 = v1Number * 3;
    let i2 = v2Number * 3;

    for (let axis = 0; axis < 3; axis++) {
      positions[i1 + axis] = positions[i2 + axis];
      normals[i1 + axis] = normals[i2 + axis];
    }
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
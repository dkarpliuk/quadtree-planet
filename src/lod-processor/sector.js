import { SectorTransform } from './sector-transform';
import { Direction } from './direction';
import { SectorMesh } from './sector-mesh';
import { GeometryMath } from './geometry-math';
import { CalcMisc } from './calc-misc';

const density = 32; //must be even so edges halve cleanly when stitching

export class Sector {
  _center = null;
  _boundingRadius = null;
  _sphereRadius = null;

  /**
   * @type {SectorMesh}
   */
  _sectorMesh = null;

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

  get mesh() { return this._sectorMesh.mesh; }

  /**
   * @type {{x: number, y: number, z: number}}
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
      this._boundingRadius = Math.max(...corners.map(v => CalcMisc.calcDistance(this._readVertex(v), this.center)));
    }

    return this._boundingRadius;
  }

  /**
   * @param {number} sphereRadius
   * @param {SectorMesh} sectorMesh
   */
  constructor(sphereRadius, sectorMesh) {
    this._sphereRadius = sphereRadius;
    this._sectorMesh = sectorMesh;
  }

  /**
   * builds the sector geometry and performs the initial transformation
   * @param {number[]} address
   */
  instantiate(address) {
    this._sectorMesh.allocate(this._density);

    //place sector on the cube
    let rawMatrix = SectorTransform.calculateTransformationMatrix(address, this._sphereRadius);

    //then spherize
    let workPositions = GeometryMath.buildWorkGrid(this._density, rawMatrix);
    this._applyTangentWarp(workPositions, this._density + 3);
    this._spherize(workPositions);
    let workNormals = GeometryMath.computeNormals();

    this._copyInnerGrid(workPositions, this._sectorMesh.positions);
    this._copyInnerGrid(workNormals, this._sectorMesh.normals);
    this._sectorMesh.commit();

    //fresh geometry: drop everything cached from a previous instantiation
    this._center = null;
    this._boundingRadius = null;
    this._pristinePositions = null;
    this._pristineNormals = null;
    this._stitchedKey = null;
  }

  clear() {
    this._sectorMesh.dispose();

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

    let positions = this._sectorMesh.positions;
    let normals = this._sectorMesh.normals;

    //restore full-resolution edges captured before the first stitch
    if (this._pristinePositions) {
      positions.set(this._pristinePositions);
      normals.set(this._pristineNormals);
    }

    if (directions.length > 0) {
      if (!this._pristinePositions) {
        this._pristinePositions = Float32Array.from(positions);
        this._pristineNormals = Float32Array.from(normals);
      }

      for (let direction of directions) {
        this._stitchEdge(direction);
      }
    }

    this._stitchedKey = key;
    this._sectorMesh.commit();
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
   * @param {number} index
   * @returns {{x: number, y: number, z: number}}
   */
  _readVertex(index) {
    let vertices = this._sectorMesh.positions;
    let i = index * 3;
    return { x: vertices[i], y: vertices[i + 1], z: vertices[i + 2] };
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

      let heightOffset = this._sectorMesh.getHeightOffset(vx * scale, vy * scale, vz * scale);
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
    let positions = this._sectorMesh.positions;
    let normals = this._sectorMesh.normals;
    let i1 = v1Number * 3;
    let i2 = v2Number * 3;

    for (let axis = 0; axis < 3; axis++) {
      positions[i1 + axis] = positions[i2 + axis];
      normals[i1 + axis] = normals[i2 + axis];
    }
  }
}

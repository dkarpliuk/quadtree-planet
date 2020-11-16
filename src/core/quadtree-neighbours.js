import { Direction } from '../enums/direction';

/**
 * Yoder R and Bloniarz P 2006 A Practical Algorithm for Computing Neighbors in Quadtrees, Octrees, and Hyperoctrees
 * FSM simplified to use for orthogonal directions only
 * @example
 * //returns the right neighbor of quadrant number 1 and halt flag
 * QuadtreeNeighborsFSM.get(Direction.right)[3]
 */
const QuadtreeNeighborsFSM = new Map([
  [Direction.right, [
    { quadrant: 1, halt: true },
    { quadrant: 0, halt: false },
    { quadrant: 3, halt: true },
    { quadrant: 2, halt: false }
  ]],
  [Direction.left, [
    { quadrant: 1, halt: false },
    { quadrant: 0, halt: true },
    { quadrant: 3, halt: false },
    { quadrant: 2, halt: true }
  ]],
  [Direction.down, [
    { quadrant: 2, halt: true },
    { quadrant: 3, halt: true },
    { quadrant: 0, halt: false },
    { quadrant: 1, halt: false }
  ]],
  [Direction.up, [
    { quadrant: 2, halt: false },
    { quadrant: 3, halt: false },
    { quadrant: 0, halt: true },
    { quadrant: 1, halt: true }
  ]],
]);

/**
 * FSM of adjacent cube sides
 * @example
 * //returns the right neighbor of cube side number 1
 * //refer to AxisEnum for cube sides numeration
 * CubeNeighborsFSM.get(Direction.right)[1]
 */
const CubeNeighborsFSM = new Map([
  [Direction.right, [5, 4, 0, 0, 0, 1]],
  [Direction.left, [4, 5, 1, 1, 1, 0]],
  [Direction.down, [3, 3, 4, 5, 3, 3]],
  [Direction.up, [2, 2, 5, 4, 2, 2]],
]);

Object.freeze(QuadtreeNeighborsFSM);
Object.freeze(CubeNeighborsFSM);

export { QuadtreeNeighborsFSM, CubeNeighborsFSM };

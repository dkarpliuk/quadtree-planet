//Robert Yoder, Peter Bloniarz - A Practical Algorithm for Computing Neighbors in Quadtrees, Octrees, and Hyperoctrees
//only for orthogonal directions
const QuadtreeNeighboursFSM = {
  "R": [
    { quadrant: 1, halt: true },
    { quadrant: 0, halt: false },
    { quadrant: 3, halt: true },
    { quadrant: 2, halt: false }
  ],
  "L": [
    { quadrant: 1, halt: false },
    { quadrant: 0, halt: true },
    { quadrant: 3, halt: false },
    { quadrant: 2, halt: true }
  ],
  "D": [
    { quadrant: 2, halt: true },
    { quadrant: 3, halt: true },
    { quadrant: 0, halt: false },
    { quadrant: 1, halt: false }
  ],
  "U": [
    { quadrant: 2, halt: false },
    { quadrant: 3, halt: false },
    { quadrant: 0, halt: true },
    { quadrant: 1, halt: true }
  ],
};

//FSM for cube sides (will be used for zero level of tree)
//refer to AxisEnum for cube sides numeration 
const CubeNeighboursFSM = {
  "R": [5, 4, 0, 0, 0, 1],
  "L": [4, 5, 1, 1, 1, 0],
  "D": [3, 3, 4, 5, 3, 3],
  "U": [2, 2, 5, 4, 2, 2]
};

Object.freeze(QuadtreeNeighboursFSM);
Object.freeze(CubeNeighboursFSM);

export { QuadtreeNeighboursFSM, CubeNeighboursFSM };
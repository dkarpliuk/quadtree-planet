import { Axis, Direction } from './enums';

type NeighbourStep = [number, Direction];
type ConversionEntry = [Axis, number[] | null];

//Designed for node address conversion between specific sides of the cube
const addressConversionMatrix = new Map<Axis, Map<Direction, ConversionEntry>>([
  [
    Axis.xPos,
    new Map<Direction, ConversionEntry>([
      //key - direction relative to corresponding axis
      //value[0] - neighbor axis laying on corresponding direction
      //value[1] - quadrant number conversion
      [Direction.right, [Axis.zNeg, [3, 2, 1, 0]]],
      [Direction.left, [Axis.zPos, null]],
      [Direction.down, [Axis.yNeg, [1, 3, 0, 2]]],
      [Direction.up, [Axis.yPos, [2, 0, 3, 1]]],
    ]),
  ],
  [
    Axis.xNeg,
    new Map<Direction, ConversionEntry>([
      [Direction.right, [Axis.zPos, null]],
      [Direction.left, [Axis.zNeg, [3, 2, 1, 0]]],
      [Direction.down, [Axis.yNeg, [2, 0, 3, 1]]],
      [Direction.up, [Axis.yPos, [1, 3, 0, 2]]],
    ]),
  ],
  [
    Axis.yPos,
    new Map<Direction, ConversionEntry>([
      [Direction.right, [Axis.xPos, [1, 3, 0, 2]]],
      [Direction.left, [Axis.xNeg, [2, 0, 3, 1]]],
      [Direction.down, [Axis.zPos, null]],
      [Direction.up, [Axis.zNeg, null]],
    ]),
  ],
  [
    Axis.yNeg,
    new Map<Direction, ConversionEntry>([
      [Direction.right, [Axis.xPos, [2, 0, 3, 1]]],
      [Direction.left, [Axis.xNeg, [1, 3, 0, 2]]],
      [Direction.down, [Axis.zNeg, null]],
      [Direction.up, [Axis.zPos, null]],
    ]),
  ],
  [
    Axis.zPos,
    new Map<Direction, ConversionEntry>([
      [Direction.right, [Axis.xPos, null]],
      [Direction.left, [Axis.xNeg, null]],
      [Direction.down, [Axis.yNeg, null]],
      [Direction.up, [Axis.yPos, null]],
    ]),
  ],
  [
    Axis.zNeg,
    new Map<Direction, ConversionEntry>([
      [Direction.right, [Axis.xPos, [3, 2, 1, 0]]],
      [Direction.left, [Axis.xNeg, [3, 2, 1, 0]]],
      [Direction.down, [Axis.yPos, null]],
      [Direction.up, [Axis.yNeg, null]],
    ]),
  ],
]);

/**
 * FSM FOR QUADTREE NEIGHBORS IN ANY DIRECTION
 * see http://web.archive.org/web/20120907211934/http://ww1.ucmss.com/books/LFS/CSREA2006/MSV4517.pdf
 */
const neighboursFSM: Map<Direction, NeighbourStep>[] = [
  new Map<Direction, NeighbourStep>([
    [Direction.right, [1, Direction.halt]],
    [Direction.left, [1, Direction.left]],
    [Direction.down, [2, Direction.halt]],
    [Direction.up, [2, Direction.up]],
  ]),
  new Map<Direction, NeighbourStep>([
    [Direction.right, [0, Direction.right]],
    [Direction.left, [0, Direction.halt]],
    [Direction.down, [3, Direction.halt]],
    [Direction.up, [3, Direction.up]],
  ]),
  new Map<Direction, NeighbourStep>([
    [Direction.right, [3, Direction.halt]],
    [Direction.left, [3, Direction.left]],
    [Direction.down, [0, Direction.down]],
    [Direction.up, [0, Direction.halt]],
  ]),
  new Map<Direction, NeighbourStep>([
    [Direction.right, [2, Direction.right]],
    [Direction.left, [2, Direction.halt]],
    [Direction.down, [1, Direction.down]],
    [Direction.up, [1, Direction.halt]],
  ]),
];

export class AddressUtility {
  /**
   * Computes address of the potential nearest neighbor on the same level in specified direction
   */
  getNeighborAddress(address: number[], direction: Direction): number[] {
    let result = [...address];
    for (let i = result.length - 1; i > 0 && direction != Direction.halt; i--) {
      [result[i], direction] = neighboursFSM[result[i]].get(direction)!;
    }

    if (direction != Direction.halt) {
      let conversion;
      [result[0], conversion] = addressConversionMatrix
        .get(result[0] as Axis)!
        .get(direction)!;

      if (conversion != null) {
        for (let i = 1; i < result.length; i++) {
          result[i] = conversion[result[i]];
        }
      }
    }

    return result;
  }
}

import { Axis, Direction } from './enums';

type ConversionEntry = [Axis, number[] | null];

//Designed for node address conversion between specific sides of the cube
const addressConversionMatrix = new Map<Axis, Map<Direction, ConversionEntry>>([
  [
    Axis.xPos,
    new Map([
      //key - direction relative to corresponding axis
      //value[0] - neighbor axis laying on corresponding direction
      //value[1] - quadrant number conversion
      ["R", [Axis.zNeg, [3, 2, 1, 0]]],
      ["L", [Axis.zPos, null]],
      ["D", [Axis.yNeg, [1, 3, 0, 2]]],
      ["U", [Axis.yPos, [2, 0, 3, 1]]],
    ]),
  ],
  [
    Axis.xNeg,
    new Map([
      ["R", [Axis.zPos, null]],
      ["L", [Axis.zNeg, [3, 2, 1, 0]]],
      ["D", [Axis.yNeg, [2, 0, 3, 1]]],
      ["U", [Axis.yPos, [1, 3, 0, 2]]],
    ]),
  ],
  [
    Axis.yPos,
    new Map([
      ["R", [Axis.xPos, [1, 3, 0, 2]]],
      ["L", [Axis.xNeg, [2, 0, 3, 1]]],
      ["D", [Axis.zPos, null]],
      ["U", [Axis.zNeg, null]],
    ]),
  ],
  [
    Axis.yNeg,
    new Map([
      ["R", [Axis.xPos, [2, 0, 3, 1]]],
      ["L", [Axis.xNeg, [1, 3, 0, 2]]],
      ["D", [Axis.zNeg, null]],
      ["U", [Axis.zPos, null]],
    ]),
  ],
  [
    Axis.zPos,
    new Map([
      ["R", [Axis.xPos, null]],
      ["L", [Axis.xNeg, null]],
      ["D", [Axis.yNeg, null]],
      ["U", [Axis.yPos, null]],
    ]),
  ],
  [
    Axis.zNeg,
    new Map([
      ["R", [Axis.xPos, [3, 2, 1, 0]]],
      ["L", [Axis.xNeg, [3, 2, 1, 0]]],
      ["D", [Axis.yPos, null]],
      ["U", [Axis.yNeg, null]],
    ]),
  ],
]);

/**
 * FSM FOR QUADTREE NEIGHBORS IN ANY DIRECTION
 * see http://web.archive.org/web/20120907211934/http://ww1.ucmss.com/books/LFS/CSREA2006/MSV4517.pdf
 */
const neighboursFSM: Map<Direction, [number, Direction | "halt"]>[] = [
  new Map([
    ["R", [1, "halt"]],
    ["L", [1, "L"]],
    ["D", [2, "halt"]],
    ["U", [2, "U"]],
  ]),
  new Map([
    ["R", [0, "R"]],
    ["L", [0, "halt"]],
    ["D", [3, "halt"]],
    ["U", [3, "U"]],
  ]),
  new Map([
    ["R", [3, "halt"]],
    ["L", [3, "L"]],
    ["D", [0, "D"]],
    ["U", [0, "halt"]],
  ]),
  new Map([
    ["R", [2, "R"]],
    ["L", [2, "halt"]],
    ["D", [1, "D"]],
    ["U", [1, "halt"]],
  ]),
];

export class AddressUtility {
  /**
   * Computes address of the potential nearest neighbor on the same level in specified direction
   */
  getNeighborAddress(address: number[], direction: Direction | "halt"): number[] {
    const result = [...address];
    for (let i = result.length - 1; i > 0 && direction != "halt"; i--) {
      [result[i], direction] = neighboursFSM[result[i]].get(direction)!;
    }

    if (direction != "halt") {
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

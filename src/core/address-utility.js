import { AxisEnum, Direction } from '@enums';

//Designed for node address conversion between specific sides of the cube
const addressConversionMatrix = new Map([
    [AxisEnum.abscissaPositive, new Map([
        //key - direction relative to corresponding axis
        //value[0] - neighbor axis laying on corresponding direction
        //value[1] - quadrant number conversion
        [Direction.right, [AxisEnum.applicataNegative, [2, 3, 0, 1]]],
        [Direction.left, [AxisEnum.applicataPositive, null]],
        [Direction.down, [AxisEnum.ordinateNegative, [1, 2, 3, 0]]],
        [Direction.up, [AxisEnum.ordinatePositive, [3, 0, 1, 2]]],
    ])],
    [AxisEnum.abscissaNegative, new Map([
        [Direction.right, [AxisEnum.applicataPositive, null]],
        [Direction.left, [AxisEnum.applicataNegative, [2, 3, 0, 1]]],
        [Direction.down, [AxisEnum.ordinateNegative, [3, 0, 1, 2]]],
        [Direction.up, [AxisEnum.ordinatePositive, [1, 2, 3, 0]]],
    ])],
    [AxisEnum.ordinatePositive, new Map([
        [Direction.right, [AxisEnum.abscissaPositive, [1, 2, 3, 0]]],
        [Direction.left, [AxisEnum.abscissaNegative, [3, 0, 1, 2]]],
        [Direction.down, [AxisEnum.applicataPositive, null]],
        [Direction.up, [AxisEnum.applicataNegative, null]],
    ])],
    [AxisEnum.ordinateNegative, new Map([
        [Direction.right, [AxisEnum.abscissaPositive, [3, 0, 1, 2]]],
        [Direction.left, [AxisEnum.abscissaNegative, [1, 2, 3, 0]]],
        [Direction.down, [AxisEnum.applicataNegative, null]],
        [Direction.up, [AxisEnum.applicataPositive, null]],
    ])],
    [AxisEnum.applicataPositive, new Map([
        [Direction.right, [AxisEnum.abscissaPositive, null]],
        [Direction.left, [AxisEnum.abscissaNegative, null]],
        [Direction.down, [AxisEnum.ordinateNegative, null]],
        [Direction.up, [AxisEnum.ordinatePositive, null]],
    ])],
    [AxisEnum.applicataNegative, new Map([
        [Direction.right, [AxisEnum.abscissaPositive, [2, 3, 0, 1]]],
        [Direction.left, [AxisEnum.abscissaNegative, [2, 3, 0, 1]]],
        [Direction.down, [AxisEnum.ordinatePositive, null]],
        [Direction.up, [AxisEnum.ordinateNegative, null]],
    ])]
]);

/**
 * FSM FOR QUADTREE NEIGHBORS IN ANY DIRECTION
 * see http://web.archive.org/web/20120907211934/http://ww1.ucmss.com/books/LFS/CSREA2006/MSV4517.pdf
 */
const neighboursFSM = [
    new Map([
        [Direction.right, [1, Direction.halt]],
        [Direction.left, [1, Direction.left]],
        [Direction.down, [3, Direction.halt]],
        [Direction.up, [3, Direction.up]]
    ]),
    new Map([
        [Direction.right, [0, Direction.right]],
        [Direction.left, [0, Direction.halt]],
        [Direction.down, [2, Direction.halt]],
        [Direction.up, [2, Direction.up]]
    ]),
    new Map([
        [Direction.right, [3, Direction.right]],
        [Direction.left, [3, Direction.halt]],
        [Direction.down, [1, Direction.down]],
        [Direction.up, [1, Direction.halt]]
    ]),
    new Map([
        [Direction.right, [2, Direction.halt]],
        [Direction.left, [2, Direction.left]],
        [Direction.down, [0, Direction.down]],
        [Direction.up, [0, Direction.halt]]
    ]),
];

export class AddressUtility {
    /**
     * Computes address of the potential nearest neighbor on the same level in specified direction
     * @param {number[]} address 
     * @param {Direction} direction 
     * @returns {number[]}
     */
    getNeighborAddress(address, direction) {
        let result = [...address];
        for (let i = result.length - 1; i > 0 && direction != Direction.halt; i--) {
            result[i], direction = neighboursFSM[result[i]][direction];
        }

        if (direction != Direction.halt) {
            let conversion;
            result[0], conversion = addressConversionMatrix[result[0]][direction];
            if (conversion != null) {
                for (let i = 1; i < result.length; i++) {
                    result[i] = conversion[result[i]];
                }
            }
        }

        return result;
    }
}
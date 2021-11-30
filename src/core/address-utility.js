import { AxisEnum, Direction } from '@enums';

//Designed for node address conversion between specific sides of the cube
const addressConversionMatrix = new Map([
    [AxisEnum.abscissaPositive, new Map([
        [Direction.right, [2, 3, 0, 1]],
        [Direction.down, [1, 2, 3, 0]],
        [Direction.up, [3, 0, 1, 2]],
    ])],
    [AxisEnum.abscissaNegative, new Map([
        [Direction.left, [2, 3, 0, 1]],
        [Direction.down, [3, 0, 1, 2]],
        [Direction.up, [1, 2, 3, 0]],
    ])],
    [AxisEnum.ordinatePositive, new Map([
        [Direction.right, [1, 2, 3, 0]],
        [Direction.left, [3, 0, 1, 2]],
    ])],
    [AxisEnum.ordinateNegative, new Map([
        [Direction.right, [3, 0, 1, 2]],
        [Direction.left, [1, 2, 3, 0]],
    ])],
    [AxisEnum.applicataNegative, new Map([
        [Direction.right, [2, 3, 0, 1]],
        [Direction.left, [2, 3, 0, 1]],
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
}
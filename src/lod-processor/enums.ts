export const Axis = {
  xPos: 0,
  xNeg: 1,
  yPos: 2,
  yNeg: 3,
  zPos: 4,
  zNeg: 5,
} as const;

export type Axis = typeof Axis[keyof typeof Axis];

export const Direction = {
  right: 'R',
  left: 'L',
  down: 'D',
  up: 'U',
} as const;

export type Direction = typeof Direction[keyof typeof Direction];

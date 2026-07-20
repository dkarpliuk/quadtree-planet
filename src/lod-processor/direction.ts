export const Direction = {
  right: 'R',
  left: 'L',
  down: 'D',
  up: 'U',
  halt: 'halt',
} as const;

export type Direction = typeof Direction[keyof typeof Direction];

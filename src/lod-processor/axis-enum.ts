export const AxisEnum = {
  abscissaPositive: 0,
  abscissaNegative: 1,
  ordinatePositive: 2,
  ordinateNegative: 3,
  applicataPositive: 4,
  applicataNegative: 5,
} as const;

export type AxisEnum = typeof AxisEnum[keyof typeof AxisEnum];

export const LOD = {
  ultraLow: 2,
  low: 4,
  medium: 8,
  high: 12,
  ultraHigh: 16,
} as const;

export type LOD = typeof LOD[keyof typeof LOD];

export const UpdateFrequency = {
  realtime: 0,
  high: 300,
  medium: 500,
  low: 1000,
} as const;

export type UpdateFrequency = typeof UpdateFrequency[keyof typeof UpdateFrequency];

/**
 * world units per real-world meter.
 * multiply a real-world distance in meters by this to get scene units
 * 
 * (1 unit = 1000m, i.e. a 1:1000 scale)
 */
export const METER_UNITS = 0.001;

//meters per kilometer, for readable SI distances
export const KM = 1000;

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

export interface Coordinate { x: number; y: number; z: number }

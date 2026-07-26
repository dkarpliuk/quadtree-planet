/**
 * world units per real-world meter.
 * multiply a real-world distance in meters by this to get scene units
 * 
 * (1 unit = 1000m, i.e. a 1:1000 scale)
 */
export const METER_UNITS = 0.001;

//meters per kilometer, for readable SI distances
export const KM = 1000;

export interface Coordinate { x: number; y: number; z: number }

import type { Coordinate } from "./types";

export function lerp(a: number, b: number, t: number): number {
  return a + t * (b - a);
}

export function lerp3D(a: Coordinate, b: Coordinate, t: number): Coordinate {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
  };
}

export function calcDistance(from: Coordinate, to: Coordinate): number {
  const a = from.x - to.x;
  const b = from.y - to.y;
  const c = from.z - to.z;

  return Math.sqrt(a * a + b * b + c * c);
}

/**
 * A smooth abs(): inside the smoothing band around zero the sharp fold becomes
 * a parabola with the same value and slope at the edges of the band.
 * @param invSmoothing reciprocal of smoothing, precomputed by the caller
 */
export function softAbs(x: number, smoothing: number, invSmoothing: number): number {
  const value = Math.abs(x);
  return value >= smoothing ? value : (x * x * invSmoothing + smoothing) * 0.5;
}

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

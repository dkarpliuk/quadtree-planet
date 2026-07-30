import type { Coordinate } from '../../lib/types';

/**
 * The vertex a sector is building right now: every sampler reads what it needs from it
 * and writes its own part back. One instance per sector, mutated in place,
 * so that a vertex costs no allocations.
 */
export interface TerrainSample {
  //vertex on the sphere, in world units
  raw: Coordinate;
  //raw put through the continent warps
  continentWarped: Coordinate;
  //1 inside a mountain region, 0 outside
  mountainRegion: number;
  //height in meters, summed up by the features
  base: number;
}

export function createTerrainSample(): TerrainSample {
  return {
    raw: { x: 0, y: 0, z: 0 },
    continentWarped: { x: 0, y: 0, z: 0 },
    mountainRegion: 0,
    base: 0,
  };
}

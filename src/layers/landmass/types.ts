//data (no functions) sent to the worker to build the landmass engine
export interface LandmassParams {
  minLod: number;
  maxLod: number;
  sphereRadius: number;
  density: number;
  seed: number;
}

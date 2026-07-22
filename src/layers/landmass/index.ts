import { wrap, type Remote } from 'comlink';
import { LandmassMesh } from './landmass-mesh';
import type { LandmassEngineWorker } from './landmass.worker';
import type { LandmassParams } from './types';

export { LandmassMesh };
export type { LandmassParams };

//main-side handle to the landmass engine running in the worker
export type LandmassEngine = Remote<LandmassEngineWorker>;

/**
 * spawns the landmass worker and returns a handle to its engine.
 * Only plain params cross; the worker assembles the sector factory itself.
 */
export function createLandmassEngine(params: LandmassParams): Promise<LandmassEngine> {
  const worker = new Worker(new URL('./landmass.worker.ts', import.meta.url), { type: 'module' });
  const LandmassRemote = wrap<typeof LandmassEngineWorker>(worker);

  return new LandmassRemote(params);
}

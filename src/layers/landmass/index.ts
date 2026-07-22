import { wrap } from 'comlink';
import { LayerView } from '../layer-view';
import { LandmassMesh } from './landmass-mesh';
import type { LandmassWorker } from './landmass.worker';
import type { LandmassParams } from './types';

export type { LandmassParams };

/**
 * spawns the landmass worker and composes a ready-to-drive main-side layer:
 * its engine handle plus the landmass mesh. Only plain params cross to the
 * worker; the sector factory is assembled there.
 */
export async function createLandmassLayer(params: LandmassParams): Promise<LayerView> {
  const worker = new Worker(new URL('./landmass.worker.ts', import.meta.url), { type: 'module' });
  const LandmassRemote = wrap<typeof LandmassWorker>(worker);
  const engine = await new LandmassRemote(params);

  return new LayerView(engine, () => new LandmassMesh());
}

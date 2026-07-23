import { wrap } from 'comlink';

import { LayerView } from '../layer-view';
import type { LandmassWorker } from './landmass.worker';
import { LandmassMesh } from './landmass-mesh';

/**
 * spawns the landmass worker and composes a ready-to-drive main-side layer:
 * its engine handle plus the landmass mesh. The worker reads its own config.
 */
export async function createLandmassLayer(): Promise<LayerView> {
  const worker = new Worker(new URL('./landmass.worker.ts', import.meta.url), { type: 'module' });
  const LandmassRemote = wrap<typeof LandmassWorker>(worker);
  const engine = await new LandmassRemote();

  return new LayerView(engine, () => new LandmassMesh());
}

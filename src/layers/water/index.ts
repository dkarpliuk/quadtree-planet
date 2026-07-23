import { waterConfig } from '@config/water-config';
import { wrap } from 'comlink';

import { LayerView } from '../layer-view';
import type { WaterWorker } from './water.worker';
import { WaterMesh } from './water-mesh';

export async function createWaterLayer(): Promise<LayerView> {
  const worker = new Worker(new URL('./water.worker.ts', import.meta.url), { type: 'module' });
  const WaterRemote = wrap<typeof WaterWorker>(worker);
  const engine = await new WaterRemote();

  return new LayerView(engine, () => new WaterMesh(), waterConfig.value.updateFrequencyMs);
}

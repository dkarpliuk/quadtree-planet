import { atmosphereConfig } from '@config/atmosphere-config';
import { wrap } from 'comlink';

import { LayerView } from '../layer-view';
import type { AtmosphereWorker } from './atmosphere.worker';
import { AtmosphereMesh, createAtmosphereMaterial } from './atmosphere-mesh';

export async function createAtmosphereLayer(): Promise<LayerView> {
  const worker = new Worker(new URL('./atmosphere.worker.ts', import.meta.url), { type: 'module' });
  const AtmosphereRemote = wrap<typeof AtmosphereWorker>(worker);
  const engine = await new AtmosphereRemote();
  const material = createAtmosphereMaterial();

  return new LayerView(engine, () => new AtmosphereMesh(material), atmosphereConfig.value.updateFrequencyMs);
}

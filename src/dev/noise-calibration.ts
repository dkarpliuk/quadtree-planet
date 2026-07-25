import { wrap } from 'comlink';

import type { CalibrationOptions } from './noise-calibration.worker';

const measureFbmQuantile = wrap<(options: CalibrationOptions) => number>(
  new Worker(new URL('./noise-calibration.worker.ts', import.meta.url), { type: 'module' }));

async function runCalibration(button: HTMLButtonElement, options: CalibrationOptions): Promise<void> {
  button.disabled = true;
  button.style.cursor = 'wait';
  document.body.style.cursor = 'wait';

  try {
    const quantile = await measureFbmQuantile(options);
    alert(`quantile: ${quantile.toFixed(4)}`);
  } finally {
    button.disabled = false;
    button.style.cursor = '';
    document.body.style.cursor = '';
  }
}

export function setupNoiseCalibration(): void {
  const seedsInput = document.getElementById('noise-seeds') as HTMLInputElement;
  const samplesInput = document.getElementById('noise-samples') as HTMLInputElement;
  const octavesInput = document.getElementById('noise-octaves') as HTMLInputElement;
  const persistenceInput = document.getElementById('noise-persistence') as HTMLInputElement;
  const percentileInput = document.getElementById('noise-percentile') as HTMLInputElement;
  const button = document.getElementById('noise-calculate') as HTMLButtonElement;

  button.addEventListener('click', () => runCalibration(button, {
    seeds: Number(seedsInput.value),
    samples: Number(samplesInput.value),
    octaves: Number(octavesInput.value),
    persistence: Number(persistenceInput.value),
    percentile: Number(percentileInput.value),
  }));
}

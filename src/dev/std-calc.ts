import { wrap } from 'comlink';

import type { StdOptions as StdCalcOptions } from './std-calc.worker';

const measureStd = wrap<(options: StdCalcOptions) => number>(
  new Worker(new URL('./std-calc.worker.ts', import.meta.url), { type: 'module' }));

async function runStdCalculation(
  button: HTMLButtonElement,
  options: StdCalcOptions
): Promise<void> {
  button.disabled = true;
  button.style.cursor = 'wait';
  document.body.style.cursor = 'wait';

  try {
    const std = await measureStd(options);
    alert(`std: ${std.toFixed(4)}`);
  } finally {
    button.disabled = false;
    button.style.cursor = '';
    document.body.style.cursor = '';
  }
}

export function setupStdCalculation(): void {
  const samplesInput = document.getElementById('std-samples') as HTMLInputElement;
  const octavesInput = document.getElementById('std-octaves') as HTMLInputElement;
  const persistenceInput = document.getElementById('std-persistence') as HTMLInputElement;
  const button = document.getElementById('std-calculate') as HTMLButtonElement;

  button.addEventListener('click', () => runStdCalculation(button, {
    samples: Number(samplesInput.value),
    octaves: Number(octavesInput.value),
    persistence: Number(persistenceInput.value),
  }));
}

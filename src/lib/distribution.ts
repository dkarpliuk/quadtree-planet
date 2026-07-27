const DEFAULT_SAMPLES = 100_000;
const DEFAULT_STEP = 0.0001;

export type QuantileFn = (quantile: number) => number;

export function distribution(
  valueFn: () => number,
  samples: number = DEFAULT_SAMPLES,
  step: number = DEFAULT_STEP,
): QuantileFn {
  const histogram: Map<number, number> = new Map<number, number>();
  for (let i = 0; i < samples; i++) {
    const value = valueFn();
    const bin = Math.floor(value / step);
    histogram.set(bin, (histogram.get(bin) ?? 0) + 1);
  }

  const min = Math.min(...histogram.keys());
  const max = Math.max(...histogram.keys());

  return function (quantile: number) {
    const target = samples * quantile;
    let cumulative = 0;
    let bin = min;
    while (cumulative < target && bin <= max) {
      cumulative += histogram.get(bin++) ?? 0;
    }

    return bin * step;
  };
}

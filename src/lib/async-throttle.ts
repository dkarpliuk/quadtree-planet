export function asyncThrottle<T extends (...args: never[]) => Promise<void>>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => Promise<void> {
  let inThrottle = false;

  return async function (this: unknown, ...args: Parameters<T>): Promise<void> {
    if (inThrottle) return;
    inThrottle = true;

    let timerDone = false;
    let runDone = false;
    setTimeout(() => {
      timerDone = true;
      if (runDone) inThrottle = false;
    }, wait);

    try {
      await func.apply(this, args);
    } finally {
      runDone = true;
      if (timerDone) inThrottle = false;
    }
  };
}

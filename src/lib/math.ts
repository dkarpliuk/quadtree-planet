export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

//Monotone cubic interpolation (Fritsch–Carlson): passes through the points without overshoot.
//https://en.wikipedia.org/wiki/Monotone_cubic_interpolation
export function monotoneCubic(xs: number[], ys: number[]): (x: number) => number {
  const n = xs.length;

  const secants: number[] = new Array(n - 1);
  for (let i = 0; i < n - 1; i++) {
    secants[i] = (ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]);
  }

  const tangents: number[] = new Array(n);
  tangents[0] = secants[0];
  tangents[n - 1] = secants[n - 2];
  for (let i = 1; i < n - 1; i++) {
    //flatten at extrema (adjacent secants of opposite sign), otherwise average them
    tangents[i] = secants[i - 1] * secants[i] <= 0 ? 0 : (secants[i - 1] + secants[i]) / 2;
  }

  for (let i = 0; i < n - 1; i++) {
    if (secants[i] === 0) {
      tangents[i] = 0;
      tangents[i + 1] = 0;
      continue;
    }
    const alpha = tangents[i] / secants[i];
    const beta = tangents[i + 1] / secants[i];
    const magnitude = alpha * alpha + beta * beta;
    if (magnitude > 9) {
      const tau = 3 / Math.sqrt(magnitude);
      tangents[i] = tau * alpha * secants[i];
      tangents[i + 1] = tau * beta * secants[i];
    }
  }

  return (x: number): number => {
    let i = 0;
    while (i < n - 2 && x > xs[i + 1]) i++;

    const h = xs[i + 1] - xs[i];
    const t = (x - xs[i]) / h;
    const t2 = t * t;
    const t3 = t2 * t;

    const h00 = 2 * t3 - 3 * t2 + 1;
    const h10 = t3 - 2 * t2 + t;
    const h01 = -2 * t3 + 3 * t2;
    const h11 = t3 - t2;

    return h00 * ys[i] + h10 * h * tangents[i] + h01 * ys[i + 1] + h11 * h * tangents[i + 1];
  };
}

import { Chart } from 'chart.js/auto';

import { type ElevationProfile, ElevationProfileSampler } from '../lib/elevation-profile-sampler';

const ELEVATION_SAMPLES = 128;

interface Point {
  x: number;
  y: number;
}

function sampleElevationProfile(profile: ElevationProfile): Point[] {
  const sampler = new ElevationProfileSampler(profile);
  sampler.warm();

  const min = profile[0][0];
  const max = profile[profile.length - 1][0];
  const step = (max - min) / (ELEVATION_SAMPLES - 1);

  const curve: Point[] = [];
  for (let i = 0; i < ELEVATION_SAMPLES; i++) {
    const x = min + step * i;
    curve.push({ x, y: sampler.sample(x) });
  }

  return curve;
}

export function renderElevationProfile(canvas: HTMLCanvasElement, profile: ElevationProfile): void {
  const controlPoints = profile.map(([x, y]) => ({ x, y }));

  new Chart(canvas, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'control points',
          data: controlPoints,
          backgroundColor: '#00f',
          borderColor: '#00f',
          borderWidth: 1,
          pointRadius: 3,
          pointHoverRadius: 3,
        },
        {
          label: 'elevation',
          data: sampleElevationProfile(profile),
          showLine: true,
          backgroundColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          borderColor: '#00f',
          borderWidth: 1,
          pointRadius: 0,
          pointHoverRadius: 3,
        },
      ],
    },
    options: {
      responsive: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom' },
        tooltip: { position: 'nearest' },
      },
    },
  });
}

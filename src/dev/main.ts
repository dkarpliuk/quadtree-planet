import '../styles.css';

import { warmConfig } from '@config/config-service';
import { landmassConfig } from '@config/landmass-config';
import { Chart } from 'chart.js/auto';

import { type ElevationProfile, ElevationProfileSampler } from '../lib/elevation-profile-sampler';

Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;

const ELEVATION_SAMPLES = 64;

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

function renderElevationProfile(canvas: HTMLCanvasElement, profile: ElevationProfile): void {
  const controlPoints = profile.map(([x, y]) => ({ x, y }));

  new Chart(canvas, {
    type: 'scatter',
    data: {
      datasets: [
        {
          label: 'control points',
          data: controlPoints,
          backgroundColor: '#e23532',
          pointRadius: 4,
        },
        {
          label: 'elevation',
          data: sampleElevationProfile(profile),
          showLine: true,
          borderColor: '#586efb',
          borderWidth: 2,
          pointRadius: 0,
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

async function main(): Promise<void> {
  await warmConfig();

  renderElevationProfile(
    document.getElementById('continent-profile') as HTMLCanvasElement,
    landmassConfig.value.terrain.continents.elevationProfile);
}

await main();

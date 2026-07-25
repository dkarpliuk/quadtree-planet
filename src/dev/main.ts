import '../styles.css';

import { warmConfig } from '@config/config-service';
import { landmassConfig } from '@config/landmass-config';
import { Chart } from 'chart.js/auto';

import { renderElevationProfile } from './elevation-chart';

Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;

async function main(): Promise<void> {
  await warmConfig();

  const canvas = document.getElementById('elevation-profile') as HTMLCanvasElement;
  renderElevationProfile(canvas, {
    continent: landmassConfig.value.terrain.continents.elevationProfile
  });
}

await main();

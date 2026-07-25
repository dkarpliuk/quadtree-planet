import '../styles.css';

import { warmConfig } from '@config/config-service';
import { landmassConfig } from '@config/landmass-config';
import { Chart } from 'chart.js/auto';

import { renderElevationProfile } from './elevation-chart';
import { setupNoiseCalibration } from './noise-calibration';

Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;

async function main(): Promise<void> {
  await warmConfig();

  renderElevationProfile(
    document.getElementById('continent-profile') as HTMLCanvasElement,
    landmassConfig.value.terrain.continents.elevationProfile);

  setupNoiseCalibration();
}

await main();

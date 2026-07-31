import { ConfigService } from './config-service';
import { KM } from './constants';

export interface AtmosphereConfig {
  minLod: number;
  maxLod: number;
  density: number;
  updateFrequencyMs: number;
  scaleHeightMeters: number;
  color: string;
}

export const atmosphereConfig = new ConfigService<AtmosphereConfig>({
  minLod: 2,
  maxLod: 4,
  density: 16,
  updateFrequencyMs: 3000,
  scaleHeightMeters: 12 * KM,
  color: 'hsl(217, 42%, 33%)',
});

//gas thinner than this cannot tint a pixel, 8 bit color rounds it away
const SMALLEST_VISIBLE_SHARE = 0.5 / 255;

//gas falls off exponentially,
//so this is how many scale heights it takes to get that thin
//https://en.wikipedia.org/wiki/Scale_height
const SHELL_SCALE = Math.log(1 / SMALLEST_VISIBLE_SHARE);

/**
 * the height where the atmosphere stops being visible, so the shell ends there
 */
export function shellHeightMeters(): number {
  return atmosphereConfig.value.scaleHeightMeters * SHELL_SCALE;
}

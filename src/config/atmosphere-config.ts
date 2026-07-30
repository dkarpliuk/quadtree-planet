import { ConfigService } from './config-service';
import { KM } from './constants';

export interface AtmosphereConfig {
  minLod: number;
  maxLod: number;
  density: number;
  updateFrequencyMs: number;
  heightMeters: number;
  mass: number;
}

export const atmosphereConfig = new ConfigService<AtmosphereConfig>({
  minLod: 2,
  maxLod: 4,
  density: 16,
  updateFrequencyMs: 3000,
  heightMeters: 100 * KM,
  mass: 0.5,
});

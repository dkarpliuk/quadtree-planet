import { KM, UpdateFrequency } from './common';
import { ConfigService } from './config-service';

export interface PlanetConfig {
  radiusMeters: number;
  seed: number;
  updateFrequency: UpdateFrequency;
}

export const planetConfig = new ConfigService<PlanetConfig>({
  radiusMeters: 3000 * KM,
  seed: 1234,
  updateFrequency: UpdateFrequency.medium,
});

import { KM } from './common';
import { ConfigService } from './config-service';

export interface PlanetConfig {
  radiusMeters: number;
  seed: number;
}

export const planetConfig = new ConfigService<PlanetConfig>({
  radiusMeters: 3000 * KM,
  seed: 1234,
});

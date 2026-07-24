import { KM } from './common';
import { ConfigService } from './config-service';

export interface PlanetConfig {
  radiusMeters: number;
  waterEnabled: boolean;
  seed: number;
}

export const planetConfig = new ConfigService<PlanetConfig>({
  radiusMeters: 3000 * KM,
  waterEnabled: true,
  seed: 1234,
});

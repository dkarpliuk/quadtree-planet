import { ConfigService } from './config-service';
import { KM } from './constants';

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

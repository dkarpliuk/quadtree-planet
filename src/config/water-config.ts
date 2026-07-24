import { ConfigService } from './config-service';

export interface WaterConfig {
  minLod: number;
  maxLod: number;
  density: number;
  updateFrequencyMs: number;
}

export const waterConfig = new ConfigService<WaterConfig>({
  minLod: 3,
  maxLod: 6,
  density: 16,
  updateFrequencyMs: 1500,
});

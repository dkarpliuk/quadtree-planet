import { ConfigService } from './config-service';

export interface WaterConfig {
  minLod: number;
  maxLod: number;
  density: number;
  updateFrequencyMs: number;
}

export const waterConfig = new ConfigService<WaterConfig>({
  minLod: 4,
  maxLod: 8,
  density: 32,
  updateFrequencyMs: 1500,
});

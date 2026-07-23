import { KM } from './common';
import { ConfigService } from './config-service';

export interface ContinentOptions {
  sizeMeters: number;
  flatnessFactor: number;
}

export interface TerrainOptions {
  amplitudeMeters: number;
  seaLevelMeters: number;
  continents: ContinentOptions;
}

export interface LandmassConfig {
  minLod: number;
  maxLod: number;
  density: number;
  updateFrequencyMs: number;
  terrain: TerrainOptions;
}

export const landmassConfig = new ConfigService<LandmassConfig>({
  minLod: 4,
  maxLod: 12,
  density: 32,
  updateFrequencyMs: 500,
  terrain: {
    amplitudeMeters: 6 * KM,
    seaLevelMeters: 0,
    continents: {
      sizeMeters: 2000 * KM,
      flatnessFactor: 0.5,
    },
  },
});

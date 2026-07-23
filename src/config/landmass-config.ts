import { KM, LOD } from './common';
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
  terrain: TerrainOptions;
}

export const landmassConfig = new ConfigService<LandmassConfig>({
  minLod: LOD.low,
  maxLod: LOD.high,
  density: 32,
  terrain: {
    amplitudeMeters: 6 * KM,
    seaLevelMeters: 0,
    continents: {
      sizeMeters: 2000 * KM,
      flatnessFactor: 0.5,
    },
  },
});

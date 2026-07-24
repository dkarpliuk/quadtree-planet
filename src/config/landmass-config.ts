import { KM } from './common';
import { ConfigService } from './config-service';

export interface ContinentOptions {
  sizeMeters: number;
  amplitudeMeters: number;
  flatnessFactor: number;
  coastHeightMeters: number;
  warpStrengthMeters: number;
  warpSizeMeters: number;
}

export interface MountainOptions {
  regionSizeMeters: number;
  coverageFactor: number;
  maxHeightMeters: number;
}

export interface RoughnessOptions {
  sizeMeters: number;
  amplitudeMeters: number;
}

export interface TerrainOptions {
  continents: ContinentOptions;
  mountains: MountainOptions;
  roughness: RoughnessOptions;
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
    continents: {
      sizeMeters: 2000 * KM,
      amplitudeMeters: 6 * KM,
      flatnessFactor: 0.5,
      coastHeightMeters: 200,
      warpStrengthMeters: 50 * KM,
      warpSizeMeters: 150 * KM,
    },
    mountains: {
      regionSizeMeters: 1000 * KM,
      coverageFactor: 0.6,
      maxHeightMeters: 20 * KM,
    },
    roughness: {
      sizeMeters: 3 * KM,
      amplitudeMeters: 300,
    },
  },
});

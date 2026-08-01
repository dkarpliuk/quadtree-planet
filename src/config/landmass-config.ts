import { ConfigService } from './config-service';
import { KM } from './constants';

export type ElevationProfile = [number, number][];

export interface ContinentOptions {
  sizeMeters: number;
  tectonicFactor: number;
  landFactor: number;
  elevationProfile: ElevationProfile;
}

export interface MountainOptions {
  maxHeightMeters: number;
  regionSizeMeters: number;
  coverageFactor: number;
}

export interface RoughnessOptions {
  heightMeters: number;
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
  density: 64,
  updateFrequencyMs: 500,
  terrain: {
    continents: {
      sizeMeters: 3000 * KM,
      tectonicFactor: 0.25,
      landFactor: 0.3,
      elevationProfile: [
        [-1, -6000],
        [-0.3, -4000],
        [0, 0],
        [0.15, 400],
        [0.75, 1000],
        [0.9, 2600],
        [1, 3000],
      ],
    },
    mountains: {
      maxHeightMeters: 12000,
      regionSizeMeters: 800 * KM,
      coverageFactor: 0.45,
    },
    roughness: {
      heightMeters: 500,
    },
  },
});

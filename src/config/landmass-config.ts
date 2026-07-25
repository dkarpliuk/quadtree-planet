import type { ElevationProfile } from '../lib/elevation-profile-sampler';
import { KM } from './common';
import { ConfigService } from './config-service';

export interface ContinentOptions {
  sizeMeters: number;
  elevationProfile: ElevationProfile;
}

export interface TerrainOptions {
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
    continents: {
      sizeMeters: 3000 * KM,
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
  },
});

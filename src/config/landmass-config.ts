import { LOD } from './common';
import { ConfigService } from './config-service';

export interface TerrainOptions {
  noiseOctaves: number;
  noisePersistence: number;
  noiseFrequency: number;
  heightScale: number;
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
    noiseOctaves: 12,
    noisePersistence: 0.5,
    noiseFrequency: 0.75,
    heightScale: 0.03,
  },
});

import { type Coordinate, KM } from './common';
import { ConfigService } from './config-service';

export interface SceneConfig {
  planetPositionMeters: Coordinate;
  sunPositionMeters: Coordinate;
  sunRadiusMeters: number;
  cameraFarMeters: number;
  cameraPositionMeters: Coordinate;
}

export const sceneConfig = new ConfigService<SceneConfig>({
  planetPositionMeters: { x: 0, y: 0, z: 0 },
  sunPositionMeters: { x: 0, y: 0, z: 60000 * KM },
  sunRadiusMeters: 1000 * KM,
  cameraFarMeters: 100000 * KM,
  cameraPositionMeters: { x: 0, y: 0, z: 6000 * KM },
});

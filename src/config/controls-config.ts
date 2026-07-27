import { ConfigService } from './config-service';
import { KM } from './constants';

export interface ControlsConfig {
  speedMetersSec: number;
  turnDegreesSec: number;
  accelerationStepMeters: number;
}

export const controlsConfig = new ConfigService<ControlsConfig>({
  speedMetersSec: 600 * KM,
  turnDegreesSec: 22.5,
  accelerationStepMeters: 50 * KM,
});

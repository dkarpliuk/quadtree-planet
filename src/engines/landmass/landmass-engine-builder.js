import { NoiseProcessor } from "../../noise/noise-processor";
import { Perlin3D } from "../../noise/perlin-3d";
import { EngineBuilder } from "../base/engine-builder";
import { LandmassEngine } from "./landmass-engine";

export class LandmassEngineBuilder extends EngineBuilder {
  get allPropertiesSet() {
    return super.allPropertiesSet && this._obj.noiseProcessor;
  }
  
  seed(seed) {
    let noiseFn = new Perlin3D(seed);
    this._obj.noiseProcessor = new NoiseProcessor(noiseFn);
    return this;
  }

  reset() {
    this._obj = new LandmassEngine();
  }
}
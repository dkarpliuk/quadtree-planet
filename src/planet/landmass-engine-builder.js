import { NoiseProcessor } from "./noise-processor";
import { RandomLCG } from "./random-lcg";
import { createNoise3D } from "simplex-noise";
import { EngineBuilder } from "../lod-processor";
import { LandmassEngine } from "./landmass-engine";

export class LandmassEngineBuilder extends EngineBuilder {
  get allPropertiesSet() {
    return super.allPropertiesSet && this._obj.noiseProcessor;
  }
  
  seed(seed) {
    let random = new RandomLCG(seed);
    this._obj.noiseProcessor = new NoiseProcessor(createNoise3D(() => random.next()));
    return this;
  }

  reset() {
    this._obj = new LandmassEngine();
  }
}
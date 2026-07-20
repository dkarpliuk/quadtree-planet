import { NoiseProcessor } from "./noise-processor";
import seedrandom from "seedrandom";
import { createNoise3D } from "simplex-noise";
import { EngineBuilder } from "../lod-processor";
import { LandmassEngine } from "./landmass-engine";

export class LandmassEngineBuilder extends EngineBuilder {
  get allPropertiesSet() {
    return super.allPropertiesSet && this._obj.noiseProcessor;
  }
  
  seed(seed) {
    let random = seedrandom(seed);
    this._obj.noiseProcessor = new NoiseProcessor(createNoise3D(random));
    return this;
  }

  reset() {
    this._obj = new LandmassEngine();
  }
}
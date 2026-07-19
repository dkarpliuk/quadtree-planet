import { NoiseProcessor, RandomLCG } from "@noise";
import { createNoise3D } from "simplex-noise";
import { EngineBuilder } from "../base/engine-builder";
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
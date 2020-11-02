import { EngineBuilder } from "../base/engine-builder";
import { LandmassEngine } from "./landmass-engine";

export class LandmassEngineBuilder extends EngineBuilder {
  reset() {
    this._obj = new LandmassEngine();
  }
}
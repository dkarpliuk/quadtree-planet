import { Engine, type EngineOptions } from './engine';
import { SectorMesh } from './sector-mesh';

export class EngineBuilder {
  private _options: Partial<EngineOptions> = {
    sectorMeshFactory: () => new SectorMesh(),
  };

  setLod(minLod: number, maxLod: number): this {
    if (minLod < 1 || maxLod < minLod)
      throw 'LOD range out of range. Require 1 <= minLod <= maxLod.';

    this._options.minLod = minLod;
    this._options.maxLod = maxLod;
    return this;
  }

  setSphereRadius(radius: number): this {
    if (radius < 0)
      throw 'Sphere radius out of range. Must be greater than 0.';

    this._options.sphereRadius = radius;
    return this;
  }

  setDensity(density: number): this {
    if (density < 2 || density % 2 !== 0)
      throw 'Density out of range. Must be a positive even number.';

    this._options.density = density;
    return this;
  }

  setSectorMeshFactory(factory: () => SectorMesh): this {
    if (!factory)
      throw 'Argument is out of range';

    this._options.sectorMeshFactory = factory;
    return this;
  }

  build(): Engine {
    const { minLod, maxLod, sphereRadius, density } = this._options;
    if (minLod == null || maxLod == null || sphereRadius == null || density == null)
      throw 'Some of engine properties did not set!';

    return new Engine(this._options as EngineOptions);
  }
}

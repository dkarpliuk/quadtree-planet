import { AdditiveBlending, BackSide, Material, ShaderMaterial } from 'three';

import fragmentShader from '../../shaders/atmosphere.frag?raw';
import vertexShader from '../../shaders/atmosphere.vert?raw';
import { SectorMesh } from '../sector-mesh';

/**
 * built after the config is warm, then shared by every sector of the layer
 */
export function createAtmosphereMaterial(): ShaderMaterial {
  return new ShaderMaterial({
    vertexShader,
    fragmentShader,
    side: BackSide,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
}

export class AtmosphereMesh extends SectorMesh {
  private readonly _shared: Material;

  constructor(material: Material) {
    super();
    this._shared = material;
  }

  protected get _material(): Material { return this._shared; }
}

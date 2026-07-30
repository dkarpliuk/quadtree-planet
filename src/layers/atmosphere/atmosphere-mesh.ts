import { atmosphereConfig } from '@config/atmosphere-config';
import { METER_UNITS } from '@config/constants';
import { planetConfig } from '@config/planet-config';
import { sceneConfig } from '@config/scene-config';
import { AdditiveBlending, BackSide, Material, ShaderMaterial, Vector3 } from 'three';

import type { Coordinate } from '../../lib/types';
import fragmentShader from '../../shaders/atmosphere.frag?raw';
import vertexShader from '../../shaders/atmosphere.vert?raw';
import { SectorMesh } from '../sector-mesh';

/**
 * built after the config is warm, then shared by every sector of the layer
 */
export function createAtmosphereMaterial(): ShaderMaterial {
  const planetRadius = planetConfig.value.radiusMeters * METER_UNITS;

  return new ShaderMaterial({
    uniforms: {
      center: { value: toWorld(sceneConfig.value.planetPositionMeters) },
      planetRadius: { value: planetRadius },
      shellRadius: { value: planetRadius + atmosphereConfig.value.heightMeters * METER_UNITS },
    },
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

function toWorld(meters: Coordinate): Vector3 {
  return new Vector3(meters.x, meters.y, meters.z).multiplyScalar(METER_UNITS);
}

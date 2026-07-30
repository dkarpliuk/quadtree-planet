import { atmosphereConfig } from '@config/atmosphere-config';
import { METER_UNITS } from '@config/constants';
import { planetConfig } from '@config/planet-config';
import { sceneConfig } from '@config/scene-config';
import { AdditiveBlending, BackSide, Color, Material, ShaderMaterial, Vector3 } from 'three';

import type { Coordinate } from '../../lib/types';
import fragmentShader from '../../shaders/atmosphere.frag?raw';
import vertexShader from '../../shaders/atmosphere.vert?raw';
import { SectorMesh } from '../sector-mesh';

const COLOR = new Color(0.161, 0.769, 0.302)

//half width of the twilight band, as a cosine
const TWILIGHT = 0.25;

/**
 * built after the config is warm, then shared by every sector of the layer
 */
export function createAtmosphereMaterial(): ShaderMaterial {
  const planetRadius = planetConfig.value.radiusMeters * METER_UNITS;
  const shellRadius = planetRadius + atmosphereConfig.value.heightMeters * METER_UNITS;
  const center = toWorld(sceneConfig.value.planetPositionMeters);

  return new ShaderMaterial({
    uniforms: {
      color: { value: COLOR },
      twilight: { value: TWILIGHT },
      center: { value: center },
      sunDirection: { value: toWorld(sceneConfig.value.sunPositionMeters).sub(center).normalize() },
      planetRadius: { value: planetRadius },
      shellRadius: { value: shellRadius },
      density: { value: atmosphereConfig.value.mass },
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

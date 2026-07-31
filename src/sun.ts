import { METER_UNITS } from '@config/constants';
import { sceneConfig } from '@config/scene-config';
import {
  AdditiveBlending,
  DirectionalLight,
  Group,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
} from 'three';

import fragmentShader from './shaders/sun.frag?raw';
import vertexShader from './shaders/sun.vert?raw';

//how far the glow reaches, in sun radii
const GLOW_RADII = 3;

//three needs this much to make a white surface facing the light come out white
const INTENSITY = Math.PI;

/**
 * the star: the disc you see and the light it casts, both standing in the same place
 */
export class Sun {
  private readonly _group = new Group();
  private readonly _light = new DirectionalLight(0xffffff, INTENSITY);

  get object3d(): Group { return this._group; }
  get light(): DirectionalLight { return this._light; }

  constructor() {
    const position = sceneConfig.value.sunPositionMeters;

    this._group.position.set(position.x, position.y, position.z).multiplyScalar(METER_UNITS);
    this._group.add(this._light, createSprite());
  }
}

function createSprite(): Mesh<PlaneGeometry, ShaderMaterial> {
  const size = sceneConfig.value.sunRadiusMeters * METER_UNITS * GLOW_RADII * 2;

  return new Mesh(
    new PlaneGeometry(size, size),
    new ShaderMaterial({
      uniforms: {
        reach: { value: GLOW_RADII },
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
    }),
  );
}

import { METER_UNITS } from '@config/constants';
import { sceneConfig } from '@config/scene-config';
import {
  AdditiveBlending,
  Mesh,
  PlaneGeometry,
  ShaderMaterial,
} from 'three';

import fragmentShader from './shaders/sun.frag?raw';
import vertexShader from './shaders/sun.vert?raw';

//how far the glow reaches, in sun radii
const GLOW_RADII = 3;

export class Sun extends Mesh<PlaneGeometry, ShaderMaterial> {
  constructor() {
    const size = sceneConfig.value.sunRadiusMeters * METER_UNITS * GLOW_RADII * 2;

    super(
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

    const position = sceneConfig.value.sunPositionMeters;
    this.position.set(position.x, position.y, position.z).multiplyScalar(METER_UNITS);
  }
}

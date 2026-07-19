import { NoiseProcessor } from '@noise';
import { Color, MeshStandardMaterial } from 'three';
import { Sector } from '../base/sector';

const material = new MeshStandardMaterial({ color: 0xffffff, vertexColors: true });

const heightScale = 0.03;

//stops along the normalised height, blended between neighbours
const palette = [
  { at: -1, color: new Color(0x243b2e) },
  { at: 0, color: new Color(0xc2b280) },
  { at: 0.15, color: new Color(0x4a7c3f) },
  { at: 0.35, color: new Color(0x6b5f4e) },
  { at: 0.6, color: new Color(0xf0f0f5) }
];

export class LandmassSector extends Sector {
  /**
   * @type {NoiseProcessor}
   */
  _noiseProcessor = null;

  get _material() { return material; }

  constructor(sphereRadius, noiseProcessor) {
    super(sphereRadius);
    this._noiseProcessor = noiseProcessor;
  }

  _computeHeightOffset(vx, vy, vz) {
    let noise = this._noiseProcessor.getOctaveNoise(vx, vy, vz, 12, 0.5, 0.00025);
    return noise * this._sphereRadius * heightScale;
  }

  _computeVertexColor(height, target) {
    let normalized = height / (this._sphereRadius * heightScale);
    let index = palette.length - 1;

    while (index > 0 && normalized < palette[index].at) {
      index--;
    }

    let from = palette[index];
    let to = palette[Math.min(index + 1, palette.length - 1)];
    let span = to.at - from.at;

    target.copy(from.color);
    if (span > 0) {
      target.lerp(to.color, Math.min(1, Math.max(0, (normalized - from.at) / span)));
    }
  }
}

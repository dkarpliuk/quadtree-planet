import { MeshStandardMaterial } from 'three';
import { SectorMesh } from '../lod-processor';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- used in a JSDoc @type
import { NoiseProcessor } from './noise-processor';

const material = new MeshStandardMaterial({ color: 0xffffff });

const heightScale = 0.03;

export class LandmassSectorMesh extends SectorMesh {
  _sphereRadius = 0;

  /**
   * @type {NoiseProcessor}
   */
  _noiseProcessor = null;

  constructor(sphereRadius, noiseProcessor) {
    super();
    this._sphereRadius = sphereRadius;
    this._noiseProcessor = noiseProcessor;
  }

  get _material() { return material; }

  getHeightOffset(vx, vy, vz) {
    let noise = this._noiseProcessor.getOctaveNoise(vx, vy, vz, 12, 0.5, 0.00025);
    return noise * this._sphereRadius * heightScale;
  }
}

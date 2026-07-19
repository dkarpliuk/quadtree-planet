import { NoiseProcessor } from '@noise';
import { MeshBasicMaterial, MeshStandardMaterial } from 'three';
import { Sector } from '../base/sector';

//debug toggle: true = green wireframe + sparse grid to inspect the grid/LOD
//stitching, false = ordinary solid surface at full density
const WIREFRAME = false;

const material = WIREFRAME
  ? new MeshBasicMaterial({ color: 0x00ff00, wireframe: true })
  : new MeshStandardMaterial({ color: 0xffffff, wireframe: false });

const density = WIREFRAME ? 12 : 32; //must be even so edges halve cleanly when stitching

export class LandmassSector extends Sector {
  /**
   * @type {NoiseProcessor}
   */
  _noiseProcessor = null;

  get _material() { return material; }
  get _density() { return density; }

  constructor(sphereRadius, noiseProcessor) {
    super(sphereRadius);
    this._noiseProcessor = noiseProcessor;
  }

  _computeHeightOffset(vx, vy, vz) {
    let noise = this._noiseProcessor.getOctaveNoise(vx, vy, vz, 12, 0.5, 0.00025);
    return Math.max(0, noise) * this._sphereRadius * 0.03;
  }
}
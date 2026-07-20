import { Material, MeshStandardMaterial } from 'three';
import { SectorMesh } from '../lod-processor';
import type { NoiseProcessor, OctaveNoiseOptions } from './noise-processor';

const material = new MeshStandardMaterial({ color: 0xffffff });

const heightScale = 0.03;
const noiseOptions: OctaveNoiseOptions = {
  octaves: 12,
  persistence: 0.5,
  frequency: 0.00025
};

export class LandmassSectorMesh extends SectorMesh {
  private _sphereRadius: number;
  private _noiseProcessor: NoiseProcessor;

  constructor(sphereRadius: number, noiseProcessor: NoiseProcessor) {
    super();
    this._sphereRadius = sphereRadius;
    this._noiseProcessor = noiseProcessor;
  }

  protected get _material(): Material { return material; }

  getHeightOffset(vx: number, vy: number, vz: number): number {
    const noise = this._noiseProcessor.getOctaveNoise(vx, vy, vz, noiseOptions);
    return noise * this._sphereRadius * heightScale;
  }
}

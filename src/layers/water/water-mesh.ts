import { Material, MeshStandardMaterial } from 'three';

import { SectorMesh } from '../sector-mesh';

const material = new MeshStandardMaterial({ color: 0x000000, transparent: true, opacity: 0.5 });

export class WaterMesh extends SectorMesh {
  protected get _material(): Material { return material; }
}

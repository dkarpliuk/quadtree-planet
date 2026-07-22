import { Material, MeshStandardMaterial } from 'three';

import { SectorMesh } from '../sector-mesh';

const material = new MeshStandardMaterial({ color: 0xffffff });

export class LandmassMesh extends SectorMesh {
  protected get _material(): Material { return material; }
}

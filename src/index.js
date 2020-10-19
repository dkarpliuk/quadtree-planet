import * as STATS from 'stats.js';
import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { PlanetProcessor } from './app/planet-processor';
import { LOD } from './enums/lod';
import { ProcessFrequency } from './enums/process-frequency';
import './styles.css';

var stats = new STATS();
stats.showPanel(0);
document.body.appendChild(stats.dom);

var camera, scene, light, renderer;

init();
animate();

function init() {
  camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
  camera.position.z = 2000;

  scene = new Scene();
  let planet = new PlanetProcessor(camera, new Vector3(0, 0, 0));
  planet.radius = 1000;
  planet.createLandmass(LOD.high, ProcessFrequency.high);
  scene.add(planet.object3d);

  light = new AmbientLight(0xFFF8CA, 0.2);
  scene.add(light);

  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function animate() {
  stats.begin();
  renderer.render(scene, camera);
  stats.end();

  requestAnimationFrame(animate);
}
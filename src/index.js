import * as STATS from 'stats.js';
import { PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { PlanetProcessor } from './app/planet-processor';
import './styles.css';

var stats = new STATS();
stats.showPanel(0);
document.body.appendChild(stats.dom);

var camera, scene, renderer;

init();
animate();

function init() {
  camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 10);
  camera.position.z = 1;

  scene = new Scene();
  let planet = new PlanetProcessor(camera, new Vector3(0, 0, 0));
  scene.add(planet.object3d);

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
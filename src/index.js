import * as STATS from 'stats.js';
import { AmbientLight, AxesHelper, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { PlanetProcessor } from './app/planet-processor';
import { LOD } from './enums/lod';
import { ProcessFrequency } from './enums/process-frequency';
import './styles.css';

var stats = new STATS();
stats.showPanel(0);
document.body.appendChild(stats.dom);

var camera, scene, light, renderer, planet;

init();
animate();

function init() {
  camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
  camera.position.z = 6000;

  scene = new Scene();
  planet = new PlanetProcessor(camera, new Vector3(0, 0, 0));
  planet.radius = 3000;
  planet.createLandmass(LOD.high, ProcessFrequency.medium);
  scene.add(planet.object3d);

  let axesHelper = new AxesHelper(5000);
  scene.add(axesHelper);

  light = new AmbientLight(0xFFF8CA, 0.2);
  scene.add(light);

  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function animate() {
  stats.begin();
  planet.process();
  camera.translateZ(-10);
  //planet.object3d.rotation.y += 0.01;
  renderer.render(scene, camera);
  stats.end();

  requestAnimationFrame(animate);
}
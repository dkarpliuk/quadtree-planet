import * as STATS from 'stats.js';
import { AmbientLight, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, SphereBufferGeometry, SphereGeometry, Vector3, WebGLRenderer } from 'three';
import { Controls } from './app/controls';
import { PlanetProcessor } from './app/planet-processor';
import { LOD } from './enums/lod';
import { ProcessFrequency } from './enums/process-frequency';
import './styles.css';

var stats = new STATS();
stats.showPanel(0);
document.body.appendChild(stats.dom);

var camera;
var controls;
var scene;
var light;
var renderer;
var planet;

init();
animate();

function init() {
  camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
  camera.position.z = 6000;
  controls = new Controls(1000, 45);
  controls.controlledObject = camera;

  let radius = 3000;
  scene = new Scene();
  planet = new PlanetProcessor(camera, new Vector3(0, 0, 0));
  planet.radius = radius;
  planet.createLandmass(LOD.high, ProcessFrequency.medium);
  scene.add(planet.object3d);

  let tmpBlackSphere = new Mesh(new SphereGeometry(radius * .98, 64, 64), new MeshBasicMaterial({ color: 0x000000 }));
  scene.add(tmpBlackSphere);

  light = new AmbientLight(0xFFF8CA, 0.2);
  scene.add(light);

  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function animate() {
  stats.begin();

  planet.process();
  renderer.render(scene, camera);
  controls.control();

  stats.end();

  requestAnimationFrame(animate);
}
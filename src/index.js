import * as STATS from 'stats.js';
import { AmbientLight, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, SphereGeometry, Vector3, WebGLRenderer } from 'three';
import { Controls } from './app/controls';
import { PlanetProcessor } from './app/planet-processor';
import { LOD } from './enums/lod';
import { ProcessFrequency } from './enums/process-frequency';
import './styles.css';

var stats, scene, camera, renderer, controls, planetProcessor;

//temporary for development
var radiusTest = 3000;
var planetPositionTest = new Vector3(3000, 0, 0);

init();
animate();

function init() {
  initStats();
  initCamera();
  initControls();
  initScene();
  initPlanet();
  initLight();
  initRenderer();
}

function initStats() {
  stats = new STATS();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
}

function initCamera() {
  camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
  camera.position.z = radiusTest * 3;
}

function initControls() {
  controls = new Controls(1000, 45);
  controls.controlledObject = camera;
}

function initScene() {
  scene = new Scene();
}

function initPlanet() {
  planetProcessor = new PlanetProcessor(camera, planetPositionTest, radiusTest);
  planetProcessor.createLandmass(LOD.high, ProcessFrequency.medium);
  planetProcessor.initialize();

  let tmpBlackSphere = new Mesh(new SphereGeometry(radiusTest * .98, 64, 64), new MeshBasicMaterial({ color: 0x000000 }));
  tmpBlackSphere.position.copy(planetPositionTest);

  scene.add(tmpBlackSphere);
  scene.add(planetProcessor.object3d);
}

function initLight() {
  let light = new AmbientLight(0xFFF8CA, 0.2);
  scene.add(light);
}

function initRenderer() {
  renderer = new WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function animate() {
  stats.begin();

  planetProcessor.process();
  controls.control();
  renderer.render(scene, camera);
  
  stats.end();

  requestAnimationFrame(animate);
}
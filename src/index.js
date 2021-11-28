import { LOD, ProcessFrequency } from '@enums';
import * as STATS from 'stats.js';
import { DirectionalLight, PerspectiveCamera, Scene, Vector3, WebGLRenderer } from 'three';
import { Controls } from './app/controls';
import { PlanetProcessor } from './app/planet-processor';
import './styles.css';

var stats, scene, camera, renderer, controls, planetProcessor;

//temporary for development
var radiusTest = 3000;
var planetPositionTest = new Vector3(0, 0, 0);

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
  camera.position.z = radiusTest * 2;
}

function initControls() {
  controls = new Controls();
  controls.controlledObject = camera;
}

function initScene() {
  scene = new Scene();
  window.scene = scene;
}

function initPlanet() {
  let seed = Math.random();
  planetProcessor = new PlanetProcessor(camera, planetPositionTest, radiusTest, seed);
  planetProcessor.createLandmass(LOD.high, ProcessFrequency.medium);
  planetProcessor.initialize();
  scene.add(planetProcessor.object3d);
}

function initLight() {
  let light = new DirectionalLight(0xffffff, 0.8);
  light.position.set(0, 0, radiusTest * 20);
  scene.add(light);
}

function initRenderer() {
  renderer = new WebGLRenderer({ antialias: true });
  renderer.shadowMap.enabled = true;
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
import { LOD, ProcessFrequency } from './enums';
import { debounce } from './helpers';
import Stats from 'stats.js';
import { AmbientLight, DirectionalLight, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, SphereGeometry, Vector3, WebGLRenderer } from 'three';
import { Controls } from './app/controls';
import { PlanetProcessor } from './app/planet-processor';
import './styles.css';

var stats, scene, camera, renderer, controls, planetProcessor;

//temporary for development
var radiusTest = 3000;
var planetPositionTest = new Vector3(0, 0, 0);
var seedTest = 1234;
var sunPositionTest = new Vector3(0.6, 0.5, 0.6).multiplyScalar(radiusTest * 20);
var sunRadiusTest = 1000;

init();
animate();

function init() {
  initStats();
  initCamera();
  initControls();
  initScene();
  initPlanet();
  initLight();
  initSun();
  initRenderer();
  initResizeHandler();
}

function initStats() {
  //one instance per panel, stats.js shows only one at a time
  let offset = 0;

  stats = [0, 1].map(panel => {
    let instance = new Stats();
    instance.showPanel(panel);
    document.body.appendChild(instance.dom);

    instance.dom.style.top = `${offset}px`;
    offset += instance.dom.offsetHeight;

    return instance;
  });
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
  planetProcessor = new PlanetProcessor(camera, planetPositionTest, radiusTest, seedTest);
  planetProcessor.createLandmass(LOD.high, ProcessFrequency.medium);
  planetProcessor.initialize();
  scene.add(planetProcessor.object3d);
}

function initLight() {
  let light = new DirectionalLight(0xffffff, 0.8);
  light.position.copy(sunPositionTest);
  scene.add(light);

  //keeps the night side from collapsing into pure black
  scene.add(new AmbientLight(0xffffff, 0.075));
}

function initSun() {
  let geometry = new SphereGeometry(sunRadiusTest, 32, 32);
  let material = new MeshBasicMaterial({ color: 0xfff4d6 });
  let sun = new Mesh(geometry, material);
  sun.position.copy(sunPositionTest);
  scene.add(sun);
}

function initRenderer() {
  renderer = new WebGLRenderer({ antialias: true, logarithmicDepthBuffer: true });
  renderer.shadowMap.enabled = true;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

function initResizeHandler() {
  window.addEventListener('resize', debounce(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, 500));
}

function animate() {
  stats.forEach(x => x.begin());

  planetProcessor.process();
  controls.control();
  renderer.render(scene, camera);

  stats.forEach(x => x.end());

  requestAnimationFrame(animate);
}
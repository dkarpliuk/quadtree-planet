import Stats from 'stats.js';
import { DirectionalLight, Mesh, MeshBasicMaterial, PerspectiveCamera, Scene, SphereGeometry, Vector3, WebGLRenderer } from 'three';
import { Controls } from './controls';
import { debounce } from 'lodash-es';
import { Planet, LOD, ProcessFrequency } from './planet';
import './styles.css';

let stats: Stats[];
let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let controls: Controls;
let planet: Planet;

//temporary for development
const radiusTest = 3000;
const planetPositionTest = new Vector3(0, 0, 0);
const seedTest = 1234;
const densityTest = 32;
const sunPositionTest = new Vector3(0, 0, 1).multiplyScalar(radiusTest * 20);
const sunRadiusTest = 1000;

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
    const instance = new Stats();
    instance.showPanel(panel);
    document.body.appendChild(instance.dom);

    instance.dom.style.top = `${offset}px`;
    offset += instance.dom.offsetHeight;

    return instance;
  });
}

function initCamera() {
  camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 100000);
  camera.position.z = 3000 * 2;
}

function initControls() {
  controls = new Controls();
  controls.controlledObject = camera;
}

function initScene() {
  scene = new Scene();
}

function initPlanet() {
  planet = new Planet(camera, planetPositionTest, radiusTest, seedTest, ProcessFrequency.medium);
  planet.createLandmass(LOD.low, LOD.high, densityTest);
  planet.initialize();
  scene.add(planet.object3d);
}

function initLight() {
  const light = new DirectionalLight(0xffffff, Math.PI);
  light.position.copy(sunPositionTest);
  scene.add(light);
}

function initSun() {
  const geometry = new SphereGeometry(sunRadiusTest, 32, 32);
  const material = new MeshBasicMaterial({ color: 0xffffff });
  const sun = new Mesh(geometry, material);
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

  planet.process();
  controls.control();
  renderer.render(scene, camera);

  stats.forEach(x => x.end());

  requestAnimationFrame(animate);
}

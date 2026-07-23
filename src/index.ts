import './styles.css';

import { type Coordinate, METER_UNITS } from '@config/common';
import { warmConfig } from '@config/config-service';
import { controlsConfig } from '@config/controls-config';
import { planetConfig } from '@config/planet-config';
import { sceneConfig } from '@config/scene-config';
import { debounce } from 'lodash-es';
import Stats from 'stats.js';
import {
  DirectionalLight,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Scene,
  SphereGeometry,
  WebGLRenderer,
} from 'three';
import { Vector3 } from 'three';

import { Controls } from './controls';
import { Planet } from './planet';

let stats: Stats[];
let scene: Scene;
let camera: PerspectiveCamera;
let renderer: WebGLRenderer;
let controls: Controls;
let planet: Planet;

await warmConfig();

const planetPosition = getVector3(sceneConfig.value.planetPositionMeters);
const sunPosition = getVector3(sceneConfig.value.sunPositionMeters);
const sunRadius = sceneConfig.value.sunRadiusMeters * METER_UNITS;
const cameraPosition = getVector3(sceneConfig.value.cameraPositionMeters);
const cameraFar = sceneConfig.value.cameraFarMeters * METER_UNITS;

function getVector3(metersCoord: Coordinate): Vector3 {
  return new Vector3(metersCoord.x, metersCoord.y, metersCoord.z).multiplyScalar(METER_UNITS);
}

init();

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
  animate();
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
  camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, cameraFar);
  camera.position.copy(cameraPosition);
}

function initControls() {
  controls = new Controls(camera, controlsConfig.value);
}

function initScene() {
  scene = new Scene();
}

function initPlanet() {
  planet = new Planet(camera, planetConfig.value);
  planet.object3d.position.copy(planetPosition);
  scene.add(planet.object3d);
  planet.createLandmass().then(() => planet.initialize());
}

function initLight() {
  const light = new DirectionalLight(0xffffff, Math.PI);
  light.position.copy(sunPosition);
  scene.add(light);
}

function initSun() {
  const geometry = new SphereGeometry(sunRadius, 32, 32);
  const material = new MeshBasicMaterial({ color: 0xffffff });
  const sun = new Mesh(geometry, material);
  sun.position.copy(sunPosition);
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

  planet.update();
  controls.control();
  renderer.render(scene, camera);

  stats.forEach(x => x.end());

  requestAnimationFrame(animate);
}

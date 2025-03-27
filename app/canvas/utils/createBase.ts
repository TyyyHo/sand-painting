// types
import {
  Scene,
  ACESFilmicToneMapping,
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { WebGPURenderer } from "three/webgpu";

export function createBase() {
  const { innerWidth, innerHeight, devicePixelRatio } = window;

  // Scene
  const scene = new Scene();

  // Renderer
  const renderer = new WebGPURenderer({ antialias: true, trackTimestamp: true });
  renderer.setPixelRatio(devicePixelRatio);
  renderer.setSize(innerWidth, innerHeight);
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;

  // light
  const light = new AmbientLight(0xffffff, 4);
  const directionalLight = new DirectionalLight(0x404040, 20);
  scene.add(light, directionalLight);

  // Camera
  const camera = new PerspectiveCamera(50, innerWidth / innerHeight, 0.1, 1000);
  camera.position.set(15, 30, 15);

  // Control
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 5;
  controls.maxDistance = 200;
  controls.target.set(2, 0, 0);
  controls.update();

  // listener
  window.addEventListener("resize", () => onWindowResize());

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }

  return { scene, renderer, camera, controls };
}

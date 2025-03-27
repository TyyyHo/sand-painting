import * as THREE from "three";

import { MapControls } from "three/addons/controls/MapControls.js";

export type AnchorPoint = { x: number; y: number; z: number };

export interface Creator {
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  controls: MapControls;
}

export interface InitialSetting {
  water: number;
  sky: number;
  islandScale: number;
  cameraPosition: AnchorPoint;
  controlsTarget: AnchorPoint;
}

export interface EnviromentParams {
  currentWeather?: string;
  currentTime?: string;
  rayleigh?: number;
  mieDirectionalG?: number;
  sunColor?: string;
  waterColor?: string;
}

export interface Site {
  id: number;
  name: string;
  position: AnchorPoint;
  mesh: THREE.Mesh;
}

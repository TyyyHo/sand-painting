"use client";

import { useEffect } from "react";
import { createBase } from "./utils/createBase";
import { createBeach } from "./utils/createBeach";
import {
  Scene,
  WebGLRenderer,
  ACESFilmicToneMapping,
  AmbientLight,
  DirectionalLight,
  PerspectiveCamera,
  Vector3,
  GridHelper,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Raycaster,
  Vector2,
  TimestampQuery,
} from "three";
import { SpriteNodeMaterial } from "three/webgpu";
import {
  Fn,
  instancedArray,
  instanceIndex,
  float,
  hash,
  vec3,
  If,
  texture,
  uniform,
} from "three/tsl";

import { baseSetting } from "./utils/base-setting";

const clickPosition = uniform(new Vector3());

export default function Canvas() {
  useEffect(() => {
    const { scene, renderer, camera, controls } = createBase();
    // const { particles, computeParticles, computeInit, positionBuffer, velocityBuffer } =
    //   createBeach();
    const activeParticles = createBeach(500000);
    const backgroundParticles = createBeach(10);

    function init() {
      const helper = new GridHelper(0, 0, 0x303030, 0x303030);

      const geometry = new PlaneGeometry(1000, 1000);
      geometry.rotateX(-Math.PI / 2);
      const plane = new Mesh(geometry, new MeshBasicMaterial({ visible: false }));

      //

      scene.add(plane);
      // scene.add(helper);
      scene.add(activeParticles.particles);
      scene.add(backgroundParticles.particles);

      //

      const raycaster = new Raycaster();
      const pointer = new Vector2();

      //

      renderer.computeAsync(activeParticles.computeInit);
      renderer.computeAsync(backgroundParticles.computeInit);

      // Effect when mouse hover or click

      const computeHit = Fn(() => {
        const position = activeParticles.positionBuffer.element(instanceIndex);
        const velocity = activeParticles.velocityBuffer.element(instanceIndex);

        const dist = position.distance(clickPosition);
        const direction = position.sub(clickPosition).normalize();
        const distArea = float(6).sub(dist).max(0);

        const power = distArea.mul(0.002);
        const relativePower = power.mul(hash(instanceIndex).mul(0.5).add(0.5));

        velocity.assign(velocity.add(direction.mul(relativePower)));
      })().compute(baseSetting.particleCount);

      // Detect mouse move

      function onMove(event: MouseEvent) {
        pointer.set(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1
        );

        raycaster.setFromCamera(pointer, camera);

        const intersects = raycaster.intersectObjects([plane], false);

        if (intersects.length > 0) {
          const { point } = intersects[0];

          // move to uniform

          clickPosition.value.copy(point);
          clickPosition.value.y = -1;

          // compute

          renderer.computeAsync(computeHit);
        }
      }

      // add event listeners

      document.addEventListener("pointermove", onMove);
    }

    async function animate() {
      // stats.update();

      await renderer.computeAsync(activeParticles.computeParticles);
      renderer.resolveTimestampsAsync(TimestampQuery.COMPUTE);

      await renderer.renderAsync(scene, camera);
      renderer.resolveTimestampsAsync(TimestampQuery.RENDER);

      // throttle the logging for checking performance

      // const timestamps = document.getElementById("timestamps");
      // if (renderer.hasFeature("timestamp-query")) {
      //   if (renderer.info.render.calls % 5 === 0) {
      //     timestamps!.innerHTML = `
      // 				Compute ${
      //           renderer.info.compute.frameCalls
      //         } pass in ${renderer.info.compute.timestamp.toFixed(6)}ms<br>
      // 				Draw ${renderer.info.render.drawCalls} pass in ${renderer.info.render.timestamp.toFixed(6)}ms`;
      //   }
      // } else {
      //   timestamps!.innerHTML = "Timestamp queries not supported";
      // }
    }

    init();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.getElementById("canvas-container")?.appendChild(renderer.domElement);

    return () => {
      renderer.dispose();
      controls.dispose();
    };
  }, []);

  return (
    <>
      <div
        id="timestamps"
        className="absolute top-0 left-0 bg-black/50 text-white font-mono text-xs pointer-events-none"
      ></div>
      <div id="canvas-container" className="fixed inset-0 -z-10"></div>
    </>
  );
}

import { Mesh, PlaneGeometry, TextureLoader } from "three";
import { Fn, instancedArray, instanceIndex, hash, vec3, If } from "three/tsl";
import { SpriteNodeMaterial } from "three/webgpu";

import sand from "../../../public/image/texture/sand.webp";
import { baseSetting } from "./base-setting";

export function createBeach(particleCount: number) {
  const textureLoader = new TextureLoader();
  const map = textureLoader.load(sand.src);

  const positionBuffer = instancedArray(particleCount, "vec3");
  const velocityBuffer = instancedArray(particleCount, "vec3");
  const colorBuffer = instancedArray(particleCount, "vec3");

  const computeInit = Fn(() => {
    const position = positionBuffer.element(instanceIndex);
    const color = colorBuffer.element(instanceIndex);

    const randX = hash(instanceIndex);
    const randY = hash(instanceIndex.add(2));
    const randZ = hash(instanceIndex.add(3));

    position.x = randX.mul(100).add(-50);
    position.y = randY.mul(0);
    position.z = randZ.mul(100).add(-50);

    color.assign(vec3(randX, randY, randZ));
  })().compute(particleCount);

  const computeUpdate = Fn(() => {
    const position = positionBuffer.element(instanceIndex);
    const velocity = velocityBuffer.element(instanceIndex);

    velocity.addAssign(vec3(0.0, baseSetting.gravity, 0.0));
    position.addAssign(velocity);

    velocity.mulAssign(baseSetting.friction);

    // floor

    If(position.y.lessThan(0), () => {
      const randY = hash(instanceIndex.add(2));
      position.y = randY.mul(0);
      velocity.y = velocity.y.negate().mul(baseSetting.bounce);

      // floor friction

      velocity.x = velocity.x.mul(0.9);
      velocity.z = velocity.z.mul(0.9);
    });
  });

  const computeParticles = computeUpdate().compute(particleCount);

  // Particle color

  // const textureNode = texture(map);
  // particleMaterial.colorNode = textureNode.mul(colorBuffer.element(instanceIndex));

  // create particles

  const particleMaterial = new SpriteNodeMaterial();
  particleMaterial.positionNode = (positionBuffer as any).toAttribute();
  particleMaterial.scaleNode = baseSetting.size;
  particleMaterial.depthWrite = false;
  particleMaterial.depthTest = true;
  particleMaterial.transparent = true;

  const particles = new Mesh(new PlaneGeometry(1, 1), particleMaterial);
  particles.count = particleCount;
  particles.frustumCulled = false;

  return {
    particles,
    computeParticles,
    computeInit,
    positionBuffer,
    velocityBuffer,
    colorBuffer,
  };
}

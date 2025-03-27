import { uniform } from "three/tsl";

export const baseSetting = {
  particleCount: 1000000,
  gravity: uniform(-0.0098),
  bounce: uniform(0.8),
  friction: uniform(0.99),
  size: uniform(0.12),
};

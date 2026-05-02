import { WORLD_HEIGHT, WORLD_WIDTH } from "./constants.js";
import type { Vec2 } from "./types.js";

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function distance(a: Vec2, b: Vec2): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function distanceSq(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

export function normalizeAngle(angle: number): number {
  let result = angle;
  while (result <= -Math.PI) result += Math.PI * 2;
  while (result > Math.PI) result -= Math.PI * 2;
  return result;
}

export function rotateToward(current: number, target: number, maxStep: number): number {
  const delta = normalizeAngle(target - current);
  if (Math.abs(delta) <= maxStep) return normalizeAngle(target);
  return normalizeAngle(current + Math.sign(delta) * maxStep);
}

export function headingToVector(angle: number): Vec2 {
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

export function clampToWorld(point: Vec2, padding = 24): Vec2 {
  return {
    x: clamp(point.x, padding, WORLD_WIDTH - padding),
    y: clamp(point.y, padding, WORLD_HEIGHT - padding)
  };
}

export function randomPoint(rng: () => number, padding = 160): Vec2 {
  return {
    x: padding + rng() * (WORLD_WIDTH - padding * 2),
    y: padding + rng() * (WORLD_HEIGHT - padding * 2)
  };
}

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

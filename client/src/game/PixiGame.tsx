import { useEffect, useRef } from "react";
import { Application, Container, Graphics, Text } from "pixi.js";
import {
  MAX_SEGMENTS,
  MIN_SCORE,
  SCORE_PER_SEGMENT,
  SEGMENT_SPACING,
  START_LENGTH,
  TAIL_GROW_SEGMENTS_PER_SECOND,
  TAIL_SHRINK_SEGMENTS_PER_SECOND,
  WORLD_HEIGHT,
  WORLD_WIDTH
} from "../../../shared/constants";
import type { ClientInput, FoodPellet, PlayerState, ServerSnapshot, Vec2 } from "../../../shared/types";

type PixiGameProps = {
  snapshot?: ServerSnapshot;
  playerId?: string;
  paused: boolean;
  onInput: (input: ClientInput) => void;
  onPerf?: (perf: { fps: number; renderer: string }) => void;
};

type CameraState = Vec2 & {
  zoom: number;
};

type DeathEffect = {
  age: number;
  color: string;
  accent: string;
  segments: Vec2[];
};

type WorldBounds = {
  left: number;
  right: number;
  top: number;
  bottom: number;
};

type RopeState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

type RenderedPlayer = PlayerState & {
  visualSegmentProgress: number;
};

export function PixiGame({ snapshot, playerId, paused, onInput, onPerf }: PixiGameProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef<ServerSnapshot | undefined>(undefined);
  const playerIdRef = useRef<string | undefined>(undefined);
  const pausedRef = useRef(paused);
  const onInputRef = useRef(onInput);
  const onPerfRef = useRef(onPerf);

  useEffect(() => {
    snapshotRef.current = snapshot;
  }, [snapshot]);

  useEffect(() => {
    playerIdRef.current = playerId;
  }, [playerId]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  useEffect(() => {
    onInputRef.current = onInput;
  }, [onInput]);

  useEffect(() => {
    onPerfRef.current = onPerf;
  }, [onPerf]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let destroyed = false;
    let arenaDrawn = false;
    let pointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let boosting = false;
    let lastInputAt = 0;
    let lastHeading = 0;
    let lastBoosting = false;
    let perfFrames = 0;
    let perfStartedAt = performance.now();
    let rendererName = "webgl";
    const camera: CameraState = { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2, zoom: 1 };
    const renderPlayers = new Map<string, RenderedPlayer>();
    const renderFood = new Map<string, FoodPellet>();
    const deathEffects: DeathEffect[] = [];
    const ropeStates = new Map<string, RopeState>();

    const app = new Application();
    const world = new Container();
    const background = new Graphics();
    const foodLayer = new Graphics();
    const snakeLayer = new Graphics();
    const labelLayer = new Container();
    const vignette = new Graphics();

    app
      .init({
        resizeTo: host,
        background: "#04070d",
        preference: "webgl",
        powerPreference: "high-performance",
        antialias: true,
        autoDensity: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2)
      })
      .then(() => {
        if (destroyed) {
          app.destroy(true);
          return;
        }

        app.canvas.className = "pixi-canvas";
        rendererName = detectRenderer(app.renderer);
        app.canvas.dataset.renderer = rendererName;
        host.appendChild(app.canvas);
        app.stage.addChild(world);
        world.addChild(background, foodLayer, snakeLayer, labelLayer);
        app.stage.addChild(vignette);
        app.ticker.maxFPS = 0;
        app.ticker.minFPS = 30;

        app.ticker.add((ticker) => {
          drawFrame(app, world, background, foodLayer, snakeLayer, labelLayer, vignette, camera, ticker.deltaMS / 1000);
          if (!pausedRef.current) sendAim(app, world, pointer, boosting);
          reportPerf(rendererName);
        });
      });

    const handlePointerMove = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
    };
    const handlePointerDown = (event: PointerEvent) => {
      pointer = { x: event.clientX, y: event.clientY };
      boosting = true;
    };
    const handlePointerUp = () => {
      boosting = false;
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") boosting = true;
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") boosting = false;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    function drawFrame(
      pixi: Application,
      worldContainer: Container,
      bg: Graphics,
      food: Graphics,
      snakes: Graphics,
      labels: Container,
      overlay: Graphics,
      cam: CameraState,
      dt: number
    ) {
      const state = snapshotRef.current;
      const renderedPlayers = smoothPlayers(renderPlayers, state?.players ?? [], dt, deathEffects);
      for (const id of ropeStates.keys()) {
        if (!renderedPlayers.find((p) => p.id === id)) ropeStates.delete(id);
      }
      const renderedFood = smoothFood(renderFood, state?.food ?? [], dt);
      const me = renderedPlayers.find((player) => player.id === playerIdRef.current);
      const focal = me?.segments[0] ?? { x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2 };
      const cameraEase = 1 - Math.exp(-dt * 7.5);
      cam.x += (focal.x - cam.x) * cameraEase;
      cam.y += (focal.y - cam.y) * cameraEase;

      const baseScale = Math.max(0.56, Math.min(1, Math.min(pixi.screen.width / 1280, pixi.screen.height / 760)));
      const sizeScale = me ? snakeSizeScale(me) : 1;
      const targetZoom = 1 / Math.min(1.58, 1 + (sizeScale - 1) * 0.55);
      cam.zoom += (targetZoom - cam.zoom) * (1 - Math.exp(-dt * 3.8));
      const scale = baseScale * cam.zoom;
      worldContainer.scale.set(scale);
      worldContainer.position.set(pixi.screen.width / 2 - cam.x * scale, pixi.screen.height / 2 - cam.y * scale);
      const view = worldViewBounds(pixi, worldContainer, 190);

      if (!arenaDrawn) {
        bg.clear();
        drawArena(bg);
        arenaDrawn = true;
      }
      food.clear();
      snakes.clear();
      labels.removeChildren();

      if (state) {
        for (const pellet of renderedFood) {
          if (!insideBounds(pellet, view)) continue;
          food.circle(pellet.x, pellet.y, 5.2).fill({ color: pellet.color, alpha: 0.92 });
          food.circle(pellet.x - 1.8, pellet.y - 1.8, 1.6).fill({ color: 0xffffff, alpha: 0.62 });
        }

        drawDeathEffects(snakes, deathEffects, dt, view);
        const sorted = [...renderedPlayers].sort((a, b) => a.segments.length - b.segments.length);
        for (const player of sorted) {
          updateRopeState(ropeStates, player, dt);
          drawSnake(snakes, labels, player, player.id === playerIdRef.current, view, ropeStates.get(player.id));
        }
      }

      overlay.clear();
      overlay.rect(0, 0, pixi.screen.width, pixi.screen.height).fill({ color: 0x02050a, alpha: 0.08 });
    }

    function sendAim(pixi: Application, worldContainer: Container, aim: Vec2, boost: boolean) {
      const player = snapshotRef.current?.players.find((item) => item.id === playerIdRef.current);
      if (!player?.alive) return;
      const head = player.segments[0];
      const target = screenToWorld(pixi, worldContainer, aim);
      const heading = Math.atan2(target.y - head.y, target.x - head.x);
      const now = performance.now();
      const changedEnough = Math.abs(angleDelta(heading, lastHeading)) > 0.018 || boost !== lastBoosting;
      if (!changedEnough && now - lastInputAt < 1000 / 60) return;
      lastInputAt = now;
      lastHeading = heading;
      lastBoosting = boost;
      onInputRef.current({ heading, boosting: boost });
    }

    function reportPerf(renderer: string) {
      perfFrames += 1;
      const now = performance.now();
      const elapsed = now - perfStartedAt;
      if (elapsed < 500) return;
      onPerfRef.current?.({ fps: Math.round((perfFrames * 1000) / elapsed), renderer });
      perfFrames = 0;
      perfStartedAt = now;
    }

    return () => {
      destroyed = true;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      app.destroy(true);
    };
  }, []);

  return <div className="game-canvas" ref={hostRef} aria-label="Slithera PixiJS arena" />;
}

function drawArena(graphics: Graphics) {
  graphics.rect(0, 0, WORLD_WIDTH, WORLD_HEIGHT).fill("#050910");

  for (let x = 0; x <= WORLD_WIDTH; x += 96) {
    graphics.moveTo(x, 0).lineTo(x, WORLD_HEIGHT).stroke({ color: 0x113040, alpha: x % 480 === 0 ? 0.22 : 0.08, width: 1 });
  }
  for (let y = 0; y <= WORLD_HEIGHT; y += 96) {
    graphics.moveTo(0, y).lineTo(WORLD_WIDTH, y).stroke({ color: 0x113040, alpha: y % 480 === 0 ? 0.22 : 0.08, width: 1 });
  }

  for (let x = -WORLD_HEIGHT; x < WORLD_WIDTH; x += 220) {
    graphics
      .moveTo(x, WORLD_HEIGHT)
      .lineTo(x + WORLD_HEIGHT, 0)
      .stroke({ color: 0x1a3e4d, alpha: 0.045, width: 1 });
  }

  const formations = [
    [420, 520, 210, 0x122245],
    [1220, 2780, 250, 0x153819],
    [4050, 620, 310, 0x241548],
    [4560, 2610, 280, 0x064335],
    [3150, 1760, 170, 0x34210d],
    [710, 2320, 190, 0x21123f]
  ] as const;

  for (const [x, y, radius, color] of formations) {
    graphics.circle(x, y, radius).fill({ color, alpha: 0.18 });
    graphics.circle(x, y, radius * 0.34).fill({ color, alpha: 0.22 });
    graphics.circle(x + radius * 0.18, y - radius * 0.1, radius * 0.08).fill({ color: 0x22d8ff, alpha: 0.16 });
    graphics.circle(x - radius * 0.3, y + radius * 0.22, radius * 0.06).fill({ color: 0xffffff, alpha: 0.045 });
  }

  graphics.rect(18, 18, WORLD_WIDTH - 36, WORLD_HEIGHT - 36).stroke({ color: 0x12d8ff, alpha: 0.32, width: 3 });
}

function drawSnake(graphics: Graphics, labels: Container, player: PlayerState, you: boolean, view: WorldBounds, rope?: RopeState): void {
  if (!player.alive || player.segments.length === 0) return;
  const color = Number.parseInt(player.color.slice(1), 16);
  const accent = Number.parseInt(player.accent.slice(1), 16);
  const growth = snakeSizeScale(player);
  const displaySegments = segmentsWithGrowingTail(player);
  const segCount = displaySegments.length;
  const taperingStart = Math.floor(segCount * 0.8);
  const bodyRadius = 14 * growth;

  // Draw body circles tail-first so head renders on top
  for (let i = segCount - 1; i >= 1; i -= 1) {
    const seg = displaySegments[i];
    if (!insideBounds(seg, view)) continue;
    let radius: number;
    if (i >= taperingStart) {
      const tailProg = (i - taperingStart) / Math.max(1, segCount - 1 - taperingStart);
      radius = (14 - tailProg * 5) * growth;
    } else {
      radius = bodyRadius;
    }
    graphics.circle(seg.x, seg.y, radius).fill({ color, alpha: 1 });
  }

  // Head
  const head = displaySegments[0];
  if (!insideBounds(head, view)) return;
  const headRadius = 16 * growth;
  graphics.circle(head.x, head.y, headRadius).fill({ color, alpha: 1 });
  // Shimmer highlight
  graphics.circle(head.x - headRadius * 0.28, head.y - headRadius * 0.28, headRadius * 0.32).fill({ color: accent, alpha: 0.22 });
  // Eyes
  const eyeOffset = { x: Math.cos(player.heading + Math.PI / 2) * 6 * growth, y: Math.sin(player.heading + Math.PI / 2) * 6 * growth };
  const nose = { x: Math.cos(player.heading) * 8 * growth, y: Math.sin(player.heading) * 8 * growth };
  graphics.circle(head.x + nose.x + eyeOffset.x, head.y + nose.y + eyeOffset.y, 4 * growth).fill(0x031018);
  graphics.circle(head.x + nose.x - eyeOffset.x, head.y + nose.y - eyeOffset.y, 4 * growth).fill(0x031018);
  graphics.circle(head.x + nose.x + eyeOffset.x + 1 * growth, head.y + nose.y + eyeOffset.y - 1 * growth, 1.3 * growth).fill(0xffffff);
  graphics.circle(head.x + nose.x - eyeOffset.x + 1 * growth, head.y + nose.y - eyeOffset.y - 1 * growth, 1.3 * growth).fill(0xffffff);

  if (rope && player.ropeAccessoryId && player.ropeAccessoryId !== "none") {
    const attachX = head.x - Math.cos(player.heading) * 18;
    const attachY = head.y - Math.sin(player.heading) * 18;
    graphics.moveTo(attachX, attachY).lineTo(rope.x, rope.y).stroke({ color: 0xc8dce8, alpha: 0.5, width: 1.8 });
    drawRopeAccessory(graphics, player.ropeAccessoryId, rope.x, rope.y, accent);
  }

  // Label
  if (you) {
    const label = new Text({
      text: "You",
      style: { fill: "#ffffff", fontFamily: "Inter, system-ui, sans-serif", fontSize: 18, fontWeight: "700" }
    });
    label.anchor.set(0.5);
    label.position.set(head.x, head.y - 42);
    labels.addChild(label);
  }
}

function segmentsWithGrowingTail(player: PlayerState): Vec2[] {
  const desired = desiredRenderSegmentCount(player.score);
  const progress = visualSegmentProgress(player);
  if (desired <= player.segments.length || progress <= 0.001) return player.segments;

  const tail = extendRenderedTail(player.segments, SEGMENT_SPACING * Math.min(0.98, progress), player.heading);
  return [...player.segments, tail];
}

function visualSegmentProgress(player: PlayerState): number {
  const rendered = player as Partial<RenderedPlayer>;
  return typeof rendered.visualSegmentProgress === "number" ? rendered.visualSegmentProgress : player.segmentProgress;
}

function desiredRenderSegmentCount(score: number): number {
  return Math.min(MAX_SEGMENTS, Math.max(START_LENGTH, START_LENGTH + Math.floor(Math.max(0, score - MIN_SCORE) / SCORE_PER_SEGMENT)));
}


function smoothPlayers(cache: Map<string, RenderedPlayer>, targets: PlayerState[], dt: number, deathEffects: DeathEffect[]): RenderedPlayer[] {
  const targetIds = new Set(targets.map((player) => player.id));
  for (const id of cache.keys()) {
    if (!targetIds.has(id)) cache.delete(id);
  }

  const frameDt = Math.min(dt, 0.034);
  const correctionAlpha = 1 - Math.exp(-frameDt * 14);
  const headingAlpha = 1 - Math.exp(-frameDt * 18);
  for (const target of targets) {
    const current = cache.get(target.id);
    if (current?.alive && !target.alive) {
      deathEffects.push({
        age: 0,
        color: current.color,
        accent: current.accent,
        segments: current.segments.filter((_, index) => index % 2 === 0).map((segment) => ({ ...segment }))
      });
    }

    if (!current || current.alive !== target.alive) {
      cache.set(target.id, clonePlayer(target));
      continue;
    }

    advanceRenderedPlayer(current, frameDt);
    approachRenderedLength(current, target, frameDt);
    current.score = target.score;
    current.boost = target.boost;
    current.kills = target.kills;
    current.targetHeading = target.targetHeading;
    current.boosting = target.boosting;
    current.speed = target.speed;
    current.segmentProgress = Math.max(0, current.visualSegmentProgress, target.segmentProgress);
    current.heading = lerpAngle(current.heading, target.heading, headingAlpha);
    current.alive = target.alive;
    current.color = target.color;
    current.accent = target.accent;
    current.skinId = target.skinId;
    current.ropeAccessoryId = target.ropeAccessoryId;
    const correctionCount = Math.min(current.segments.length, target.segments.length);
    for (let index = 0; index < correctionCount; index += 1) {
      const tailT = index / Math.max(1, current.segments.length - 1);
      const segmentAlpha = correctionAlpha * (1 - tailT * 0.78);
      current.segments[index].x += (target.segments[index].x - current.segments[index].x) * segmentAlpha;
      current.segments[index].y += (target.segments[index].y - current.segments[index].y) * segmentAlpha;
    }
  }

  return [...cache.values()];
}

function smoothFood(cache: Map<string, FoodPellet>, targets: FoodPellet[], dt: number): FoodPellet[] {
  const targetIds = new Set(targets.map((food) => food.id));
  for (const id of cache.keys()) {
    if (!targetIds.has(id)) cache.delete(id);
  }

  const alpha = 1 - Math.exp(-Math.min(dt, 0.034) * 12);
  for (const target of targets) {
    const current = cache.get(target.id);
    if (!current) {
      cache.set(target.id, { ...target });
      continue;
    }

    current.x += (target.x - current.x) * alpha;
    current.y += (target.y - current.y) * alpha;
    current.color = target.color;
    current.value = target.value;
    current.driftAngle = target.driftAngle;
    current.driftSpeed = target.driftSpeed;
  }

  return [...cache.values()];
}

function drawDeathEffects(graphics: Graphics, effects: DeathEffect[], dt: number, view: WorldBounds): void {
  for (let effectIndex = effects.length - 1; effectIndex >= 0; effectIndex -= 1) {
    const effect = effects[effectIndex];
    effect.age += dt;
    const life = 0.82;
    const t = effect.age / life;
    if (t >= 1) {
      effects.splice(effectIndex, 1);
      continue;
    }

    const color = Number.parseInt(effect.color.slice(1), 16);
    const accent = Number.parseInt(effect.accent.slice(1), 16);
    const alpha = (1 - t) * 0.72;
    for (let index = 0; index < effect.segments.length; index += 1) {
      const segment = effect.segments[index];
      if (!insideBounds(segment, view)) continue;
      const angle = index * 1.73;
      const drift = t * 42;
      const x = segment.x + Math.cos(angle) * drift;
      const y = segment.y + Math.sin(angle) * drift;
      graphics.circle(x, y, 8 + t * 18).fill({ color, alpha: alpha * 0.16 });
      graphics.circle(x, y, 3.8 + t * 6).fill({ color: index % 3 === 0 ? accent : color, alpha });
    }
  }
}

function advanceRenderedPlayer(player: PlayerState, dt: number): void {
  if (!player.alive || player.segments.length < 2) return;
  const head = player.segments[0];
  const direction = { x: Math.cos(player.heading), y: Math.sin(player.heading) };
  const nextHead = {
    x: head.x + direction.x * player.speed * dt,
    y: head.y + direction.y * player.speed * dt
  };
  player.segments = sampleRenderedTrail([nextHead, ...player.segments], player.segments.length, player.heading);
}

function approachRenderedLength(player: RenderedPlayer, target: PlayerState, dt: number): void {
  const targetLength = target.segments.length;
  const desiredLength = desiredRenderSegmentCount(target.score);

  if (player.segments.length < targetLength) {
    player.visualSegmentProgress = Math.max(player.visualSegmentProgress, target.segmentProgress, 0) + TAIL_GROW_SEGMENTS_PER_SECOND * dt;
    while (player.segments.length < targetLength && player.visualSegmentProgress >= 1) {
      const serverPos = target.segments[player.segments.length];
      const newSeg = serverPos
        ? { x: serverPos.x, y: serverPos.y }
        : extendRenderedTail(player.segments, SEGMENT_SPACING, player.heading);
      player.segments.push(newSeg);
      player.visualSegmentProgress -= 1;
    }
    player.visualSegmentProgress = Math.min(player.visualSegmentProgress, 0.98);
    return;
  }

  if (player.segments.length > targetLength) {
    player.visualSegmentProgress = Math.min(player.visualSegmentProgress, 0) - TAIL_SHRINK_SEGMENTS_PER_SECOND * dt;
    while (player.segments.length > targetLength && player.visualSegmentProgress <= -1) {
      player.segments.pop();
      player.visualSegmentProgress += 1;
    }
    player.visualSegmentProgress = Math.max(player.visualSegmentProgress, -0.98);
    return;
  }

  if (desiredLength > player.segments.length) {
    player.visualSegmentProgress = Math.min(
      0.98,
      Math.max(player.visualSegmentProgress, target.segmentProgress, 0) + TAIL_GROW_SEGMENTS_PER_SECOND * dt
    );
    return;
  }

  if (desiredLength < player.segments.length) {
    player.visualSegmentProgress = Math.max(
      -0.98,
      Math.min(player.visualSegmentProgress, target.segmentProgress, 0) - TAIL_SHRINK_SEGMENTS_PER_SECOND * dt
    );
    return;
  }

  const settleAlpha = 1 - Math.exp(-dt * 12);
  player.visualSegmentProgress += (Math.max(0, target.segmentProgress) - player.visualSegmentProgress) * settleAlpha;
  if (Math.abs(player.visualSegmentProgress) < 0.001) player.visualSegmentProgress = 0;
}

function sampleRenderedTrail(points: Vec2[], desiredCount: number, heading: number): Vec2[] {
  if (points.length === 0) return [];
  const samples: Vec2[] = [{ ...points[0] }];
  let segmentIndex = 0;
  let travelled = 0;

  for (let sampleIndex = 1; sampleIndex < desiredCount; sampleIndex += 1) {
    const targetDistance = sampleIndex * SEGMENT_SPACING;
    let placed = false;

    while (segmentIndex < points.length - 1) {
      const a = points[segmentIndex];
      const b = points[segmentIndex + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const length = Math.hypot(dx, dy);

      if (length < 0.001) {
        segmentIndex += 1;
        continue;
      }

      if (travelled + length >= targetDistance) {
        const t = (targetDistance - travelled) / length;
        samples.push({ x: a.x + dx * t, y: a.y + dy * t });
        placed = true;
        break;
      }

      travelled += length;
      segmentIndex += 1;
    }

    if (!placed) {
      samples.push(extendRenderedTail(points, targetDistance - travelled, heading));
    }
  }

  return samples;
}

function extendRenderedTail(points: Vec2[], extraDistance: number, heading: number): Vec2 {
  const tail = points[points.length - 1];
  const beforeTail = points[points.length - 2];
  if (!beforeTail) {
    return {
      x: tail.x - Math.cos(heading) * extraDistance,
      y: tail.y - Math.sin(heading) * extraDistance
    };
  }

  const dx = tail.x - beforeTail.x;
  const dy = tail.y - beforeTail.y;
  const d = Math.hypot(dx, dy);
  if (d < 0.001) {
    return {
      x: tail.x - Math.cos(heading) * extraDistance,
      y: tail.y - Math.sin(heading) * extraDistance
    };
  }

  return {
    x: tail.x + (dx / d) * extraDistance,
    y: tail.y + (dy / d) * extraDistance
  };
}

function clonePlayer(player: PlayerState): RenderedPlayer {
  return {
    ...player,
    visualSegmentProgress: Math.max(0, player.segmentProgress),
    segments: player.segments.map((segment) => ({ ...segment }))
  };
}

function updateRopeState(states: Map<string, RopeState>, player: PlayerState, dt: number): void {
  if (!player.ropeAccessoryId || player.ropeAccessoryId === "none" || !player.alive || player.segments.length === 0) {
    states.delete(player.id);
    return;
  }
  const head = player.segments[0];
  const ropeLength = 44;
  const targetX = head.x - Math.cos(player.heading) * ropeLength;
  const targetY = head.y - Math.sin(player.heading) * ropeLength;

  const state = states.get(player.id);
  if (!state) {
    states.set(player.id, { x: targetX, y: targetY, vx: 0, vy: 0 });
    return;
  }

  const springK = 14;
  const damping = 0.84;
  const safeDt = Math.min(dt, 0.05);
  const dtDamping = Math.pow(damping, safeDt * 60);
  const fx = (targetX - state.x) * springK * safeDt;
  const fy = (targetY - state.y) * springK * safeDt;
  state.vx = (state.vx + fx) * dtDamping;
  state.vy = (state.vy + fy) * dtDamping;
  state.x += state.vx * safeDt;
  state.y += state.vy * safeDt;
}

function drawRopeAccessory(graphics: Graphics, accessoryId: string, cx: number, cy: number, accent: number): void {
  graphics.circle(cx, cy, 12).fill({ color: 0x1a2030, alpha: 1 });
  graphics.circle(cx, cy, 12).stroke({ color: 0xc8dce8, alpha: 0.3, width: 1.2 });
  const r = 7;
  switch (accessoryId) {
    case "skull":   drawSkullIcon(graphics, cx, cy, r, accent); break;
    case "star":    graphics.poly(starIconPoints(cx, cy, r, r * 0.42)).fill({ color: accent, alpha: 1 }); break;
    case "diamond": graphics.poly([cx, cy - r, cx + r * 0.58, cy, cx, cy + r, cx - r * 0.58, cy]).fill({ color: accent, alpha: 1 }); break;
    case "bolt":    graphics.poly(boltIconPoints(cx, cy, r)).fill({ color: accent, alpha: 1 }); break;
    case "fire":    drawFireIcon(graphics, cx, cy, r, accent); break;
    case "eye":     drawEyeIcon(graphics, cx, cy, r, accent); break;
    case "heart":   drawHeartIcon(graphics, cx, cy, r, accent); break;
  }
}

function starIconPoints(cx: number, cy: number, outer: number, inner: number): number[] {
  const pts: number[] = [];
  for (let i = 0; i < 10; i += 1) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    pts.push(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
  }
  return pts;
}

function boltIconPoints(cx: number, cy: number, r: number): number[] {
  return [cx + 1.5, cy - r, cx - 2.5, cy - 0.5, cx + 2, cy - 0.5, cx - 1.5, cy + r, cx + 2.5, cy + 0.5, cx - 2, cy + 0.5];
}

function drawSkullIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  g.circle(cx, cy - r * 0.1, r * 0.78).fill({ color, alpha: 1 });
  g.circle(cx - r * 0.28, cy - r * 0.16, r * 0.28).fill({ color: 0x1a2030, alpha: 1 });
  g.circle(cx + r * 0.28, cy - r * 0.16, r * 0.28).fill({ color: 0x1a2030, alpha: 1 });
  const tw = r * 0.18, th = r * 0.28, ty = cy + r * 0.42;
  for (let i = -1; i <= 1; i += 1) {
    g.rect(cx + i * r * 0.28 - tw / 2, ty, tw, th).fill({ color, alpha: 1 });
  }
}

function drawFireIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  g.circle(cx, cy + r * 0.18, r * 0.62).fill({ color, alpha: 1 });
  g.circle(cx, cy - r * 0.08, r * 0.42).fill({ color, alpha: 0.85 });
  g.circle(cx, cy - r * 0.58, r * 0.24).fill({ color, alpha: 0.7 });
}

function drawEyeIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  g.circle(cx - r * 0.3, cy, r * 0.52).fill({ color, alpha: 1 });
  g.circle(cx + r * 0.3, cy, r * 0.52).fill({ color, alpha: 1 });
  g.rect(cx - r * 0.7, cy - r * 0.52, r * 1.4, r * 1.04).fill({ color, alpha: 1 });
  g.circle(cx, cy, r * 0.36).fill({ color: 0x1a2030, alpha: 1 });
  g.circle(cx + r * 0.1, cy - r * 0.1, r * 0.14).fill({ color: 0xffffff, alpha: 1 });
}

function drawHeartIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  g.circle(cx - r * 0.28, cy - r * 0.1, r * 0.42).fill({ color, alpha: 1 });
  g.circle(cx + r * 0.28, cy - r * 0.1, r * 0.42).fill({ color, alpha: 1 });
  g.poly([cx - r * 0.7, cy + r * 0.08, cx + r * 0.7, cy + r * 0.08, cx, cy + r]).fill({ color, alpha: 1 });
}

function snakeSizeScale(player: PlayerState): number {
  const progress = Math.max(0, player.segments.length - START_LENGTH) / Math.max(1, MAX_SEGMENTS - START_LENGTH);
  return 1.02 + Math.min(1, progress) * 0.42;
}

function lerpAngle(current: number, target: number, alpha: number): number {
  const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + delta * alpha;
}

function angleDelta(a: number, b: number): number {
  return Math.atan2(Math.sin(a - b), Math.cos(a - b));
}

function screenToWorld(app: Application, world: Container, point: Vec2): Vec2 {
  return {
    x: (point.x - world.position.x) / world.scale.x,
    y: (point.y - world.position.y) / world.scale.y
  };
}

function worldViewBounds(app: Application, world: Container, padding: number): WorldBounds {
  const topLeft = screenToWorld(app, world, { x: -padding, y: -padding });
  const bottomRight = screenToWorld(app, world, { x: app.screen.width + padding, y: app.screen.height + padding });
  return {
    left: topLeft.x,
    right: bottomRight.x,
    top: topLeft.y,
    bottom: bottomRight.y
  };
}

function insideBounds(point: Vec2, bounds: WorldBounds): boolean {
  return point.x >= bounds.left && point.x <= bounds.right && point.y >= bounds.top && point.y <= bounds.bottom;
}

function detectRenderer(renderer: unknown): string {
  const candidate = renderer as { type?: unknown; name?: unknown };
  if (typeof candidate.name === "string") return candidate.name;
  if (typeof candidate.type === "string") return candidate.type;
  if (typeof candidate.type === "number") return candidate.type === 1 ? "webgl" : `renderer-${candidate.type}`;
  return "webgl";
}

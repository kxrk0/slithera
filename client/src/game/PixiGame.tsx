import { useEffect, useRef, useState } from "react";
import { Application, Container, Graphics, Text } from "pixi.js";
import {
  MAX_SEGMENTS,
  SEGMENT_SPACING,
  START_LENGTH,
  TAIL_GROW_SEGMENTS_PER_SECOND,
  TAIL_SHRINK_SEGMENTS_PER_SECOND,
  WORLD_HEIGHT,
  WORLD_WIDTH
} from "../../../shared/constants";
import type { ClientInput, FoodPellet, PlayerState, ServerSnapshot, Vec2 } from "../../../shared/types";
import { loadSettings } from "../lib/settings";
import { darkenColor, hslToHex, parseHexColor } from "./render/colors";
import { drawHat, hatHeight } from "./render/hatRenderer";
import { drawRopeAccessory } from "./render/ropeIcons";
import type { RecentEvent } from "./useGameClient";

type PixiGameProps = {
  snapshot?: ServerSnapshot;
  playerId?: string;
  paused: boolean;
  onInput: (input: ClientInput) => void;
  onPerf?: (perf: { fps: number; renderer: string }) => void;
  recentEvents?: RecentEvent[];
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;       // 1 → 0
  decay: number;      // life decreases by `decay * dt`
  size: number;
  color: number;
};

type ScreenShake = {
  amplitude: number;
  remaining: number;  // seconds
  duration: number;
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

export function PixiGame({ snapshot, playerId, paused, onInput, onPerf, recentEvents }: PixiGameProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const snapshotRef = useRef<ServerSnapshot | undefined>(undefined);
  const playerIdRef = useRef<string | undefined>(undefined);
  const pausedRef = useRef(paused);
  const onInputRef = useRef(onInput);
  const onPerfRef = useRef(onPerf);
  const recentEventsRef = useRef<RecentEvent[] | undefined>(undefined);
  const consumedEventAtRef = useRef<number>(0);
  // Bumped whenever we need to remount the renderer (e.g. WebGL context loss).
  const [mountKey, setMountKey] = useState(0);

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
    recentEventsRef.current = recentEvents;
  }, [recentEvents]);

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
    const particles: Particle[] = [];
    const shake: ScreenShake = { amplitude: 0, remaining: 0, duration: 0 };
    const PARTICLE_CAP = 240;
    // Time-scale: hit-stop & slow-mo. 1.0 = normal speed. Decays back to 1.
    let timeScale = 1;
    let timeScaleTarget = 1;
    let hitStopRemaining = 0;
    // Boost FOV punch: brief zoom-out factor that decays
    let boostPunch = 0;
    // Active emotes: by playerId, with bornAt timestamp
    const activeEmotes = new Map<string, { glyph: string; bornAt: number }>();
    const EMOTE_GLYPHS: Record<string, string> = {
      wave: "👋", laugh: "😂", skull: "💀", fire: "🔥", heart: "❤️", shock: "😱"
    };
    // Mouth openness per player: triggered to 1.0 on a food pickup, decays toward 0.
    const mouthOpenness = new Map<string, number>();

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
        const initialSettings = loadSettings();
        app.ticker.maxFPS = initialSettings.fpsCap;
        app.ticker.minFPS = 30;

        app.ticker.add((ticker) => {
          // Wrap drawFrame in try/catch so a single bad frame doesn't silently kill the loop
          try {
            drawFrame(app, world, background, foodLayer, snakeLayer, labelLayer, vignette, camera, ticker.deltaMS / 1000);
            if (!pausedRef.current) sendAim(app, world, pointer, boosting);
            reportPerf(rendererName);
          } catch (err) {
            // eslint-disable-next-line no-console
            console.error("[PixiGame] frame error:", err);
          }
        });

        // WebGL context loss → trigger a remount so the renderer is rebuilt cleanly
        app.canvas.addEventListener("webglcontextlost", handleContextLost);
        app.canvas.addEventListener("webglcontextrestored", handleContextRestored);

        // Live-apply settings changes
        window.addEventListener("slithera-settings-change", onSettingsChange as EventListener);
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error("[PixiGame] init failed:", err);
      });

    const handleContextLost = (event: Event) => {
      event.preventDefault();
      // eslint-disable-next-line no-console
      console.warn("[PixiGame] WebGL context lost — scheduling remount");
      // Defer to next tick so the browser finishes the loss event
      window.setTimeout(() => {
        if (!destroyed) setMountKey((k) => k + 1);
      }, 50);
    };

    const handleContextRestored = () => {
      // eslint-disable-next-line no-console
      console.info("[PixiGame] WebGL context restored");
      // The remount triggered by lost handler will rebuild the renderer; nothing to do here.
    };

    const onSettingsChange = (event: Event) => {
      const detail = (event as CustomEvent<{ fpsCap: number }>).detail;
      if (detail && typeof detail.fpsCap === "number") {
        app.ticker.maxFPS = detail.fpsCap;
      }
    };

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

    function processNewEvents(): void {
      const events = recentEventsRef.current;
      if (!events) return;
      const state = snapshotRef.current;
      const myId = playerIdRef.current;
      let highWatermark = consumedEventAtRef.current;
      for (const entry of events) {
        if (entry.at <= consumedEventAtRef.current) continue;
        if (entry.at > highWatermark) highWatermark = entry.at;
        if (entry.event.type === "death") {
          const death = entry.event;
          const victim = state?.players.find((p) => p.id === death.id);
          if (!victim) continue;
          spawnDeathParticles(victim);
          if (death.id === myId) {
            triggerShake(0.42, 12);
            triggerSlowMo(0.35, 0.35);
          } else if (death.killerId === myId) {
            triggerShake(0.18, 6);
            triggerHitStop(0.09);
          }
        } else if (entry.event.type === "emote") {
          const glyph = EMOTE_GLYPHS[entry.event.emoteId] ?? "?";
          activeEmotes.set(entry.event.playerId, { glyph, bornAt: performance.now() });
        } else if (entry.event.type === "food") {
          // The pellet is already removed from the current snapshot; renderFood still
          // holds its previous position because smoothFood hasn't run yet this frame.
          const foodEvent = entry.event;
          const pellet = renderFood.get(foodEvent.id);
          if (!pellet) continue;
          const eater = state?.players.find((p) => p.id === foodEvent.playerId);
          const headX = eater?.segments[0]?.x ?? pellet.x;
          const headY = eater?.segments[0]?.y ?? pellet.y;
          const isLocal = foodEvent.playerId === myId;
          spawnEatBurst(pellet.x, pellet.y, headX, headY, parseHexColor(pellet.color), isLocal);
          // Open the eater's mouth (clamps to 1.0)
          mouthOpenness.set(foodEvent.playerId, 1);
        }
      }
      consumedEventAtRef.current = highWatermark;
    }

    function spawnEatBurst(px: number, py: number, headX: number, headY: number, color: number, isLocal: boolean): void {
      const burst = isLocal ? 8 : 4;
      for (let i = 0; i < burst; i += 1) {
        if (particles.length >= PARTICLE_CAP) break;
        // Velocity biased toward the eater's head: pellet "absorbs" inward
        const toHeadX = headX - px;
        const toHeadY = headY - py;
        const distToHead = Math.max(1, Math.hypot(toHeadX, toHeadY));
        const ux = toHeadX / distToHead;
        const uy = toHeadY / distToHead;
        // Some random sideways drift, but main thrust toward head
        const angle = Math.random() * Math.PI * 2;
        const sideways = 0.35;
        const speed = 220 + Math.random() * 180;
        particles.push({
          x: px,
          y: py,
          vx: (ux + Math.cos(angle) * sideways) * speed,
          vy: (uy + Math.sin(angle) * sideways) * speed,
          life: 1,
          decay: 3.0 + Math.random() * 1.0,  // fast fade
          size: 1.4 + Math.random() * 1.6,
          color
        });
      }
    }

    function triggerHitStop(seconds: number): void {
      hitStopRemaining = Math.max(hitStopRemaining, seconds);
    }

    function triggerSlowMo(durationSec: number, scale: number): void {
      timeScaleTarget = scale;
      window.setTimeout(() => { timeScaleTarget = 1; }, durationSec * 1000);
    }

    function spawnDeathParticles(victim: PlayerState): void {
      const baseColor = parseHexColor(victim.color);
      const accentColor = parseHexColor(victim.accent ?? victim.color);
      const sampleStep = Math.max(1, Math.floor(victim.segments.length / 14));
      for (let i = 0; i < victim.segments.length; i += sampleStep) {
        const seg = victim.segments[i];
        const burst = 4;
        for (let p = 0; p < burst; p += 1) {
          if (particles.length >= PARTICLE_CAP) break;
          const angle = Math.random() * Math.PI * 2;
          const speed = 90 + Math.random() * 220;
          particles.push({
            x: seg.x,
            y: seg.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            decay: 1.0 + Math.random() * 0.6,
            size: 2.5 + Math.random() * 3,
            color: p % 2 === 0 ? baseColor : accentColor
          });
        }
      }
    }

    function triggerShake(duration: number, amplitude: number): void {
      // If a stronger shake is already running, don't shorten it
      if (amplitude * (duration > 0 ? 1 : 0) > shake.amplitude * (shake.remaining / Math.max(0.001, shake.duration))) {
        shake.amplitude = amplitude;
        shake.remaining = duration;
        shake.duration = duration;
      }
    }

    function updateParticles(dt: number, snakes: Graphics): void {
      for (let i = particles.length - 1; i >= 0; i -= 1) {
        const p = particles[i];
        p.life -= p.decay * dt;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // gentle drag
        p.vx *= 1 - 1.4 * dt;
        p.vy *= 1 - 1.4 * dt;
        const alpha = Math.max(0, Math.min(1, p.life));
        snakes.circle(p.x, p.y, p.size * (0.6 + p.life * 0.4))
          .fill({ color: p.color, alpha: alpha * 0.85 });
      }
    }

    function drawFrame(
      pixi: Application,
      worldContainer: Container,
      bg: Graphics,
      food: Graphics,
      snakes: Graphics,
      labels: Container,
      overlay: Graphics,
      cam: CameraState,
      rawDt: number
    ) {
      processNewEvents();

      // Real-world dt for timers and the hit-stop / slow-mo state machine
      const wallDt = rawDt;
      // Hit-stop: completely freeze interpolation for `hitStopRemaining` seconds
      if (hitStopRemaining > 0) {
        hitStopRemaining = Math.max(0, hitStopRemaining - wallDt);
      }
      // Slow-mo: ease toward target scale, then back
      timeScale += (timeScaleTarget - timeScale) * (1 - Math.exp(-wallDt * 14));
      const effectiveScale = hitStopRemaining > 0 ? 0 : timeScale;
      const dt = rawDt * effectiveScale;
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
      // Camera: close when small (1.45x), far when large (~0.55x). Drives the slither.io perspective shift.
      const sizeT = Math.min(1, Math.max(0, (sizeScale - 1) / 1.6));
      const targetZoom = 1.4 - sizeT * 0.6;
      cam.zoom += (targetZoom - cam.zoom) * (1 - Math.exp(-wallDt * 3.8));
      // Boost FOV punch: while local player is boosting, push out 7%; relax otherwise.
      const punchTarget = me?.boosting ? 0.07 : 0;
      boostPunch += (punchTarget - boostPunch) * (1 - Math.exp(-wallDt * 8));
      const scale = baseScale * cam.zoom * (1 - boostPunch);

      // Apply screen shake (uses wall-clock so slow-mo doesn't elongate it)
      let shakeX = 0;
      let shakeY = 0;
      if (shake.remaining > 0) {
        shake.remaining = Math.max(0, shake.remaining - wallDt);
        const t = shake.remaining / Math.max(0.001, shake.duration);
        const intensity = shake.amplitude * t * t;
        shakeX = (Math.random() * 2 - 1) * intensity;
        shakeY = (Math.random() * 2 - 1) * intensity;
      }

      worldContainer.scale.set(scale);
      worldContainer.position.set(
        pixi.screen.width / 2 - cam.x * scale + shakeX,
        pixi.screen.height / 2 - cam.y * scale + shakeY
      );
      const view = worldViewBounds(pixi, worldContainer, 190);

      if (!arenaDrawn) {
        bg.clear();
        drawArena(bg);
        arenaDrawn = true;
      }
      food.clear();
      snakes.clear();
      // Destroy every label before removing — Text objects hold GPU textures that must be freed
      for (const child of labels.children) {
        child.destroy();
      }
      labels.removeChildren();

      if (state) {
        const tNow = performance.now() * 0.001;
        const meHead = me?.segments[0];
        for (const pellet of renderedFood) {
          if (!insideBounds(pellet, view)) continue;
          // Per-pellet phase derived from id hash so neighbouring pellets pulse out of sync
          const phase = pelletPhase(pellet.id);

          if (pellet.kind === "drop") {
            // ----- Snake-meat chunk: fleshy, irregular blob with darker core -----
            const pulse = 0.92 + Math.sin(tNow * 1.6 + phase) * 0.08;
            const baseColor = parseHexColor(pellet.color);
            const meatColor = darkenColor(baseColor, 0.62);
            const coreColor = darkenColor(baseColor, 0.30);
            // Three overlapping blobs with an irregular shape
            const r = 6.2 * pulse;
            const wobble = Math.sin(tNow * 3 + phase) * 0.7;
            food.circle(pellet.x + wobble, pellet.y - wobble * 0.6, r * 0.95).fill({ color: meatColor, alpha: 0.95 });
            food.circle(pellet.x - r * 0.32 + wobble * 0.4, pellet.y + r * 0.22, r * 0.72).fill({ color: meatColor, alpha: 0.95 });
            food.circle(pellet.x + r * 0.36, pellet.y + r * 0.18 - wobble * 0.3, r * 0.65).fill({ color: meatColor, alpha: 0.95 });
            // Dark core "wound" / cavity
            food.circle(pellet.x, pellet.y, r * 0.42).fill({ color: coreColor, alpha: 0.82 });
            // Bone-white marrow speck (asymmetric)
            food.circle(pellet.x - r * 0.18, pellet.y - r * 0.22, r * 0.16).fill({ color: 0xfff4d9, alpha: 0.42 });
            // Subtle dark outline
            food.circle(pellet.x, pellet.y, r * 1.05).stroke({ color: 0x12090a, alpha: 0.45, width: 0.9 });
          } else {
            // ----- Regular food pellet -----
            const pulse = 0.85 + Math.sin(tNow * 2.5 + phase) * 0.15;
            const radius = 5.2 * pulse;
            food.circle(pellet.x, pellet.y, radius * 1.6).fill({ color: pellet.color, alpha: 0.18 * pulse });
            food.circle(pellet.x, pellet.y, radius).fill({ color: pellet.color, alpha: 0.92 });
            food.circle(pellet.x - 1.8, pellet.y - 1.8, 1.6).fill({ color: 0xffffff, alpha: 0.62 });
          }

          // Magnet sparkle: only for regular pellets that the local player's about to vacuum up
          if (pellet.kind !== "drop" && meHead) {
            const dx = pellet.x - meHead.x;
            const dy = pellet.y - meHead.y;
            const distSq = dx * dx + dy * dy;
            if (distSq < 90 * 90) {
              const closeness = 1 - Math.sqrt(distSq) / 90;
              const radius = 5.2;
              food.circle(pellet.x, pellet.y, radius * (1.8 + Math.sin(tNow * 8 + phase) * 0.3))
                .stroke({ color: 0xffffff, alpha: 0.35 * closeness, width: 1 });
            }
          }
        }

        drawDeathEffects(snakes, deathEffects, dt, view);
        // Decay mouth openness every frame (uses wall-clock dt to be unaffected by slow-mo)
        for (const [pid, openness] of mouthOpenness) {
          const next = openness - wallDt * 4.5; // close in ~220ms
          if (next <= 0) mouthOpenness.delete(pid);
          else mouthOpenness.set(pid, next);
        }
        const sorted = [...renderedPlayers].sort((a, b) => a.segments.length - b.segments.length);
        for (const player of sorted) {
          updateRopeState(ropeStates, player, dt);
          drawSnake(snakes, labels, player, player.id === playerIdRef.current, view, ropeStates.get(player.id), mouthOpenness.get(player.id) ?? 0);
          // Boost trail: spawn streaks from a few rear segments while boosting
          if (player.boosting && player.alive && particles.length < PARTICLE_CAP - 20) {
            const trailColor = parseHexColor(player.color);
            for (let n = 0; n < 3; n += 1) {
              const idx = Math.floor(player.segments.length * (0.55 + Math.random() * 0.45));
              const seg = player.segments[Math.min(player.segments.length - 1, idx)];
              if (!seg) continue;
              const back = player.heading + Math.PI;
              const spread = (Math.random() - 0.5) * 0.6;
              const sp = 60 + Math.random() * 80;
              particles.push({
                x: seg.x, y: seg.y,
                vx: Math.cos(back + spread) * sp, vy: Math.sin(back + spread) * sp,
                life: 1, decay: 2.4 + Math.random() * 0.6,
                size: 2 + Math.random() * 2, color: trailColor
              });
            }
          }

          // Cosmetic trail system — per-player trailId
          if (player.trailId && player.trailId !== "none" && player.alive && particles.length < PARTICLE_CAP - 10) {
            spawnTrailParticles(player, particles, parseHexColor(player.color), parseHexColor(player.accent), PARTICLE_CAP);
          }
        }

        // Render floating emotes above each player's head
        const EMOTE_TTL_MS = 2200;
        const emotePruneAt = performance.now() - EMOTE_TTL_MS;
        for (const [pid, entry] of activeEmotes) {
          if (entry.bornAt < emotePruneAt) {
            activeEmotes.delete(pid);
            continue;
          }
          const player = renderedPlayers.find((p) => p.id === pid && p.alive);
          if (!player) continue;
          const head = player.segments[0];
          if (!head) continue;
          const age = (performance.now() - entry.bornAt) / EMOTE_TTL_MS;
          const lift = Math.min(58, age * 120);
          const alpha = age < 0.85 ? 1 : Math.max(0, 1 - (age - 0.85) / 0.15);
          const txt = new Text({
            text: entry.glyph,
            style: {
              fontFamily: "system-ui, 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif",
              fontSize: 36,
              fill: 0xffffff
            }
          });
          txt.anchor.set(0.5, 1);
          txt.position.set(head.x, head.y - 56 - lift);
          txt.alpha = alpha;
          labels.addChild(txt);
        }
      }

      // Particles render on top of snakes
      updateParticles(dt, snakes);

      overlay.clear();
      overlay.rect(0, 0, pixi.screen.width, pixi.screen.height).fill({ color: 0x02050a, alpha: 0.08 });

      // Wall warning: if local player's head is near a world edge, pulse a red border on screen
      if (me?.alive) {
        const head = me.segments[0];
        const WARN_DISTANCE = 240;
        const dLeft = head.x;
        const dRight = WORLD_WIDTH - head.x;
        const dTop = head.y;
        const dBottom = WORLD_HEIGHT - head.y;
        const minDist = Math.min(dLeft, dRight, dTop, dBottom);
        if (minDist < WARN_DISTANCE) {
          const proximity = 1 - minDist / WARN_DISTANCE; // 0..1
          const pulse = 0.6 + 0.4 * Math.sin(performance.now() * 0.012);
          const alpha = Math.min(1, proximity * proximity * pulse);
          const thickness = 14 + proximity * 24;
          // Bias the warning toward the closest side
          const w = pixi.screen.width;
          const h = pixi.screen.height;
          if (dLeft < WARN_DISTANCE)   overlay.rect(0, 0, thickness, h).fill({ color: 0xff4f43, alpha: alpha * 0.45 });
          if (dRight < WARN_DISTANCE)  overlay.rect(w - thickness, 0, thickness, h).fill({ color: 0xff4f43, alpha: alpha * 0.45 });
          if (dTop < WARN_DISTANCE)    overlay.rect(0, 0, w, thickness).fill({ color: 0xff4f43, alpha: alpha * 0.45 });
          if (dBottom < WARN_DISTANCE) overlay.rect(0, h - thickness, w, thickness).fill({ color: 0xff4f43, alpha: alpha * 0.45 });
        }
      }
    }

    function sendAim(pixi: Application, worldContainer: Container, aim: Vec2, boost: boolean) {
      const player = snapshotRef.current?.players.find((item) => item.id === playerIdRef.current);
      if (!player?.alive) return;
      const head = player.segments[0];
      const target = screenToWorld(pixi, worldContainer, aim);
      const heading = Math.atan2(target.y - head.y, target.x - head.x);
      const now = performance.now();
      // Hard cap to 30 Hz regardless of frame rate. At 240 FPS without this cap
      // we'd flood the server's 60 msg/sec rate-limit and trigger ping spikes.
      if (now - lastInputAt < 1000 / 30) return;
      const changedEnough = Math.abs(angleDelta(heading, lastHeading)) > 0.018 || boost !== lastBoosting;
      if (!changedEnough) return;
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
      window.removeEventListener("slithera-settings-change", onSettingsChange as EventListener);
      try {
        app.canvas?.removeEventListener("webglcontextlost", handleContextLost);
        app.canvas?.removeEventListener("webglcontextrestored", handleContextRestored);
      } catch { /* canvas may already be detached */ }
      try {
        app.destroy(true);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[PixiGame] destroy error:", err);
      }
    };
  }, [mountKey]);

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
    [710, 2320, 190, 0x21123f],
    // Additional atmospheric formations: smaller "shrines" + glow rings
    [2600, 800, 140, 0x1a4a2e],
    [1800, 1500, 110, 0x2a1a4a],
    [3700, 2400, 130, 0x4a2a1a],
    [2100, 2900, 95, 0x1a2a4a]
  ] as const;

  for (const [x, y, radius, color] of formations) {
    graphics.circle(x, y, radius).fill({ color, alpha: 0.18 });
    graphics.circle(x, y, radius * 0.34).fill({ color, alpha: 0.22 });
    graphics.circle(x + radius * 0.18, y - radius * 0.1, radius * 0.08).fill({ color: 0x22d8ff, alpha: 0.16 });
    graphics.circle(x - radius * 0.3, y + radius * 0.22, radius * 0.06).fill({ color: 0xffffff, alpha: 0.045 });
    // Decorative outer ring around bigger formations for depth
    if (radius >= 200) {
      graphics.circle(x, y, radius * 1.25).stroke({ color: 0x12d8ff, alpha: 0.06, width: 1 });
      graphics.circle(x, y, radius * 1.5).stroke({ color: 0x12d8ff, alpha: 0.03, width: 1 });
    }
  }

  // Corner markers — give the arena a sense of place at the bounds
  const cornerSize = 60;
  const corners: Array<[number, number, number, number]> = [
    [40, 40, 1, 1],
    [WORLD_WIDTH - 40, 40, -1, 1],
    [40, WORLD_HEIGHT - 40, 1, -1],
    [WORLD_WIDTH - 40, WORLD_HEIGHT - 40, -1, -1]
  ];
  for (const [x, y, dx, dy] of corners) {
    graphics
      .moveTo(x, y + cornerSize * dy)
      .lineTo(x, y)
      .lineTo(x + cornerSize * dx, y)
      .stroke({ color: 0xf0b540, alpha: 0.42, width: 2.5 });
  }

  // Cardinal compass marks at midpoints (atmosphere/orientation)
  const halfX = WORLD_WIDTH / 2;
  const halfY = WORLD_HEIGHT / 2;
  graphics.circle(halfX, 22, 5).fill({ color: 0xf0b540, alpha: 0.5 });
  graphics.circle(halfX, WORLD_HEIGHT - 22, 5).fill({ color: 0xf0b540, alpha: 0.5 });
  graphics.circle(22, halfY, 5).fill({ color: 0xf0b540, alpha: 0.5 });
  graphics.circle(WORLD_WIDTH - 22, halfY, 5).fill({ color: 0xf0b540, alpha: 0.5 });

  graphics.rect(18, 18, WORLD_WIDTH - 36, WORLD_HEIGHT - 36).stroke({ color: 0x12d8ff, alpha: 0.32, width: 3 });
}

function drawLotusPetal(g: Graphics, cx: number, cy: number, angle: number, length: number, width: number, color: number, alpha: number): void {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const pCos = Math.cos(angle + Math.PI / 2);
  const pSin = Math.sin(angle + Math.PI / 2);
  const steps = 14;
  const pts: number[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const r = width * Math.sin(t * Math.PI) * (1 - t * 0.25);
    const d = length * t;
    pts.push(cx + cos * d + pCos * r, cy + sin * d + pSin * r);
  }
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const r = width * Math.sin(t * Math.PI) * (1 - t * 0.25);
    const d = length * t;
    pts.push(cx + cos * d - pCos * r, cy + sin * d - pSin * r);
  }
  g.poly(pts).fill({ color, alpha });
}

const TRAIL_COLORS: Record<string, number[]> = {
  "sparkle":       [0xffffff, 0xffe566, 0xffd0ff],
  "shadow-trail":  [0x2a1a3a, 0x4a2a5a, 0x110a1a],
  "fire-trail":    [0xff4500, 0xff8800, 0xffee00],
  "ice-trail":     [0x88ddff, 0xccf4ff, 0xffffff],
  "rainbow-trail": [0xff4466, 0xffaa00, 0x44ff88, 0x4499ff, 0xcc44ff],
  "sakura-trail":  [0xffb7c5, 0xffd0dd, 0xff88a8, 0xfff0f3],
  "void-trail":    [0x330066, 0x220044, 0x8822cc],
  "gold-trail":    [0xd4a827, 0xffd24d, 0xffee99],
  "lightning-trail":[0xffffff, 0xccddff, 0x4499ff, 0x8888ff],
  "aurora-trail":  [0x00e5ff, 0x40ffcc, 0xe040fb, 0xff80ab],
};

function spawnTrailParticles(player: PlayerState, particles: Particle[], _baseColor: number, _accent: number, cap: number): void {
  const tid = player.trailId ?? "";
  const colors = TRAIL_COLORS[tid] ?? [_baseColor];
  const tailIdx = Math.min(player.segments.length - 1, Math.floor(player.segments.length * 0.7));
  const seg = player.segments[tailIdx];
  if (!seg) return;

  const back = player.heading + Math.PI;
  let count = 1, size = 1.8, decay = 2.5, speed = 40;
  let burst = false;

  switch (tid) {
    case "sparkle":       count = 2; size = 1.2; decay = 3.0; speed = 30; break;
    case "shadow-trail":  count = 2; size = 2.5; decay = 1.8; speed = 25; break;
    case "fire-trail":    count = 3; size = 2.2; decay = 2.2; speed = 55; burst = true; break;
    case "ice-trail":     count = 2; size = 1.8; decay = 2.0; speed = 20; break;
    case "rainbow-trail": count = 3; size = 2.0; decay = 2.4; speed = 35; break;
    case "sakura-trail":  count = 2; size = 2.5; decay = 1.5; speed = 18; break;
    case "void-trail":    count = 2; size = 3.0; decay = 1.6; speed = 15; break;
    case "gold-trail":    count = 2; size = 1.8; decay = 2.8; speed = 45; break;
    case "lightning-trail":count = 3; size = 1.4; decay = 3.5; speed = 80; burst = true; break;
    case "aurora-trail":  count = 3; size = 2.8; decay = 1.4; speed = 22; break;
  }

  for (let n = 0; n < count; n++) {
    if (particles.length >= cap) break;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const spread = burst
      ? (Math.random() - 0.5) * 2.0
      : (Math.random() - 0.5) * 0.8;
    const sp = speed * (0.6 + Math.random() * 0.8);
    // For sakura / void: float upward and sideways rather than backward
    const angle = tid === "sakura-trail"
      ? back - Math.PI / 2 + (Math.random() - 0.5) * 1.5
      : back + spread;
    particles.push({
      x: seg.x + (Math.random() - 0.5) * 6,
      y: seg.y + (Math.random() - 0.5) * 6,
      vx: Math.cos(angle) * sp,
      vy: Math.sin(angle) * sp - (tid === "sakura-trail" ? 15 : 0),
      life: 1,
      decay: decay + Math.random() * 0.5,
      size: size * (0.7 + Math.random() * 0.6),
      color
    });
  }
}

function drawSnake(graphics: Graphics, labels: Container, player: PlayerState, you: boolean, view: WorldBounds, rope: RopeState | undefined, mouthOpen: number): void {
  if (!player.alive || player.segments.length === 0) return;
  const color = Number.parseInt(player.color.slice(1), 16);
  const accent = Number.parseInt(player.accent.slice(1), 16);
  const growth = snakeSizeScale(player);
  const displaySegments = segmentsWithGrowingTail(player);
  const segCount = displaySegments.length;
  const bodyRadius = 14 * growth;

  // Parse a darker shadow tone derived from the main color (10% of luminance)
  const shadow = darkenColor(color, 0.45);

  const isRainbow = player.skinId === "rainbow";
  const isLotus = player.skinId === "lotus";
  const now = performance.now();
  const rainbowOffset = isRainbow ? (now * 0.0006) : 0;

  // Build per-segment path with micro-wave wiggle + smooth exponential tail taper
  type PathNode = { x: number; y: number; r: number };
  const path: PathNode[] = new Array(segCount);
  // Tail taper: last 12 segments shrink exponentially (faster near tip)
  const taperStart = Math.max(0, segCount - 12);
  for (let i = 0; i < segCount; i += 1) {
    const seg = displaySegments[i];
    let px = seg.x;
    let py = seg.y;
    // Micro-wave: perpendicular sin offset gives the snake a "swimming" feel
    if (i > 0 && i < segCount - 1) {
      const prev = displaySegments[i - 1];
      const next = displaySegments[i + 1];
      const dx = next.x - prev.x;
      const dy = next.y - prev.y;
      const len = Math.hypot(dx, dy) || 1;
      const wxn = -dy / len;
      const wyn = dx / len;
      // Phase travels along the body as time advances → undulating sine
      const wave = Math.sin(i * 0.42 - now * 0.0048) * 1.6 * growth;
      px += wxn * wave;
      py += wyn * wave;
    }
    let r = bodyRadius;
    if (i >= taperStart) {
      const t = (i - taperStart) / 12;
      r = bodyRadius * (1 - t * t * 0.78); // ~22% radius at tip
    }
    path[i] = { x: px, y: py, r };
  }

  // Precomputed hue LUT for rainbow snakes — one per bead index, computed once per frame
  let rainbowLut: Array<{ color: number; accent: number; shadow: number }> | null = null;
  if (isRainbow) {
    const totalBeads = segCount;
    rainbowLut = new Array(totalBeads);
    for (let n = 0; n < totalBeads; n += 1) {
      const hue = ((n * 28) + rainbowOffset * 360) % 360;
      rainbowLut[n] = {
        color: hslToHex(hue, 80, 60),
        accent: hslToHex(hue, 100, 82),
        shadow: hslToHex(hue, 80, 28)
      };
    }
  }

  // Lotus: dual-wave thin-film interference — holographic violet ↔ rose ↔ magenta
  let lotusLut: Array<{ color: number; accent: number; shadow: number; hue: number }> | null = null;
  if (isLotus) {
    const t = now * 0.00035;
    lotusLut = new Array(segCount);
    for (let n = 0; n < segCount; n += 1) {
      const phase = (t + n * 0.18) % 1;
      const w1 = Math.sin(phase * Math.PI * 2);
      const w2 = Math.sin(phase * Math.PI * 2 * 1.618 + 0.5); // golden ratio second wave
      const hue = ((290 + w1 * 45 + w2 * 18) % 360 + 360) % 360;
      const sat = 82 + w2 * 12;
      const light = 55 + w1 * 14 + w2 * 8;
      lotusLut[n] = {
        hue,
        color: hslToHex(hue, sat, light),
        accent: hslToHex((hue + 30) % 360, 100, 88),
        shadow: hslToHex(((hue - 20) % 360 + 360) % 360, 65, 22)
      };
    }
  }

  // ----- 3. Body fill: per-segment strokes so rainbow/lotus per-bead colors still work -----
  // For solid skins one big stroke is cheaper, but the per-segment approach handles taper too.
  for (let i = segCount - 1; i >= 1; i -= 1) {
    const a = path[i];
    const b = path[i - 1];
    if (!insideBounds(a, view) && !insideBounds(b, view)) continue;
    let segColor = color;
    if (isRainbow && rainbowLut) segColor = rainbowLut[i].color;
    else if (isLotus && lotusLut) segColor = lotusLut[i].color;
    const w = a.r + b.r;
    graphics.moveTo(a.x, a.y).lineTo(b.x, b.y).stroke({
      color: segColor,
      width: w,
      cap: "round",
      join: "round"
    });
  }

  // ----- 4. Scale detail: every 4th segment, a small accent ring on top -----
  // Skipped for lotus — the prismatic shimmer below provides surface texture and these dots
  // would add visible "bead" highlights that break the smooth tube look.
  if (!isLotus) {
    for (let i = 4; i < segCount - 2; i += 4) {
      const node = path[i];
      if (!insideBounds(node, view)) continue;
      let segAccent = accent;
      if (isRainbow && rainbowLut) segAccent = rainbowLut[i].accent;
      graphics.circle(node.x, node.y, node.r * 0.34).fill({ color: segAccent, alpha: 0.22 });
    }
  }

  // ----- 5. Specular streak: animated highlight that travels head→tail -----
  // The streak is a 5-segment fade that shifts position over time.
  const streakSpeed = 0.00045; // segments per ms
  const streakHead = (now * streakSpeed) % segCount;
  for (let k = 0; k < 5; k += 1) {
    const idx = Math.floor(streakHead) - k;
    if (idx < 1 || idx >= segCount) continue;
    const node = path[idx];
    if (!insideBounds(node, view)) continue;
    const fade = 1 - k / 5;
    graphics.circle(node.x - node.r * 0.18, node.y - node.r * 0.32, node.r * 0.45)
      .fill({ color: 0xffffff, alpha: 0.14 * fade });
  }

  // ----- 6. Lotus prismatic shimmer: SINGLE polyline (no per-segment cap stacking → no circles) -----
  if (isLotus && lotusLut) {
    // Use a centre-of-body hue to drive the shimmer — color animates because lotusLut shifts every frame
    const midLut = lotusLut[Math.floor(segCount / 2)];
    const edgeColor = hslToHex(((midLut.hue + 70) % 360 + 360) % 360, 90, 82);
    graphics.moveTo(path[segCount - 1].x, path[segCount - 1].y);
    for (let i = segCount - 2; i >= 0; i -= 1) {
      graphics.lineTo(path[i].x, path[i].y);
    }
    graphics.stroke({
      color: edgeColor,
      alpha: 0.28,
      width: bodyRadius * 0.9,
      cap: "round",
      join: "round"
    });

    // Boost: single white polyline pulse along the body's centreline
    if (player.boosting) {
      const pulse = 0.5 + 0.5 * Math.sin(now * 0.018);
      graphics.moveTo(path[segCount - 1].x, path[segCount - 1].y);
      for (let i = segCount - 2; i >= 0; i -= 1) {
        graphics.lineTo(path[i].x, path[i].y);
      }
      graphics.stroke({
        color: 0xffffff,
        alpha: pulse * 0.32,
        width: bodyRadius * 1.4,
        cap: "round",
        join: "round"
      });
    }
  }

  // Head
  const head = displaySegments[0];
  if (!insideBounds(head, view)) return;
  const headRadius = 16 * growth;
  let headColor = color;
  let headAccent = accent;
  let headShadow = shadow;
  if (isRainbow && rainbowLut) {
    const lut = rainbowLut[0];
    headColor = lut.color;
    headAccent = lut.accent;
    headShadow = lut.shadow;
  } else if (isLotus && lotusLut) {
    const lut = lotusLut[0];
    headColor = lut.color;
    headAccent = lut.accent;
    headShadow = lut.shadow;
  }
  // --- Lotus flower: draw petals BEFORE head circle so head sits above them ---
  if (isLotus && lotusLut) {
    const lut0 = lotusLut[0];
    const spinOuter = (now * 0.00038) % (Math.PI * 2);
    const spinInner = (now * 0.00055) % (Math.PI * 2);

    // 8 outer petals — full teardrop polygons with vein highlight
    for (let p = 0; p < 8; p += 1) {
      const angle = (p / 8) * Math.PI * 2 + spinOuter;
      const pHue = ((lut0.hue + p * 22) % 360 + 360) % 360;
      const pLight = 60 + Math.sin(now * 0.0009 + p * 0.85) * 12;
      drawLotusPetal(graphics, head.x, head.y, angle, headRadius * 1.9, headRadius * 0.64, hslToHex(pHue, 80, pLight), 0.80);
      // vein
      drawLotusPetal(graphics, head.x, head.y, angle, headRadius * 1.7, headRadius * 0.14, hslToHex((pHue + 28) % 360, 95, 87), 0.60);
    }

    // 8 inner petals (offset π/8)
    for (let p = 0; p < 8; p += 1) {
      const angle = (p / 8) * Math.PI * 2 + spinInner + Math.PI / 8;
      const pHue = ((lut0.hue + p * 22 + 45) % 360 + 360) % 360;
      const pLight = 65 + Math.sin(now * 0.0011 + p * 0.9) * 10;
      drawLotusPetal(graphics, head.x, head.y, angle, headRadius * 1.28, headRadius * 0.44, hslToHex(pHue, 85, pLight), 0.90);
    }
  }

  // Head base: shadow ring + main fill + small forward "snout" bulge for directional shape
  const fwdX = Math.cos(player.heading);
  const fwdY = Math.sin(player.heading);
  // Snout is a smaller circle in front, blended with the head — gives a teardrop silhouette
  graphics.circle(head.x + fwdX * headRadius * 0.55, head.y + fwdY * headRadius * 0.55, headRadius * 0.7).fill({ color: headShadow, alpha: 1 });
  graphics.circle(head.x, head.y, headRadius).fill({ color: headShadow, alpha: 1 });
  graphics.circle(head.x + fwdX * headRadius * 0.55, head.y + fwdY * headRadius * 0.55, headRadius * 0.62).fill({ color: headColor, alpha: 1 });
  graphics.circle(head.x, head.y, headRadius * 0.92).fill({ color: headColor, alpha: 1 });

  // Lotus center: stigma jewel, stamen ring, and sheen — replaces generic highlight
  if (isLotus && lotusLut) {
    const lut0 = lotusLut[0];
    const stigmaColor = hslToHex((lut0.hue + 60) % 360, 90, 80);
    const spinStamen = (now * 0.00072) % (Math.PI * 2);
    // 6 stamen dots in a ring around the head center
    for (let s = 0; s < 6; s += 1) {
      const sa = (s / 6) * Math.PI * 2 + spinStamen;
      const stamHue = ((lut0.hue + s * 30) % 360 + 360) % 360;
      graphics.circle(
        head.x + Math.cos(sa) * headRadius * 0.62,
        head.y + Math.sin(sa) * headRadius * 0.62,
        headRadius * 0.13
      ).fill({ color: hslToHex(stamHue, 95, 84), alpha: 1 });
    }
    // Stigma jewel layers
    graphics.circle(head.x, head.y, headRadius * 0.44).fill({ color: hslToHex((lut0.hue + 30) % 360, 80, 42), alpha: 1 });
    graphics.circle(head.x, head.y, headRadius * 0.30).fill({ color: stigmaColor, alpha: 1 });
    graphics.circle(head.x, head.y, headRadius * 0.17).fill({ color: 0xfce7f3, alpha: 1 });
    graphics.circle(head.x, head.y, headRadius * 0.09).fill({ color: 0xffffff, alpha: 0.95 });
  } else {
    graphics.circle(head.x - headRadius * 0.32, head.y - headRadius * 0.36, headRadius * 0.36).fill({ color: headAccent, alpha: 0.4 });
  }

  // Mouth: drawn between the eyes and the snout tip. Closed = thin dark line. Open = dark cavity.
  // Drawing BEFORE the eyes so the eyes sit on top. Lotus has it too — just pushed slightly forward
  // so it's not buried under the petals.
  {
    const mouthForward = isLotus ? 1.05 : 1.0;
    const mouthCx = head.x + fwdX * headRadius * mouthForward;
    const mouthCy = head.y + fwdY * headRadius * mouthForward;
    const mouthSideX = -fwdY;
    const mouthSideY = fwdX;
    if (mouthOpen > 0.02) {
      // Open mouth: dark elliptical cavity that grows + stretches along snout axis
      const t = mouthOpen; // 0..1
      const mw = headRadius * (0.18 + t * 0.45);
      const mh = headRadius * (0.04 + t * 0.36);
      graphics.ellipse(mouthCx, mouthCy, mw, mh).fill({ color: 0x12090a, alpha: 0.95 });
      graphics.ellipse(mouthCx, mouthCy, mw * 0.7, mh * 0.65).fill({ color: 0x6b1a1f, alpha: 0.7 * t });
      graphics.moveTo(mouthCx + mouthSideX * mw * 0.9, mouthCy + mouthSideY * mw * 0.9)
        .lineTo(mouthCx - mouthSideX * mw * 0.9, mouthCy - mouthSideY * mw * 0.9)
        .stroke({ color: 0xfff4d9, alpha: 0.35 * t, width: 1 });
    } else {
      // Closed mouth: thin dark line perpendicular to heading at the snout tip
      const lineHalf = headRadius * 0.32;
      graphics
        .moveTo(mouthCx + mouthSideX * lineHalf, mouthCy + mouthSideY * lineHalf)
        .lineTo(mouthCx - mouthSideX * lineHalf, mouthCy - mouthSideY * lineHalf)
        .stroke({ color: 0x12090a, alpha: 0.65, width: 1.2 });
    }
  }

  // Eyes — multi-layer (sclera + iris + pupil + sparkle), pupils TRACK the aim direction
  const eyeSideX = Math.cos(player.heading + Math.PI / 2);
  const eyeSideY = Math.sin(player.heading + Math.PI / 2);
  const eyeForwardOffset = 8 * growth;
  const eyeSideOffset = 6 * growth;
  const scleraR = 4.2 * growth;
  const irisR = 3.0 * growth;
  const pupilR = 1.7 * growth;
  const sparkleR = 0.9 * growth;
  // Pupil tracking: look toward where we're aiming (mouse / targetHeading), not just current heading.
  // Computed as offset within the iris based on the angle between aim and current heading.
  const aimX = Math.cos(player.targetHeading);
  const aimY = Math.sin(player.targetHeading);
  // Project aim direction onto eye-local axes (forward + right)
  const rightX = -fwdY;
  const rightY = fwdX;
  const aimForward = aimX * fwdX + aimY * fwdY;       // -1..1, how forward we look
  const aimSideways = aimX * rightX + aimY * rightY;   // -1..1, how much sideways
  // Pupil offset within iris: small forward bias + sideways tracking
  const pupilTravel = 1.6 * growth; // max pixels the pupil can shift inside the iris
  const pupilOffsetForward = (0.5 + aimForward * 0.5) * pupilTravel; // 0..max forward when aiming forward, 0 when looking back
  const pupilOffsetSideways = aimSideways * pupilTravel;
  for (const side of [-1, 1] as const) {
    const ex = head.x + fwdX * eyeForwardOffset + eyeSideX * eyeSideOffset * side;
    const ey = head.y + fwdY * eyeForwardOffset + eyeSideY * eyeSideOffset * side;
    // Sclera: warm cream rather than pure white — matches palette
    graphics.circle(ex, ey, scleraR).fill({ color: 0xfff4d9, alpha: 1 });
    graphics.circle(ex, ey, scleraR).stroke({ color: 0x12090a, alpha: 0.55, width: 0.8 });
    // Iris: dark teal/plum ring
    const irisX = ex + fwdX * 0.4 * growth;
    const irisY = ey + fwdY * 0.4 * growth;
    graphics.circle(irisX, irisY, irisR).fill({ color: 0x1d2030, alpha: 1 });
    // Pupil: tracks aim direction (cursor for human, target for bot)
    const pupilX = irisX + fwdX * pupilOffsetForward + rightX * pupilOffsetSideways;
    const pupilY = irisY + fwdY * pupilOffsetForward + rightY * pupilOffsetSideways;
    graphics.circle(pupilX, pupilY, pupilR).fill({ color: 0x000000, alpha: 1 });
    // Sparkle: tiny highlight up-left of pupil (offset opposite of aim for catch-light feel)
    graphics.circle(pupilX - rightX * 0.6 * growth - fwdX * 0.3 * growth, pupilY - rightY * 0.6 * growth - fwdY * 0.3 * growth, sparkleR)
      .fill({ color: 0xffffff, alpha: 1 });
  }

  // Hat (drawn procedurally via hatRenderer — no emoji Text objects)
  let hatHeightPx = 0;
  if (player.hatId && player.hatId !== "none") {
    const hatR = 11 * growth;
    const hatOffset = headRadius * 1.1;
    const hatCY = head.y - hatOffset - hatR;
    drawHat(graphics, player.hatId, head.x, hatCY, hatR);
    hatHeightPx = hatHeight(player.hatId, hatR) + hatOffset * 0.3;
  }

  if (rope && player.ropeAccessoryId && player.ropeAccessoryId !== "none") {
    const attachX = head.x - Math.cos(player.heading) * 18;
    const attachY = head.y - Math.sin(player.heading) * 18;
    graphics.moveTo(attachX, attachY).lineTo(rope.x, rope.y).stroke({ color: 0xc8dce8, alpha: 0.5, width: 1.8 });
    if (player.ropeAccessoryId === "venus") {
      const venusText = new Text({
        text: "Venüs",
        style: {
          fontFamily: "Fraunces, serif",
          fontSize: 15,
          fontStyle: "italic",
          fontWeight: "700",
          fill: 0xfce7f3,
          stroke: { color: 0x4c1d3a, width: 3 },
          dropShadow: { color: 0xf472b6, alpha: 0.55, blur: 6, distance: 0, angle: 0 }
        }
      });
      venusText.anchor.set(0.5, 0.5);
      venusText.position.set(rope.x, rope.y);
      labels.addChild(venusText);
    } else {
      drawRopeAccessory(graphics, player.ropeAccessoryId, rope.x, rope.y, accent);
    }
  }

  // Label — sits above the hat (or directly above head if no hat)
  const labelText = new Text({
    text: player.name,
    style: {
      fill: you ? "#f0b540" : "#f5e9d3",
      fontFamily: "Outfit, system-ui, sans-serif",
      fontSize: 13,
      fontWeight: you ? "800" : "600",
      stroke: { color: 0x0e0a06, width: 3 }
    }
  });
  labelText.anchor.set(0.5, 1);
  const baseLabelOffset = headRadius + 14;
  const labelY = head.y - baseLabelOffset - hatHeightPx;
  labelText.position.set(head.x, labelY);
  labels.addChild(labelText);

  if (player.isDev) {
    const devLabel = new Text({
      text: "DEV",
      style: {
        fill: "#ff3b30",
        fontFamily: "Outfit, system-ui, sans-serif",
        fontSize: 10,
        fontWeight: "900",
        stroke: { color: 0x0e0a06, width: 2 }
      }
    });
    devLabel.anchor.set(1, 1);
    devLabel.position.set(head.x - labelText.width / 2 - 5, labelY);
    labels.addChild(devLabel);
  }
}

function segmentsWithGrowingTail(player: PlayerState): Vec2[] {
  const progress = visualSegmentProgress(player);
  if (progress <= 0.001) return player.segments;
  const tail = extendRenderedTail(player.segments, SEGMENT_SPACING * Math.min(0.98, progress), player.heading);
  return [...player.segments, tail];
}

function visualSegmentProgress(player: PlayerState): number {
  const rendered = player as Partial<RenderedPlayer>;
  return typeof rendered.visualSegmentProgress === "number" ? rendered.visualSegmentProgress : player.segmentProgress;
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


function snakeSizeScale(player: PlayerState): number {
  const progress = Math.max(0, player.segments.length - START_LENGTH) / Math.max(1, MAX_SEGMENTS - START_LENGTH);
  const eased = 1 - Math.pow(1 - Math.min(1, progress), 1.6);
  return 1.0 + eased * 1.6;
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

function pelletPhase(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return (hash % 6283) / 1000; // 0..6.28 (≈ 2π)
}

function detectRenderer(renderer: unknown): string {
  const candidate = renderer as { type?: unknown; name?: unknown };
  if (typeof candidate.name === "string") return candidate.name;
  if (typeof candidate.type === "string") return candidate.type;
  if (typeof candidate.type === "number") return candidate.type === 1 ? "webgl" : `renderer-${candidate.type}`;
  return "webgl";
}


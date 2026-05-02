import {
  BASE_SPEED,
  BODY_RADIUS,
  BOOST_SHRINK_SCORE_PER_SECOND,
  BOOST_SPEED,
  BOT_NAMES,
  FOOD_ATTRACT_RADIUS,
  FOOD_ATTRACT_SPEED,
  FOOD_DRIFT_SPEED,
  FOOD_RADIUS,
  FOOD_SCORE,
  HEAD_RADIUS,
  MAX_FOOD_AFTER_DROPS,
  MAX_FOOD,
  MAX_SEGMENTS,
  MIN_ACTIVE_SNAKES,
  MIN_SCORE,
  PLAYER_COLORS,
  RESPAWN_DELAY_MS,
  SCORE_PER_SEGMENT,
  SEGMENT_SPACING,
  SNAKE_SKINS,
  START_LENGTH,
  TAIL_GROW_SEGMENTS_PER_SECOND,
  TAIL_SHRINK_SEGMENTS_PER_SECOND,
  TURN_RATE,
  WORLD_HEIGHT,
  WORLD_WIDTH
} from "./constants.js";
import { clamp, clampToWorld, distance, distanceSq, headingToVector, randomPoint, rotateToward, seededRandom } from "./math.js";
import type { ClientInput, FoodPellet, GameEvent, LeaderboardEntry, PlayerState, ServerSnapshot, Vec2 } from "./types.js";

export type World = {
  tick: number;
  rng: () => number;
  players: Map<string, PlayerState>;
  food: Map<string, FoodPellet>;
  botInputs: Map<string, ClientInput>;
  events: GameEvent[];
};

let entityCounter = 0;

export function createWorld(seed = 1337): World {
  const world: World = {
    tick: 0,
    rng: seededRandom(seed),
    players: new Map(),
    food: new Map(),
    botInputs: new Map(),
    events: []
  };

  ensureFood(world);
  ensureBots(world);
  return world;
}

export function createPlayer(world: World, id: string, name: string, bot = false, skinId?: string, ropeAccessoryId?: string): PlayerState {
  const fallbackColor = PLAYER_COLORS[world.players.size % PLAYER_COLORS.length];
  const skin = SNAKE_SKINS.find((item) => item.id === skinId) ?? SNAKE_SKINS[world.players.size % SNAKE_SKINS.length];
  const spawn = randomPoint(world.rng);
  const heading = world.rng() * Math.PI * 2 - Math.PI;
  const player: PlayerState = {
    id,
    name: sanitizeName(name, bot ? "Bot" : "Player"),
    skinId: skin.id,
    color: skin.color || fallbackColor,
    accent: skin.accent,
    score: MIN_SCORE,
    boost: 100,
    alive: true,
    bot,
    boosting: false,
    speed: BASE_SPEED,
    heading,
    targetHeading: heading,
    segments: makeSegments(spawn, heading, START_LENGTH),
    segmentProgress: 0,
    kills: 0,
    ropeAccessoryId
  };

  world.players.set(id, player);
  world.events.push({ type: "joined", id, name: player.name });
  return player;
}

export function removePlayer(world: World, id: string): void {
  world.players.delete(id);
  world.botInputs.delete(id);
}

export function applyInput(world: World, id: string, input: ClientInput): void {
  const player = world.players.get(id);
  if (!player || !player.alive || player.bot) return;
  player.targetHeading = input.heading;
  world.botInputs.set(id, { heading: input.heading, boosting: input.boosting });
}

export function respawn(world: World, id: string, now = Date.now()): PlayerState | undefined {
  const player = world.players.get(id);
  if (!player) return undefined;
  if (player.alive) return player;
  if (player.deathAt && now - player.deathAt < RESPAWN_DELAY_MS) return undefined;

  const spawn = randomPoint(world.rng);
  const heading = world.rng() * Math.PI * 2 - Math.PI;
  player.score = MIN_SCORE;
  player.boost = 100;
  player.alive = true;
  player.boosting = false;
  player.speed = BASE_SPEED;
  player.heading = heading;
  player.targetHeading = heading;
  player.segments = makeSegments(spawn, heading, START_LENGTH);
  player.segmentProgress = 0;
  player.deathAt = undefined;
  world.events.push({ type: "respawned", id });
  return player;
}

export function stepWorld(world: World, dt: number, now = Date.now()): GameEvent[] {
  world.tick += 1;
  world.events = [];
  ensureBots(world);
  ensureFood(world);

  for (const player of world.players.values()) {
    if (!player.alive) {
      if (player.bot) respawn(world, player.id, now);
      continue;
    }

    const input = player.bot ? updateBotInput(world, player) : world.botInputs.get(player.id);
    if (input) {
      player.targetHeading = input.heading;
    }

    const boosting = Boolean(input?.boosting);
    player.boosting = boosting;
    player.speed = boosting ? BOOST_SPEED : BASE_SPEED;
    player.boost = 100;
    if (boosting) {
      player.score = Math.max(MIN_SCORE, player.score - BOOST_SHRINK_SCORE_PER_SECOND * dt);
    }

    player.heading = rotateToward(player.heading, player.targetHeading, effectiveTurnRate(player) * dt);
    const direction = headingToVector(player.heading);
    const head = player.segments[0];
    const nextHead = clampToWorld({ x: head.x + direction.x * player.speed * dt, y: head.y + direction.y * player.speed * dt });

    player.segments = sampleTrail([nextHead, ...player.segments], nextSegmentCount(player, dt), player.heading);
  }

  updateFood(world, dt);
  for (const player of world.players.values()) {
    if (player.alive) collectFood(world, player);
  }
  resolveCollisions(world, now);
  return [...world.events];
}

export function makeSnapshot(world: World, localId?: string): ServerSnapshot {
  return {
    type: "snapshot",
    tick: world.tick,
    serverTime: Date.now(),
    players: [...world.players.values()].map((player) => ({
      ...player,
      score: Math.floor(player.score),
      segments: player.segments.map((segment) => ({ ...segment }))
    })),
    food: [...world.food.values()].map((pellet) => ({ ...pellet })),
    leaderboard: makeLeaderboard(world, localId)
  };
}

export function makeLeaderboard(world: World, localId?: string): LeaderboardEntry[] {
  return [...world.players.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((player) => ({
      id: player.id,
      name: player.name,
      score: Math.floor(player.score),
      color: player.color,
      you: player.id === localId
    }));
}

export function desiredSegmentCount(score: number): number {
  return Math.min(MAX_SEGMENTS, Math.max(START_LENGTH, START_LENGTH + Math.floor(Math.max(0, score - MIN_SCORE) / SCORE_PER_SEGMENT)));
}

export function makeSegments(head: Vec2, heading: number, count: number): Vec2[] {
  const reverse = heading + Math.PI;
  const dir = headingToVector(reverse);
  return Array.from({ length: count }, (_, index) => ({
    x: head.x + dir.x * SEGMENT_SPACING * index,
    y: head.y + dir.y * SEGMENT_SPACING * index
  }));
}

function sampleTrail(points: Vec2[], desiredCount: number, heading: number): Vec2[] {
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
      samples.push(extendTail(points, targetDistance - travelled, heading));
    }
  }

  return samples;
}

function extendTail(points: Vec2[], extraDistance: number, heading: number): Vec2 {
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

function nextSegmentCount(player: PlayerState, dt: number): number {
  const current = player.segments.length;
  const desired = desiredSegmentCount(player.score);
  if (current === desired) {
    player.segmentProgress = 0;
    return current;
  }

  const direction = desired > current ? 1 : -1;
  const rate = direction > 0 ? TAIL_GROW_SEGMENTS_PER_SECOND : TAIL_SHRINK_SEGMENTS_PER_SECOND;
  player.segmentProgress += rate * dt;
  const steps = Math.min(Math.abs(desired - current), Math.floor(player.segmentProgress));
  if (steps <= 0) return current;

  player.segmentProgress -= steps;
  return current + direction * steps;
}

function effectiveTurnRate(player: PlayerState): number {
  const lengthProgress = Math.min(1, Math.max(0, player.segments.length - START_LENGTH) / Math.max(1, MAX_SEGMENTS - START_LENGTH));
  const speedPenalty = player.boosting ? 0.86 : 1;
  return TURN_RATE * speedPenalty * (1 - lengthProgress * 0.38);
}

function collectFood(world: World, player: PlayerState): void {
  const head = player.segments[0];
  for (const pellet of world.food.values()) {
    if (distanceSq(head, pellet) < (HEAD_RADIUS + FOOD_RADIUS + 10) ** 2) {
      player.score = Math.floor(player.score + pellet.value);
      world.food.delete(pellet.id);
      world.events.push({ type: "food", id: pellet.id, playerId: player.id, value: pellet.value });
      if (world.food.size < MAX_FOOD) spawnFood(world, 1);
    }
  }
}

function updateFood(world: World, dt: number): void {
  for (const pellet of world.food.values()) {
    let nearestHead: Vec2 | undefined;
    let nearestSq = FOOD_ATTRACT_RADIUS ** 2;

    for (const player of world.players.values()) {
      if (!player.alive) continue;
      const head = player.segments[0];
      const dSq = distanceSq(pellet, head);
      if (dSq < nearestSq) {
        nearestSq = dSq;
        nearestHead = head;
      }
    }

    if (nearestHead) {
      const d = Math.max(0.001, Math.sqrt(nearestSq));
      const pull = 1 - d / FOOD_ATTRACT_RADIUS;
      const speed = FOOD_DRIFT_SPEED + FOOD_ATTRACT_SPEED * pull * pull;
      pellet.x += ((nearestHead.x - pellet.x) / d) * Math.min(d, speed * dt);
      pellet.y += ((nearestHead.y - pellet.y) / d) * Math.min(d, speed * dt);
      continue;
    }

    pellet.driftAngle += Math.sin(world.tick * 0.018 + pellet.x * 0.002 + pellet.y * 0.001) * 0.018;
    pellet.x += Math.cos(pellet.driftAngle) * pellet.driftSpeed * dt;
    pellet.y += Math.sin(pellet.driftAngle) * pellet.driftSpeed * dt;

    if (pellet.x < 45 || pellet.x > WORLD_WIDTH - 45) {
      pellet.x = clamp(pellet.x, 45, WORLD_WIDTH - 45);
      pellet.driftAngle = Math.PI - pellet.driftAngle;
    }
    if (pellet.y < 45 || pellet.y > WORLD_HEIGHT - 45) {
      pellet.y = clamp(pellet.y, 45, WORLD_HEIGHT - 45);
      pellet.driftAngle = -pellet.driftAngle;
    }
  }
}

function resolveCollisions(world: World, now: number): void {
  for (const player of world.players.values()) {
    if (!player.alive) continue;
    const head = player.segments[0];

    if (head.x <= 25 || head.y <= 25 || head.x >= WORLD_WIDTH - 25 || head.y >= WORLD_HEIGHT - 25) {
      killPlayer(world, player, undefined, now);
      continue;
    }

    for (const rival of world.players.values()) {
      if (!rival.alive || rival.id === player.id) continue;
      for (let index = 6; index < rival.segments.length; index += 1) {
        if (distanceSq(head, rival.segments[index]) < (HEAD_RADIUS + BODY_RADIUS * 0.84) ** 2) {
          killPlayer(world, player, rival.id, now);
          rival.kills += 1;
          break;
        }
      }
      if (!player.alive) break;
    }
  }
}

function killPlayer(world: World, player: PlayerState, killerId: string | undefined, now: number): void {
  player.alive = false;
  player.deathAt = now;
  world.events.push({ type: "death", id: player.id, killerId });

  const dropSegments = player.segments.filter((_, index) => index % 2 === 0);
  const availableDrops = Math.max(0, MAX_FOOD_AFTER_DROPS - world.food.size);
  const dropCount = Math.min(dropSegments.length, availableDrops);
  const dropValue = Math.max(1, Math.floor(Math.floor(player.score) / Math.max(1, dropCount)));

  for (let index = 0; index < dropCount; index += 1) {
    const segment = dropSegments[index];
    const id = nextId("drop");
    world.food.set(id, {
      id,
      x: segment.x,
      y: segment.y,
      color: player.color,
      value: dropValue,
      driftAngle: world.rng() * Math.PI * 2,
      driftSpeed: FOOD_DRIFT_SPEED * (0.6 + world.rng() * 0.8)
    });
  }
}

function ensureFood(world: World): void {
  if (world.food.size < MAX_FOOD) spawnFood(world, MAX_FOOD - world.food.size);
}

function spawnFood(world: World, count: number): void {
  const colors = ["#22d8ff", "#b6ff45", "#ffd24d", "#ff4f93", "#af70ff", "#ff8b3d"];
  for (let i = 0; i < count; i += 1) {
    const point = randomPoint(world.rng, 80);
    const id = nextId("food");
    world.food.set(id, {
      id,
      x: point.x,
      y: point.y,
      color: colors[Math.floor(world.rng() * colors.length)],
      value: FOOD_SCORE,
      driftAngle: world.rng() * Math.PI * 2,
      driftSpeed: FOOD_DRIFT_SPEED * (0.65 + world.rng() * 0.9)
    });
  }
}

function ensureBots(world: World): void {
  const needed = Math.max(0, MIN_ACTIVE_SNAKES - world.players.size);
  for (let i = 0; i < needed; i += 1) {
    const name = BOT_NAMES[(world.players.size + i) % BOT_NAMES.length];
    createPlayer(world, nextId("bot"), name, true, SNAKE_SKINS[(world.players.size + i) % SNAKE_SKINS.length].id);
  }
}

function updateBotInput(world: World, player: PlayerState): ClientInput {
  const head = player.segments[0];
  let target: Vec2 | undefined;
  let nearest = Number.POSITIVE_INFINITY;

  for (const pellet of world.food.values()) {
    const d = distance(head, pellet);
    if (d < nearest) {
      nearest = d;
      target = pellet;
    }
  }

  const jitter = (world.rng() - 0.5) * 0.42;
  const heading = target ? Math.atan2(target.y - head.y, target.x - head.x) + jitter : player.heading + jitter;
  return { heading, boosting: nearest > 360 && player.segments.length > START_LENGTH + 8 && world.rng() > 0.62 };
}

function sanitizeName(name: string, fallback: string): string {
  const clean = name.replace(/[^\w\s-]/g, "").trim().slice(0, 16);
  return clean || fallback;
}

function nextId(prefix: string): string {
  entityCounter += 1;
  return `${prefix}_${entityCounter.toString(36)}`;
}

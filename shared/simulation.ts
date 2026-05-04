import {
  BASE_SPEED,
  BODY_RADIUS,
  BOOST_DRAIN_PER_SECOND,
  BOOST_MAX,
  BOOST_MIN_TO_START,
  BOOST_REFILL_PER_SECOND,
  BOOST_SHRINK_SCORE_PER_SECOND,
  BOOST_SPEED,
  BOT_NAMES,
  FOOD_ATTRACT_RADIUS,
  FOOD_ATTRACT_SPEED,
  FOOD_DRIFT_SPEED,
  FOOD_RADIUS,
  FOOD_SCORE,
  HEAD_RADIUS,
  MAX_ACTIVE_SNAKES,
  MAX_FOOD_AFTER_DROPS,
  MAX_FOOD,
  MAX_SEGMENTS,
  MIN_ACTIVE_SNAKES,
  MIN_SCORE,
  TARGET_BOTS_PER_HUMAN,
  PLAYER_COLORS,
  RESPAWN_DELAY_MS,
  ROPE_ACCESSORIES,
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
import { canUseCharmFor, canUseSkinFor } from "./exclusive.js";
import { sanitizePlayerName } from "./names.js";
import { clamp, clampToWorld, distance, distanceSq, headingToVector, randomPoint, rotateToward, seededRandom } from "./math.js";
import type { ClientInput, FoodPellet, GameEvent, LeaderboardEntry, PlayerState, ServerSnapshot, Vec2 } from "./types.js";

export type BotProfile = "hunter" | "grazer" | "coward" | "wall-hugger";

export type World = {
  tick: number;
  rng: () => number;
  players: Map<string, PlayerState>;
  food: Map<string, FoodPellet>;
  botInputs: Map<string, ClientInput>;
  botProfiles: Map<string, BotProfile>;
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
    botProfiles: new Map(),
    events: []
  };

  ensureFood(world);
  ensureBots(world);
  return world;
}

export function createPlayer(
  world: World,
  id: string,
  name: string,
  bot = false,
  skinId?: string,
  ropeAccessoryId?: string,
  hatId?: string,
  uid?: string
): PlayerState {
  const fallbackColor = PLAYER_COLORS[world.players.size % PLAYER_COLORS.length];
  // Server-authoritative skin/charm gating: ignore exclusive selections without proof of UID.
  const requestedSkin = skinId && canUseSkinFor(skinId, uid) ? skinId : undefined;
  const skin = SNAKE_SKINS.find((item) => item.id === requestedSkin) ?? SNAKE_SKINS[world.players.size % SNAKE_SKINS.length];
  const safeRope = ropeAccessoryId && canUseCharmFor(ropeAccessoryId, uid) && ROPE_ACCESSORIES.some((r) => r.id === ropeAccessoryId)
    ? ropeAccessoryId
    : undefined;
  const safeHat = hatId; // hats currently have no exclusivity table
  const spawn = randomPoint(world.rng);
  const heading = world.rng() * Math.PI * 2 - Math.PI;
  const player: PlayerState = {
    id,
    name: sanitizePlayerName(name, bot),
    skinId: skin.id,
    color: skin.color || fallbackColor,
    accent: skin.accent,
    score: MIN_SCORE,
    boost: BOOST_MAX,
    alive: true,
    bot,
    boosting: false,
    speed: BASE_SPEED,
    heading,
    targetHeading: heading,
    segments: makeSegments(spawn, heading, START_LENGTH),
    segmentProgress: 0,
    kills: 0,
    ropeAccessoryId: safeRope,
    hatId: safeHat
  };

  world.players.set(id, player);
  world.events.push({ type: "joined", id, name: player.name });
  return player;
}

export function removePlayer(world: World, id: string): void {
  world.players.delete(id);
  world.botInputs.delete(id);
  world.botProfiles.delete(id);
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
  player.boost = BOOST_MAX;
  player.alive = true;
  player.boosting = false;
  player.speed = BASE_SPEED;
  player.heading = heading;
  player.targetHeading = heading;
  player.segments = makeSegments(spawn, heading, START_LENGTH);
  player.segmentProgress = 0;
  player.deathAt = undefined;
  player.lastKillerId = undefined;
  player.lastKillerName = undefined;
  world.events.push({ type: "respawned", id });
  return player;
}

export function stepWorld(world: World, dt: number, now = Date.now()): GameEvent[] {
  world.tick += 1;
  world.events = [];
  ensureBots(world);
  ensureFood(world);

  const stepDt = Math.min(dt, 0.05);

  for (const player of world.players.values()) {
    if (!player.alive) {
      if (player.bot) respawn(world, player.id, now);
      continue;
    }

    const input = player.bot ? updateBotInput(world, player) : world.botInputs.get(player.id);
    if (input) {
      player.targetHeading = input.heading;
    }

    // Boost: requires meter > 0 to start, drains while held, refills when released.
    const wantsBoost = Boolean(input?.boosting);
    const canStartBoost = wantsBoost && (player.boosting ? player.boost > 0 : player.boost >= BOOST_MIN_TO_START);
    const boosting = canStartBoost;
    player.boosting = boosting;
    player.speed = boosting ? BOOST_SPEED : BASE_SPEED;
    if (boosting) {
      player.boost = Math.max(0, player.boost - BOOST_DRAIN_PER_SECOND * stepDt);
      player.score = Math.max(MIN_SCORE, player.score - BOOST_SHRINK_SCORE_PER_SECOND * stepDt);
    } else {
      player.boost = Math.min(BOOST_MAX, player.boost + BOOST_REFILL_PER_SECOND * stepDt);
    }

    player.heading = rotateToward(player.heading, player.targetHeading, effectiveTurnRate(player) * stepDt);
    const direction = headingToVector(player.heading);
    const head = player.segments[0];
    const nextHead = clampToWorld({ x: head.x + direction.x * player.speed * stepDt, y: head.y + direction.y * player.speed * stepDt });

    player.segments = sampleTrail([nextHead, ...player.segments], nextSegmentCount(player, stepDt), player.heading);
  }

  updateFood(world, stepDt);
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
      hatId: player.hatId,
      skinId: player.skinId,
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
  const growth = snakeSizeScale(player);
  const pickupRadius = HEAD_RADIUS * growth + FOOD_RADIUS + 10;
  const pickupRadiusSq = pickupRadius * pickupRadius;
  let eaten = 0;
  for (const pellet of world.food.values()) {
    if (distanceSq(head, pellet) < pickupRadiusSq) {
      player.score = Math.floor(player.score + pellet.value);
      world.food.delete(pellet.id);
      world.events.push({ type: "food", id: pellet.id, playerId: player.id, value: pellet.value });
      eaten += 1;
    }
  }
  // Spawn replacements after the loop so the iterator never sees new entries
  if (eaten > 0 && world.food.size < MAX_FOOD) {
    spawnFood(world, Math.min(eaten, MAX_FOOD - world.food.size));
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
  const wallVictims: PlayerState[] = [];
  const bodyVictims: { player: PlayerState; killer: PlayerState }[] = [];
  const COLLISION_LENIENCY = 1.06;

  for (const player of world.players.values()) {
    if (!player.alive) continue;
    const head = player.segments[0];
    const playerGrowth = snakeSizeScale(player);
    const wallMargin = 12 + HEAD_RADIUS * playerGrowth;

    if (head.x <= wallMargin || head.y <= wallMargin || head.x >= WORLD_WIDTH - wallMargin || head.y >= WORLD_HEIGHT - wallMargin) {
      wallVictims.push(player);
      continue;
    }

    // Self-collision is disabled — passing through your own body is allowed.
    for (const rival of world.players.values()) {
      if (!rival.alive || rival.id === player.id) continue;
      const rivalGrowth = snakeSizeScale(rival);
      const collisionRadius = (HEAD_RADIUS * playerGrowth + BODY_RADIUS * rivalGrowth) * COLLISION_LENIENCY;
      const collisionRadiusSq = collisionRadius * collisionRadius;
      for (let index = 0; index < rival.segments.length; index += 1) {
        if (distanceSq(head, rival.segments[index]) < collisionRadiusSq) {
          bodyVictims.push({ player, killer: rival });
          break;
        }
      }
    }
  }

  for (const player of wallVictims) {
    if (player.alive) killPlayer(world, player, undefined, now);
  }
  for (const { player, killer } of bodyVictims) {
    if (player.alive) {
      killPlayer(world, player, killer.id, now);
      killer.kills += 1;
    }
  }
}

function killPlayer(world: World, player: PlayerState, killerId: string | undefined, now: number): void {
  player.alive = false;
  player.deathAt = now;
  player.lastKillerId = killerId;
  player.lastKillerName = killerId ? world.players.get(killerId)?.name : undefined;
  world.events.push({ type: "death", id: player.id, killerId });

  const dropSegments = player.segments;
  const totalScore = Math.max(0, Math.floor(player.score));
  if (totalScore <= 0) return;

  const availableDrops = Math.max(0, MAX_FOOD_AFTER_DROPS - world.food.size);
  const dropCount = Math.min(dropSegments.length, availableDrops);
  if (dropCount <= 0) return;

  const baseValue = Math.floor(totalScore / dropCount);
  const remainder = totalScore - baseValue * dropCount;

  for (let index = 0; index < dropCount; index += 1) {
    const segment = dropSegments[index];
    const value = index < remainder ? baseValue + 1 : baseValue;
    if (value <= 0) continue;
    const id = nextId("drop");
    world.food.set(id, {
      id,
      x: segment.x,
      y: segment.y,
      color: player.color,
      value,
      driftAngle: world.rng() * Math.PI * 2,
      driftSpeed: FOOD_DRIFT_SPEED * (0.6 + world.rng() * 0.8),
      kind: "drop"
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

const BOT_SKINS = SNAKE_SKINS.filter((s) => s.id !== "rainbow" && s.id !== "lotus");

const BOT_PROFILE_POOL: BotProfile[] = ["hunter", "grazer", "grazer", "coward", "wall-hugger"];

function pickBotProfile(world: World): BotProfile {
  return BOT_PROFILE_POOL[Math.floor(world.rng() * BOT_PROFILE_POOL.length)];
}

function ensureBots(world: World): void {
  // Scale bot population: enough to keep humans busy, capped at MAX_ACTIVE_SNAKES.
  const players = [...world.players.values()];
  const humans = players.filter((p) => !p.bot).length;
  const targetTotal = Math.min(
    MAX_ACTIVE_SNAKES,
    Math.max(MIN_ACTIVE_SNAKES, humans + Math.max(humans * TARGET_BOTS_PER_HUMAN, MIN_ACTIVE_SNAKES))
  );
  // If a human leaves, extra bots stay until they die (they don't get auto-removed mid-life).
  const needed = Math.max(0, targetTotal - players.length);
  for (let i = 0; i < needed; i += 1) {
    const name = BOT_NAMES[(world.players.size + i) % BOT_NAMES.length];
    const id = nextId("bot");
    createPlayer(world, id, name, true, BOT_SKINS[(world.players.size + i) % BOT_SKINS.length].id);
    world.botProfiles.set(id, pickBotProfile(world));
  }

  // If we're way over the target (e.g. lots of humans left), retire extra dead bots
  // so we don't keep respawning them forever.
  if (players.length > targetTotal) {
    const deadBots = players.filter((p) => p.bot && !p.alive);
    const removeCount = Math.min(deadBots.length, players.length - targetTotal);
    for (let i = 0; i < removeCount; i += 1) {
      removePlayer(world, deadBots[i].id);
    }
  }
}

function nearestThreat(world: World, player: PlayerState): { rival: PlayerState; distance: number } | undefined {
  const head = player.segments[0];
  let best: { rival: PlayerState; distance: number } | undefined;
  for (const rival of world.players.values()) {
    if (!rival.alive || rival.id === player.id) continue;
    const d = distance(head, rival.segments[0]);
    if (!best || d < best.distance) best = { rival, distance: d };
  }
  return best;
}

function nearestFood(world: World, player: PlayerState): { pellet: Vec2; distance: number } | undefined {
  const head = player.segments[0];
  let best: { pellet: Vec2; distance: number } | undefined;
  for (const pellet of world.food.values()) {
    const d = distance(head, pellet);
    if (!best || d < best.distance) best = { pellet, distance: d };
  }
  return best;
}

function updateBotInput(world: World, player: PlayerState): ClientInput {
  const profile = world.botProfiles.get(player.id) ?? "grazer";
  const head = player.segments[0];
  const jitter = (world.rng() - 0.5) * 0.32;

  // Wall avoidance: every bot tries not to die at the wall
  const wallMargin = 220;
  let wallNudge: { x: number; y: number } | undefined;
  if (head.x < wallMargin) wallNudge = { x: 1, y: 0 };
  else if (head.x > WORLD_WIDTH - wallMargin) wallNudge = { x: -1, y: 0 };
  if (head.y < wallMargin) wallNudge = wallNudge ? { x: wallNudge.x, y: 1 } : { x: 0, y: 1 };
  else if (head.y > WORLD_HEIGHT - wallMargin) wallNudge = wallNudge ? { x: wallNudge.x, y: -1 } : { x: 0, y: -1 };

  let target: Vec2 | undefined;
  let shouldBoost = false;

  switch (profile) {
    case "hunter": {
      // Chase smaller snakes; boost if close and bigger
      const threat = nearestThreat(world, player);
      if (threat && threat.rival.segments.length < player.segments.length * 0.85 && threat.distance < 720) {
        target = threat.rival.segments[0];
        shouldBoost = threat.distance < 360 && player.segments.length > START_LENGTH + 20;
      } else {
        target = nearestFood(world, player)?.pellet;
      }
      break;
    }
    case "coward": {
      // Run away from any threat within 360 px; otherwise eat food
      const threat = nearestThreat(world, player);
      if (threat && threat.distance < 360) {
        target = { x: head.x - (threat.rival.segments[0].x - head.x), y: head.y - (threat.rival.segments[0].y - head.y) };
        shouldBoost = threat.distance < 200; // panic boost
      } else {
        target = nearestFood(world, player)?.pellet;
      }
      break;
    }
    case "wall-hugger": {
      // Drift around the perimeter clockwise; eat food incidentally
      const t = world.tick * 0.0008;
      const ringR = Math.min(WORLD_WIDTH, WORLD_HEIGHT) * 0.36;
      target = {
        x: WORLD_WIDTH / 2 + Math.cos(t) * ringR,
        y: WORLD_HEIGHT / 2 + Math.sin(t) * ringR
      };
      const nf = nearestFood(world, player);
      if (nf && nf.distance < 220) target = nf.pellet;
      break;
    }
    case "grazer":
    default: {
      target = nearestFood(world, player)?.pellet;
      break;
    }
  }

  if (wallNudge) {
    target = { x: head.x + wallNudge.x * 400, y: head.y + wallNudge.y * 400 };
  }

  const heading = target ? Math.atan2(target.y - head.y, target.x - head.x) + jitter : player.heading + jitter;
  // Idle boost only for hunters / cowards under threat
  return { heading, boosting: shouldBoost && player.boost > 20 };
}

function snakeSizeScale(player: PlayerState): number {
  const progress = Math.max(0, player.segments.length - START_LENGTH) / Math.max(1, MAX_SEGMENTS - START_LENGTH);
  // Ease-out curve for noticeable early growth then taper. Range 1.0 → 2.6.
  const eased = 1 - Math.pow(1 - Math.min(1, progress), 1.6);
  return 1.0 + eased * 1.6;
}


function nextId(prefix: string): string {
  entityCounter += 1;
  return `${prefix}_${entityCounter.toString(36)}`;
}

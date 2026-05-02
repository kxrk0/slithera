import { describe, expect, it } from "vitest";
import {
  BASE_SPEED,
  MAX_FOOD,
  MAX_SEGMENTS,
  MIN_ACTIVE_SNAKES,
  MIN_SCORE,
  ROPE_ACCESSORIES,
  START_LENGTH,
  TAIL_GROW_SEGMENTS_PER_SECOND,
  TICK_RATE
} from "../shared/constants";
import { applyInput, createPlayer, createWorld, desiredSegmentCount, makeSegments, makeSnapshot, stepWorld } from "../shared/simulation";
import { distance } from "../shared/math";

describe("authoritative simulation", () => {
  it("starts with bot fill and food population", () => {
    const world = createWorld(42);

    expect(world.food.size).toBe(MAX_FOOD);
    expect([...world.players.values()].filter((player) => player.bot && player.alive).length).toBe(MIN_ACTIVE_SNAKES);
  });

  it("moves a human player using client input", () => {
    const world = createWorld(7);
    const player = createPlayer(world, "human_test", "Pilot");
    const start = { ...player.segments[0] };

    applyInput(world, player.id, { heading: 0, boosting: false });
    for (let i = 0; i < TICK_RATE; i += 1) stepWorld(world, 1 / TICK_RATE);

    expect(player.segments[0].x).toBeGreaterThan(start.x);
    expect(player.alive).toBe(true);
  });

  it("starts at a readable length score and keeps segment spacing", () => {
    const world = createWorld(9);
    const player = createPlayer(world, "length_test", "Pilot");

    expect(player.score).toBe(MIN_SCORE);
    expect(desiredSegmentCount(MIN_SCORE)).toBe(START_LENGTH);
    applyInput(world, player.id, { heading: 0, boosting: false });
    for (let i = 0; i < TICK_RATE; i += 1) stepWorld(world, 1 / TICK_RATE);

    expect(distance(player.segments[0], player.segments[1])).toBeGreaterThan(12);
  });

  it("increases desired length as score grows", () => {
    expect(desiredSegmentCount(2000)).toBeGreaterThan(desiredSegmentCount(400));
  });

  it("grows the tail gradually from the rear after score increases", () => {
    const world = createWorld(10);
    world.players.clear();
    const player = createPlayer(world, "grow_test", "Grow");
    const initialLength = player.segments.length;

    player.score = MIN_SCORE + 120;
    stepWorld(world, 1 / TICK_RATE);
    expect(player.segments.length).toBe(initialLength);

    for (let i = 0; i < TICK_RATE; i += 1) stepWorld(world, 1 / TICK_RATE);

    expect(player.segments.length).toBeGreaterThan(initialLength);
    expect(player.segments.length).toBeLessThanOrEqual(initialLength + TAIL_GROW_SEGMENTS_PER_SECOND + 1);
  });

  it("caps snake length and publishes whole-number scores", () => {
    const world = createWorld(11);
    const player = createPlayer(world, "score_test", "Pilot");

    player.score = MIN_SCORE + 123.667;
    const snapshot = makeSnapshot(world, player.id);
    const publishedPlayer = snapshot.players.find((item) => item.id === player.id);

    expect(desiredSegmentCount(10_000_000)).toBe(MAX_SEGMENTS);
    expect(publishedPlayer?.score).toBe(Math.floor(player.score));
  });

  it("pulls nearby food toward a player before collection", () => {
    const world = createWorld(13);
    const player = createPlayer(world, "magnet_test", "Pilot");
    const head = player.segments[0];
    const pellet = [...world.food.values()][0];

    pellet.x = head.x + 150;
    pellet.y = head.y;
    pellet.driftAngle = 0;
    pellet.driftSpeed = 0;
    const before = distance(pellet, head);

    stepWorld(world, 1 / TICK_RATE);

    expect(distance(pellet, player.segments[0])).toBeLessThan(before);
  });

  it("does not grow bot or food counts over time", () => {
    const world = createWorld(21);
    const initialPlayers = world.players.size;

    for (const player of world.players.values()) {
      if (player.bot) player.alive = false;
    }
    stepWorld(world, 1 / TICK_RATE);

    expect(world.players.size).toBe(initialPlayers);
    expect(world.food.size).toBeLessThanOrEqual(MAX_FOOD);
  });

  it("drops victim score as food instead of awarding it directly to the killer", () => {
    const world = createWorld(31);
    const victim = createPlayer(world, "victim", "Victim");
    const killer = createPlayer(world, "killer", "Killer");
    const head = { x: 1200, y: 1200 };
    const collisionPoint = { x: head.x + BASE_SPEED / TICK_RATE, y: head.y };

    victim.heading = 0;
    victim.targetHeading = 0;
    victim.score = 220;
    victim.segments = makeSegments(head, 0, START_LENGTH + 20);
    killer.score = 130;
    killer.segments = makeSegments({ x: 1600, y: 1200 }, 0, START_LENGTH + 20);
    killer.segments[6] = collisionPoint;
    const killerScore = killer.score;
    const foodBefore = world.food.size;

    stepWorld(world, 1 / TICK_RATE);

    expect(victim.alive).toBe(false);
    expect(killer.kills).toBe(1);
    expect(killer.score).toBe(killerScore);
    expect(world.food.size).toBeGreaterThan(foodBefore);
  });

  it("ROPE_ACCESSORIES has none as first entry and includes skull/star/diamond", () => {
    const ids = ROPE_ACCESSORIES.map((a) => a.id);
    expect(ids[0]).toBe("none");
    expect(ids).toContain("skull");
    expect(ids).toContain("star");
    expect(ids).toContain("diamond");
  });

  it("createPlayer stores ropeAccessoryId on the player state", () => {
    const world = createWorld(99);
    const player = createPlayer(world, "rope_test", "RopePlayer", false, "cyan-core", "skull");
    expect(player.ropeAccessoryId).toBe("skull");
  });

  it("keeps the tail on the travelled path instead of sliding sideways", () => {
    const world = createWorld(43);
    world.players.clear();
    const player = createPlayer(world, "trail", "Trail");
    const head = { x: 2200, y: 1800 };

    player.heading = 0;
    player.targetHeading = 0;
    player.score = 260;
    player.segments = makeSegments(head, 0, START_LENGTH + 60);

    stepWorld(world, 1 / TICK_RATE);

    expect(Math.max(...player.segments.map((segment) => Math.abs(segment.y - head.y)))).toBeLessThan(0.001);
  });
});

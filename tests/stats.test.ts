import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { deriveTier, loadStats, recordGameEnd, saveStats, TIER_NAMES } from "../client/src/lib/stats";

describe("stats library", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => {
    window.localStorage.clear();
  });

  it("loadStats returns zeros when nothing stored", () => {
    const s = loadStats();
    expect(s.bestScore).toBe(0);
    expect(s.bestLength).toBe(0);
    expect(s.totalKills).toBe(0);
    expect(s.totalPlayedSec).toBe(0);
    expect(s.totalFoodEaten).toBe(0);
    expect(s.winStreak).toBe(0);
    expect(s.gamesPlayed).toBe(0);
  });

  it("saveStats merges and persists", () => {
    saveStats({ bestScore: 500, totalKills: 3 });
    const reloaded = loadStats();
    expect(reloaded.bestScore).toBe(500);
    expect(reloaded.totalKills).toBe(3);
    expect(reloaded.totalPlayedSec).toBe(0);
  });

  it("recordGameEnd takes max of best score/length and increments counters", () => {
    saveStats({ bestScore: 1000, totalKills: 5, gamesPlayed: 2 });
    recordGameEnd({ score: 800, length: 25, kills: 1, playedSec: 30, foodEaten: 800 });
    recordGameEnd({ score: 1500, length: 60, kills: 2, playedSec: 60, foodEaten: 1500 });
    const s = loadStats();
    expect(s.bestScore).toBe(1500);
    expect(s.bestLength).toBe(60);
    expect(s.totalKills).toBe(8);
    expect(s.totalPlayedSec).toBe(90);
    expect(s.totalFoodEaten).toBe(2300);
    expect(s.gamesPlayed).toBe(4);
  });

  it("deriveTier returns Initiate at zero", () => {
    const t = deriveTier({ bestScore: 0, bestLength: 0, totalKills: 0, totalPlayedSec: 0, totalFoodEaten: 0, winStreak: 0, gamesPlayed: 0 });
    expect(t.index).toBe(0);
    expect(t.name).toBe(TIER_NAMES[0]);
    expect(t.progress).toBeGreaterThanOrEqual(0);
    expect(t.progress).toBeLessThanOrEqual(1);
  });

  it("deriveTier advances with score and kills", () => {
    const lowTier = deriveTier({ bestScore: 100, bestLength: 0, totalKills: 0, totalPlayedSec: 0, totalFoodEaten: 0, winStreak: 0, gamesPlayed: 0 });
    const highTier = deriveTier({ bestScore: 8000, bestLength: 0, totalKills: 30, totalPlayedSec: 0, totalFoodEaten: 0, winStreak: 0, gamesPlayed: 0 });
    expect(highTier.index).toBeGreaterThan(lowTier.index);
  });
});

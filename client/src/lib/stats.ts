import { loadAuthUser } from "./auth";

export type StoredStats = {
  bestScore: number;
  bestLength: number;
  totalKills: number;
  totalPlayedSec: number;
  totalFoodEaten: number;
  winStreak: number;
  gamesPlayed: number;
};

const ZERO: StoredStats = {
  bestScore: 0,
  bestLength: 0,
  totalKills: 0,
  totalPlayedSec: 0,
  totalFoodEaten: 0,
  winStreak: 0,
  gamesPlayed: 0
};

const LEGACY_GLOBAL_KEY = "slithera-stats";

export const TIER_NAMES = ["Initiate", "Apprentice", "Sommelier", "Vintner", "Connoisseur", "Master", "Legend"] as const;
const TIER_THRESHOLDS = [0, 1000, 3000, 6000, 10000, 16000, 26000] as const;

function storageKey(): string {
  const user = loadAuthUser();
  return user ? `slithera-stats:${user.id}` : "slithera-stats:guest";
}

function readStats(key: string): StoredStats {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return { ...ZERO };
    const parsed = JSON.parse(raw) as Partial<StoredStats>;
    return { ...ZERO, ...parsed };
  } catch {
    return { ...ZERO };
  }
}

let migratedThisSession = false;
function migrateLegacyOnce(targetKey: string): void {
  if (migratedThisSession) return;
  migratedThisSession = true;
  try {
    const legacy = window.localStorage.getItem(LEGACY_GLOBAL_KEY);
    if (!legacy) return;
    if (window.localStorage.getItem(targetKey)) return;
    window.localStorage.setItem(targetKey, legacy);
    window.localStorage.removeItem(LEGACY_GLOBAL_KEY);
  } catch { /* ignore */ }
}

export function loadStats(): StoredStats {
  const key = storageKey();
  migrateLegacyOnce(key);
  return readStats(key);
}

export function saveStats(partial: Partial<StoredStats>): StoredStats {
  const key = storageKey();
  const merged = { ...readStats(key), ...partial };
  try {
    window.localStorage.setItem(key, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent("slithera-stats-change"));
  } catch { /* ignore */ }
  return merged;
}

export function recordGameEnd(game: { score: number; length: number; kills: number; playedSec: number; foodEaten: number }): StoredStats {
  const current = loadStats();
  return saveStats({
    bestScore: Math.max(current.bestScore, game.score),
    bestLength: Math.max(current.bestLength, game.length),
    totalKills: current.totalKills + game.kills,
    totalPlayedSec: current.totalPlayedSec + game.playedSec,
    totalFoodEaten: current.totalFoodEaten + game.foodEaten,
    gamesPlayed: current.gamesPlayed + 1,
    winStreak: game.score > current.bestScore ? current.winStreak + 1 : 0
  });
}

export type TierInfo = {
  index: number;
  name: typeof TIER_NAMES[number];
  progress: number;
  points: number;
  nextThreshold: number;
};

export function deriveTier(stats: StoredStats): TierInfo {
  const points = stats.bestScore + stats.totalKills * 30;
  let index = 0;
  for (let i = 0; i < TIER_THRESHOLDS.length; i += 1) {
    if (points >= TIER_THRESHOLDS[i]) index = i;
  }
  const lower = TIER_THRESHOLDS[index];
  const upper = TIER_THRESHOLDS[Math.min(index + 1, TIER_THRESHOLDS.length - 1)];
  const span = Math.max(1, upper - lower);
  const progress = index === TIER_THRESHOLDS.length - 1 ? 1 : Math.min(1, (points - lower) / span);
  return { index, name: TIER_NAMES[index], progress, points, nextThreshold: upper };
}

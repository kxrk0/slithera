export type StoredStats = {
  bestScore: number;
  totalKills: number;
  totalPlayedSec: number;
  winStreak: number;
  gamesPlayed: number;
};

const STORAGE_KEY = "slithera-stats";
const ZERO: StoredStats = { bestScore: 0, totalKills: 0, totalPlayedSec: 0, winStreak: 0, gamesPlayed: 0 };

export const TIER_NAMES = ["Initiate", "Apprentice", "Sommelier", "Vintner", "Connoisseur", "Master", "Legend"] as const;
const TIER_THRESHOLDS = [0, 1000, 3000, 6000, 10000, 16000, 26000] as const;

export function loadStats(): StoredStats {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...ZERO };
    const parsed = JSON.parse(raw) as Partial<StoredStats>;
    return { ...ZERO, ...parsed };
  } catch {
    return { ...ZERO };
  }
}

export function saveStats(partial: Partial<StoredStats>): StoredStats {
  const merged = { ...loadStats(), ...partial };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    /* localStorage unavailable — silently ignore */
  }
  return merged;
}

export function recordGameEnd(game: { score: number; kills: number; playedSec: number }): StoredStats {
  const current = loadStats();
  return saveStats({
    bestScore: Math.max(current.bestScore, game.score),
    totalKills: current.totalKills + game.kills,
    totalPlayedSec: current.totalPlayedSec + game.playedSec,
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

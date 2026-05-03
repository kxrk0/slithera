const STORAGE_KEY = "slithera-xp";

export type XpState = {
  total: number;
};

export function loadXp(): XpState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { total: 0 };
    const parsed = JSON.parse(raw) as Partial<XpState>;
    return { total: typeof parsed.total === "number" ? Math.max(0, Math.floor(parsed.total)) : 0 };
  } catch {
    return { total: 0 };
  }
}

export function addXp(amount: number): XpState {
  const current = loadXp();
  const next = { total: current.total + Math.max(0, Math.floor(amount)) };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent("slithera-xp-change"));
  } catch { /* ignore */ }
  return next;
}

export type LevelInfo = {
  level: number;
  current: number;       // XP within current level
  needed: number;        // XP needed to fill the bar (for current → next)
  totalToNext: number;   // total XP threshold for the next level
};

const LEVEL_BASE = 200;
const LEVEL_GROWTH = 1.25;

function thresholdFor(level: number): number {
  // total XP needed to reach this level (level 1 = 0)
  if (level <= 1) return 0;
  let total = 0;
  for (let l = 2; l <= level; l += 1) {
    total += Math.floor(LEVEL_BASE * Math.pow(LEVEL_GROWTH, l - 2));
  }
  return total;
}

export function deriveLevel(state: XpState): LevelInfo {
  let level = 1;
  while (state.total >= thresholdFor(level + 1)) level += 1;
  const lower = thresholdFor(level);
  const upper = thresholdFor(level + 1);
  return {
    level,
    current: state.total - lower,
    needed: Math.max(1, upper - lower),
    totalToNext: upper
  };
}

import { loadAuthUser } from "./auth";

function balanceKey(): string | null {
  const user = loadAuthUser();
  return user ? `slithera-gems:${user.id}` : null;
}

export function loadGems(): number {
  const key = balanceKey();
  if (!key) return 0;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return 0;
    const value = Number(JSON.parse(raw));
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
  } catch {
    return 0;
  }
}

function saveGems(value: number): number {
  const key = balanceKey();
  const clamped = Math.max(0, Math.floor(value));
  if (!key) return clamped;
  try {
    window.localStorage.setItem(key, JSON.stringify(clamped));
    window.dispatchEvent(new CustomEvent("slithera-gems-change"));
  } catch { /* ignore */ }
  return clamped;
}

export function addGems(amount: number): number {
  return saveGems(loadGems() + Math.max(0, Math.floor(amount)));
}

export function spendGems(amount: number): { ok: boolean; balance: number } {
  const current = loadGems();
  if (amount < 0 || current < amount) return { ok: false, balance: current };
  return { ok: true, balance: saveGems(current - amount) };
}

export function formatGems(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${(value / 1000).toFixed(1)}k`;
  return value.toLocaleString("en-US");
}

// Gems earned from hard gameplay achievements
export const GEM_REWARDS = {
  rank1_win:        10,  // finish #1
  kill_streak_5:    3,   // kill 5 in one life
  kill_streak_10:   8,   // kill 10 in one life
  length_200:       5,   // reach 200 length
  length_max:       15,  // reach max length
  games_100:        20,  // play 100 games (lifetime)
  games_500:        60,  // play 500 games
  games_1000:       150, // play 1000 games
} as const;

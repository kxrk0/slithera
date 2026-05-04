import { loadAuthUser } from "./auth";

export type MatchRecord = {
  endedAt: number;
  length: number;
  kills: number;
  foodEaten: number;
  playedSec: number;
  coinsEarned: number;
  xpEarned: number;
};

const MAX_HISTORY = 12;

function storageKey(): string {
  const user = loadAuthUser();
  return user ? `slithera-matches:${user.id}` : "slithera-matches:guest";
}

export function loadMatches(): MatchRecord[] {
  try {
    const raw = window.localStorage.getItem(storageKey());
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, MAX_HISTORY) : [];
  } catch {
    return [];
  }
}

export function recordMatch(match: MatchRecord): void {
  const list = [match, ...loadMatches()].slice(0, MAX_HISTORY);
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(list));
    window.dispatchEvent(new CustomEvent("slithera-matches-change"));
  } catch { /* ignore */ }
}

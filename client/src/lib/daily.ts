import { loadAuthUser } from "./auth";
import { addCoins } from "./coins";
import { addXp } from "./xp";

export type DailyMetric = "food-eaten" | "kills" | "best-length";

export type DailyChallenge = {
  date: string;
  challengeId: string;
  metric: DailyMetric;
  name: string;
  desc: string;
  target: number;
  progress: number;
  reward: number;
  claimed: boolean;
};

const POOL: { id: string; metric: DailyMetric; name: string; desc: string; target: number; reward: number }[] = [
  { id: "feast-30",     metric: "food-eaten",  name: "Today's Tribute", desc: "Devour 30 morsels.",              target: 30,   reward: 250 },
  { id: "long-coil-50", metric: "best-length", name: "The Long Coil",   desc: "Reach length 50 in one run.",     target: 50,   reward: 350 },
  { id: "trio",         metric: "kills",       name: "Trio of Heads",   desc: "Defeat 3 rivals in one session.", target: 3,    reward: 400 },
  { id: "feast-100",    metric: "food-eaten",  name: "Glutton's Vow",   desc: "Devour 100 morsels.",             target: 100,  reward: 600 }
];

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function pickFor(date: string): typeof POOL[number] {
  let hash = 0;
  for (let i = 0; i < date.length; i += 1) hash = (hash * 31 + date.charCodeAt(i)) >>> 0;
  return POOL[hash % POOL.length];
}

function storageKey(): string {
  const user = loadAuthUser();
  return user ? `slithera-daily:${user.id}` : "slithera-daily:guest";
}

export function loadDaily(): DailyChallenge {
  const today = todayKey();
  try {
    const raw = window.localStorage.getItem(storageKey());
    if (raw) {
      const parsed = JSON.parse(raw) as DailyChallenge;
      if (parsed.date === today) return parsed;
    }
  } catch {
    /* fall through */
  }
  const pick = pickFor(today);
  const fresh: DailyChallenge = {
    date: today,
    challengeId: pick.id,
    metric: pick.metric,
    name: pick.name,
    desc: pick.desc,
    target: pick.target,
    progress: 0,
    reward: pick.reward,
    claimed: false
  };
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(fresh));
  } catch { /* ignore */ }
  return fresh;
}

function saveDaily(daily: DailyChallenge): void {
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(daily));
    window.dispatchEvent(new CustomEvent("slithera-daily-change"));
  } catch { /* ignore */ }
}

// Record a finished game's contribution toward the daily challenge.
export function recordDailyRunEnd(run: { foodEaten: number; kills: number; length: number }): void {
  const daily = loadDaily();
  if (daily.claimed) return;
  let next = daily.progress;
  switch (daily.metric) {
    case "food-eaten": next = daily.progress + run.foodEaten; break;
    case "kills":      next = daily.progress + run.kills; break;
    case "best-length": next = Math.max(daily.progress, run.length); break;
  }
  next = Math.min(next, daily.target);
  if (next === daily.progress) return;
  saveDaily({ ...daily, progress: next });
}

// Claim the daily reward. Returns true on successful claim.
export function claimDaily(): boolean {
  const daily = loadDaily();
  if (daily.claimed) return false;
  if (daily.progress < daily.target) return false;
  addXp(daily.reward);
  addCoins(Math.floor(daily.reward * 0.6));
  saveDaily({ ...daily, claimed: true });
  return true;
}

export function secondsUntilMidnight(now = new Date()): number {
  const next = new Date(now);
  next.setHours(24, 0, 0, 0);
  return Math.max(0, Math.floor((next.getTime() - now.getTime()) / 1000));
}

export function formatCountdown(totalSec: number): string {
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

export type DailyChallenge = {
  date: string;
  challengeId: string;
  name: string;
  desc: string;
  target: number;
  progress: number;
  reward: number;
  claimed: boolean;
};

const STORAGE_KEY = "slithera-daily";

const POOL: { id: string; name: string; desc: string; target: number; reward: number }[] = [
  { id: "boost-eat", name: "Today's Tribute", desc: "Devour 30 morsels mid-boost without dying — and feast on 250 XP.", target: 30, reward: 250 },
  { id: "top-five", name: "Hold the Hall", desc: "Survive 2 minutes inside the top 5.", target: 120, reward: 300 },
  { id: "trio", name: "Trio of Heads", desc: "Defeat 3 rival snakes in a single life.", target: 3, reward: 400 },
  { id: "long-coil", name: "The Long Coil", desc: "Reach 5,000 score in one run.", target: 5000, reward: 350 },
  { id: "near-wall", name: "On the Brink", desc: "Eat 12 morsels within a head's length of the arena wall.", target: 12, reward: 220 }
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

export function loadDaily(): DailyChallenge {
  const today = todayKey();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
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
    name: pick.name,
    desc: pick.desc,
    target: pick.target,
    progress: 0,
    reward: pick.reward,
    claimed: false
  };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch { /* ignore */ }
  return fresh;
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

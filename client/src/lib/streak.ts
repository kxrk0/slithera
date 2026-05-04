import { loadAuthUser } from "./auth";
import { addCoins } from "./coins";
import { addXp } from "./xp";

export type StreakState = {
  lastClaimDate: string;       // YYYY-MM-DD of last claim
  currentStreak: number;       // consecutive days
  longestStreak: number;
};

export type StreakReward = { day: number; coins: number; xp: number; milestone: boolean };

const REWARDS: StreakReward[] = [
  { day: 1,  coins: 100,  xp: 50,   milestone: false },
  { day: 2,  coins: 150,  xp: 75,   milestone: false },
  { day: 3,  coins: 250,  xp: 120,  milestone: true  },
  { day: 4,  coins: 300,  xp: 150,  milestone: false },
  { day: 5,  coins: 400,  xp: 200,  milestone: false },
  { day: 6,  coins: 500,  xp: 250,  milestone: false },
  { day: 7,  coins: 1000, xp: 500,  milestone: true  },
  { day: 14, coins: 2000, xp: 1000, milestone: true  },
  { day: 30, coins: 5000, xp: 2500, milestone: true  }
];

const ZERO: StreakState = { lastClaimDate: "", currentStreak: 0, longestStreak: 0 };

function todayKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function yesterdayKey(now = new Date()): string {
  const y = new Date(now);
  y.setDate(y.getDate() - 1);
  return todayKey(y);
}

function storageKey(): string {
  const user = loadAuthUser();
  return user ? `slithera-streak:${user.id}` : "slithera-streak:guest";
}

export function loadStreak(): StreakState {
  try {
    const raw = window.localStorage.getItem(storageKey());
    if (!raw) return { ...ZERO };
    const parsed = JSON.parse(raw) as Partial<StreakState>;
    return { ...ZERO, ...parsed };
  } catch {
    return { ...ZERO };
  }
}

function save(state: StreakState): void {
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(state));
    window.dispatchEvent(new CustomEvent("slithera-streak-change"));
  } catch { /* ignore */ }
}

export type StreakClaimable = {
  available: boolean;        // can the user claim today?
  reason?: "already-claimed";
  newStreak: number;         // streak after claiming today
  reward: StreakReward;
};

export function getClaimable(): StreakClaimable {
  const state = loadStreak();
  const today = todayKey();
  if (state.lastClaimDate === today) {
    return {
      available: false,
      reason: "already-claimed",
      newStreak: state.currentStreak,
      reward: rewardForDay(state.currentStreak)
    };
  }
  const wasYesterday = state.lastClaimDate === yesterdayKey();
  const newStreak = wasYesterday ? state.currentStreak + 1 : 1;
  return {
    available: true,
    newStreak,
    reward: rewardForDay(newStreak)
  };
}

export function claimStreak(): { ok: boolean; newStreak: number; reward: StreakReward } | null {
  const claim = getClaimable();
  if (!claim.available) return null;
  const today = todayKey();
  const state = loadStreak();
  const next: StreakState = {
    lastClaimDate: today,
    currentStreak: claim.newStreak,
    longestStreak: Math.max(state.longestStreak, claim.newStreak)
  };
  save(next);
  addCoins(claim.reward.coins);
  addXp(claim.reward.xp);
  return { ok: true, newStreak: claim.newStreak, reward: claim.reward };
}

function rewardForDay(day: number): StreakReward {
  // Pick the largest reward at or below `day`, fallback to last entry
  for (let i = REWARDS.length - 1; i >= 0; i -= 1) {
    if (day >= REWARDS[i].day) return REWARDS[i];
  }
  return REWARDS[0];
}

export const MILESTONES = REWARDS;

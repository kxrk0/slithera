import { loadAuthUser } from "./auth";

export type QuestMetric =
  | "food-eaten-total"     // food eaten across all matches
  | "kills-total"          // kills across all matches
  | "best-length"          // highest length reached in a single run
  | "boost-streak";        // longest boost streak without dying (placeholder)

export type WeeklyQuestDef = {
  id: string;
  metric: QuestMetric;
  name: string;
  desc: string;
  target: number;
  xp: number;
  coins: number;
};

export const WEEKLY_QUESTS: WeeklyQuestDef[] = [
  { id: "wkly.food-200",   metric: "food-eaten-total", name: "The Long Feast",   desc: "Devour 200 morsels across all matches.",        target: 200, xp: 600, coins: 800 },
  { id: "wkly.kills-15",   metric: "kills-total",      name: "The Hunter",       desc: "Defeat 15 rival snakes.",                       target: 15,  xp: 800, coins: 600 },
  { id: "wkly.length-150", metric: "best-length",      name: "Reach for the Sky",desc: "Reach length 150 in a single run.",            target: 150, xp: 500, coins: 700 },
  { id: "wkly.boost-20",   metric: "boost-streak",     name: "Velocity Cult",    desc: "Win 20 boosts in succession without dying.",   target: 20,  xp: 400, coins: 500 }
];

type QuestProgress = {
  weekStart: string;
  metrics: Partial<Record<QuestMetric, number>>;
};

function weekKey(now = new Date()): string {
  // ISO week: anchor to Monday
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() - (day - 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
}

function progressKey(): string {
  const user = loadAuthUser();
  return user ? `slithera-quest-progress:${user.id}` : "slithera-quest-progress:guest";
}

export function loadQuestProgress(): QuestProgress {
  const key = progressKey();
  const week = weekKey();
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as QuestProgress;
      if (parsed.weekStart === week) return parsed;
    }
  } catch { /* fall through */ }
  return { weekStart: week, metrics: {} };
}

function saveQuestProgress(progress: QuestProgress): void {
  const key = progressKey();
  try {
    window.localStorage.setItem(key, JSON.stringify(progress));
    window.dispatchEvent(new CustomEvent("slithera-quest-progress-change"));
  } catch { /* ignore */ }
}

function bump(metric: QuestMetric, delta: number): void {
  if (delta <= 0) return;
  const progress = loadQuestProgress();
  progress.metrics[metric] = (progress.metrics[metric] ?? 0) + delta;
  saveQuestProgress(progress);
}

function setMax(metric: QuestMetric, value: number): void {
  if (value <= 0) return;
  const progress = loadQuestProgress();
  const current = progress.metrics[metric] ?? 0;
  if (value > current) {
    progress.metrics[metric] = value;
    saveQuestProgress(progress);
  }
}

export function recordQuestRunEnd(run: { foodEaten: number; kills: number; length: number }): void {
  if (run.foodEaten > 0) bump("food-eaten-total", run.foodEaten);
  if (run.kills > 0) bump("kills-total", run.kills);
  setMax("best-length", run.length);
}

export function getQuestProgressFor(quest: WeeklyQuestDef): number {
  const progress = loadQuestProgress();
  const value = progress.metrics[quest.metric] ?? 0;
  return Math.min(value, quest.target);
}

import { loadAuthUser } from "./auth";
import { addCoins } from "./coins";
import { addXp } from "./xp";

export type AchievementId =
  | "first-blood"
  | "first-life"
  | "length-50"
  | "length-100"
  | "length-200"
  | "kills-10"
  | "kills-50"
  | "feast-100"
  | "veteran-10"
  | "veteran-50";

export type AchievementDef = {
  id: AchievementId;
  name: string;
  desc: string;
  glyph: string;
  xp: number;
  coins: number;
  test: (stats: AchievementStats) => boolean;
};

export type AchievementStats = {
  bestLength: number;
  totalKills: number;
  totalFoodEaten: number;
  gamesPlayed: number;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: "first-life",  name: "First Slither",   desc: "Play your first game.",            glyph: "🐍", xp: 100, coins: 100, test: (s) => s.gamesPlayed >= 1 },
  { id: "first-blood", name: "First Blood",     desc: "Defeat your first rival.",         glyph: "🩸", xp: 200, coins: 150, test: (s) => s.totalKills >= 1 },
  { id: "length-50",   name: "Slow Coil",       desc: "Reach length 50 in a single run.", glyph: "📏", xp: 150, coins: 100, test: (s) => s.bestLength >= 50 },
  { id: "length-100",  name: "The Long Coil",   desc: "Reach length 100 in a single run.",glyph: "📐", xp: 400, coins: 250, test: (s) => s.bestLength >= 100 },
  { id: "length-200",  name: "Hall of Length",  desc: "Reach length 200 in a single run.",glyph: "🏛", xp: 800, coins: 600, test: (s) => s.bestLength >= 200 },
  { id: "kills-10",    name: "Hunter",          desc: "Defeat 10 rivals in total.",       glyph: "⚔️", xp: 300, coins: 250, test: (s) => s.totalKills >= 10 },
  { id: "kills-50",    name: "Apex Predator",   desc: "Defeat 50 rivals in total.",       glyph: "👑", xp: 1000, coins: 800, test: (s) => s.totalKills >= 50 },
  { id: "feast-100",   name: "The Long Feast",  desc: "Devour 100 food in total.",        glyph: "🍇", xp: 200, coins: 200, test: (s) => s.totalFoodEaten >= 100 },
  { id: "veteran-10",  name: "Initiate",        desc: "Play 10 games.",                   glyph: "🕯", xp: 250, coins: 200, test: (s) => s.gamesPlayed >= 10 },
  { id: "veteran-50",  name: "Veteran",         desc: "Play 50 games.",                   glyph: "🏵", xp: 600, coins: 500, test: (s) => s.gamesPlayed >= 50 }
];

function storageKey(): string {
  const user = loadAuthUser();
  return user ? `slithera-achievements:${user.id}` : "slithera-achievements:guest";
}

export function loadAchievements(): Set<AchievementId> {
  try {
    const raw = window.localStorage.getItem(storageKey());
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as AchievementId[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
}

function saveAchievements(set: Set<AchievementId>): void {
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify([...set]));
    window.dispatchEvent(new CustomEvent("slithera-achievements-change"));
  } catch { /* ignore */ }
}

// Check stats against achievements; for any newly-unlocked, grant rewards and fire an event.
// Returns the list of newly unlocked achievements (for UI toasts).
export function evaluateAchievements(stats: AchievementStats): AchievementDef[] {
  const unlocked = loadAchievements();
  const newlyUnlocked: AchievementDef[] = [];
  for (const def of ACHIEVEMENTS) {
    if (unlocked.has(def.id)) continue;
    if (!def.test(stats)) continue;
    unlocked.add(def.id);
    addXp(def.xp);
    addCoins(def.coins);
    newlyUnlocked.push(def);
  }
  if (newlyUnlocked.length > 0) {
    saveAchievements(unlocked);
    for (const def of newlyUnlocked) {
      window.dispatchEvent(new CustomEvent("slithera-achievement-unlocked", { detail: def }));
    }
  }
  return newlyUnlocked;
}

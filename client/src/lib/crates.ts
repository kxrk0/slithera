import type { Rarity } from "../../../shared/constants";
import { SNAKE_SKINS, HAT_OPTIONS, ROPE_ACCESSORIES, TRAIL_OPTIONS } from "../../../shared/constants";
import { spendGems } from "./gems";
import { grantItem } from "./inventory";

export type CrateId = "basic" | "premium" | "epic" | "legendary" | "mythic";

export type CrateDef = {
  id: CrateId;
  name: string;
  subtitle: string;
  price: number;           // gems
  color: string;           // accent color
  glowColor: string;
  weights: Record<Rarity, number>;
};

export const CRATES: CrateDef[] = [
  {
    id: "basic",
    name: "Basic Crate",
    subtitle: "Common finds, occasional surprises",
    price: 80,
    color: "#aaaaaa",
    glowColor: "rgba(170,170,170,0.4)",
    weights: { common: 55, uncommon: 30, rare: 12, epic: 2.5, legendary: 0.4, mythic: 0.1 },
  },
  {
    id: "premium",
    name: "Premium Chest",
    subtitle: "Uncommon to rare guaranteed",
    price: 250,
    color: "#4a9eff",
    glowColor: "rgba(74,158,255,0.4)",
    weights: { common: 0, uncommon: 45, rare: 35, epic: 15, legendary: 4, mythic: 1 },
  },
  {
    id: "epic",
    name: "Epic Vault",
    subtitle: "Rare minimum, legendary possible",
    price: 600,
    color: "#c060ff",
    glowColor: "rgba(192,96,255,0.4)",
    weights: { common: 0, uncommon: 0, rare: 50, epic: 35, legendary: 12, mythic: 3 },
  },
  {
    id: "legendary",
    name: "Legendary Archive",
    subtitle: "Epic guaranteed, mythic within reach",
    price: 1500,
    color: "#ffa040",
    glowColor: "rgba(255,160,64,0.4)",
    weights: { common: 0, uncommon: 0, rare: 0, epic: 45, legendary: 40, mythic: 15 },
  },
  {
    id: "mythic",
    name: "Mythic Sanctum",
    subtitle: "Legendary or mythic. Always.",
    price: 4000,
    color: "#ff6ec7",
    glowColor: "rgba(255,110,199,0.5)",
    weights: { common: 0, uncommon: 0, rare: 0, epic: 0, legendary: 60, mythic: 40 },
  },
];

export type PoolItem = { marketId: string; refId: string; rarity: Rarity; category: "skin" | "hat" | "charm" | "trail"; name: string };

function buildPool(): PoolItem[] {
  const pool: PoolItem[] = [];

  for (const s of SNAKE_SKINS) {
    if (s.id === "cyan-core" || s.id === "embercoil" || s.id === "venom-lime") continue;
    pool.push({ marketId: `skin.${s.id}`, refId: s.id, rarity: s.rarity, category: "skin", name: s.name });
  }
  for (const h of HAT_OPTIONS) {
    if (!h.rarity) continue;
    pool.push({ marketId: `hat.${h.id}`, refId: h.id, rarity: h.rarity as Rarity, category: "hat", name: h.name });
  }
  for (const c of ROPE_ACCESSORIES) {
    if (c.id === "none" || c.id === "venus") continue;
    pool.push({ marketId: `charm.${c.id}`, refId: c.id, rarity: c.rarity, category: "charm", name: c.name });
  }
  for (const t of TRAIL_OPTIONS) {
    if (t.id === "none") continue;
    pool.push({ marketId: `trail.${t.id}`, refId: t.id, rarity: t.rarity, category: "trail", name: t.name });
  }
  return pool;
}

const POOL = buildPool();

function rollRarity(weights: Record<Rarity, number>): Rarity {
  const total = Object.values(weights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  for (const [rarity, weight] of Object.entries(weights) as [Rarity, number][]) {
    roll -= weight;
    if (roll <= 0) return rarity;
  }
  return "common";
}

export type CrateResult = {
  item: PoolItem;
  isNew: boolean;
};

export function openCrate(crateId: CrateId, ownedIds: string[]): { ok: false; reason: string } | { ok: true; result: CrateResult } {
  const crate = CRATES.find((c) => c.id === crateId);
  if (!crate) return { ok: false, reason: "Unknown crate" };

  const spend = spendGems(crate.price);
  if (!spend.ok) return { ok: false, reason: "Not enough gems" };

  const rarity = rollRarity(crate.weights);
  const candidates = POOL.filter((item) => item.rarity === rarity);

  // Prefer unowned items; fall back to any of that rarity
  const unowned = candidates.filter((item) => !ownedIds.includes(item.marketId));
  const pool = unowned.length > 0 ? unowned : candidates;

  if (pool.length === 0) {
    // Edge case: no items of this rarity — reroll with broader rarity
    const fallback = POOL[Math.floor(Math.random() * POOL.length)];
    const isNew = !ownedIds.includes(fallback.marketId);
    if (isNew) grantItem(fallback.marketId);
    return { ok: true, result: { item: fallback, isNew } };
  }

  const item = pool[Math.floor(Math.random() * pool.length)];
  const isNew = !ownedIds.includes(item.marketId);
  if (isNew) grantItem(item.marketId);

  return { ok: true, result: { item, isNew } };
}

export function getReelFillers(count: number, winnerIdx: number, winner: PoolItem): PoolItem[] {
  return Array.from({ length: count }, (_, i) => {
    if (i === winnerIdx) return winner;
    return POOL[Math.floor(Math.random() * POOL.length)];
  });
}

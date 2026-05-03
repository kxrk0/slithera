# Slithera Warm Gold UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing main menu with the Warm Gold Brown design — 3-panel layout (loadout / lifetime / center / leaderboard), modal skin and hat selection with 3D forward-slithering snake previews, live game canvas backdrop, distinctive Fraunces + Outfit typography.

**Architecture:** All UI work is React components under `client/src/components/menu/`. Visual styles extend `client/src/styles.css` (no CSS modules in this project). Data layer adds `hatId` mirroring the existing `skinId` / `ropeAccessoryId` pattern. Live canvas behind the menu uses a client-side simulation hook that drives the existing `PixiGame` component until the user clicks Enter Arena.

**Tech Stack:** React 19, TypeScript 5, Vite 7, Vitest 4, @testing-library/react, PixiJS 8, Google Fonts (Fraunces, Outfit, JetBrains Mono).

**Canonical visual reference:** `.superpowers/brainstorm/3035-1777767476/content/warm-gold-final-v2.html` — this is the pixel-perfect mockup of every panel, modal, and animation. Implementers MUST consult it to copy exact CSS values when this plan refers to it.

---

## File Map

| File | What changes |
|------|-------------|
| `client/index.html` | Add Google Fonts `<link>` for Fraunces, Outfit, JetBrains Mono |
| `client/src/styles.css` | Add `.wg-*` design system block; remove `.future-slots` / outdated `.main-menu` rules at the very end |
| `client/src/App.tsx` | Add `hatId` state; render `WarmGoldMenu` instead of `MainMenu`; run menu backdrop hook when `!started` |
| `client/src/components/MainMenu.tsx` | DELETE (replaced) |
| `client/src/components/menu/WarmGoldMenu.tsx` | NEW — 3-panel container, owns modal state |
| `client/src/components/menu/LoadoutPanel.tsx` | NEW — left-top panel |
| `client/src/components/menu/LifetimePanel.tsx` | NEW — left-bottom panel |
| `client/src/components/menu/CenterPanel.tsx` | NEW — center logo + name + play |
| `client/src/components/menu/ArenaHallPanel.tsx` | NEW — right leaderboard + daily + news |
| `client/src/components/menu/MiniSnakePreview.tsx` | NEW — slithering mini snake |
| `client/src/components/menu/SnakePreview3D.tsx` | NEW — 3D forward-slither preview |
| `client/src/components/menu/WardrobeModal.tsx` | NEW — shared modal frame |
| `client/src/components/menu/SkinPicker.tsx` | NEW — skin modal content |
| `client/src/components/menu/HatPicker.tsx` | NEW — hat modal content |
| `client/src/lib/stats.ts` | NEW — localStorage stats + tier derivation |
| `client/src/lib/daily.ts` | NEW — localStorage daily challenge |
| `client/src/lib/menuBackdrop.ts` | NEW — `useMenuSimulation` hook |
| `shared/constants.ts` | Add `HAT_OPTIONS` + `HatId` type |
| `shared/types.ts` | Add `hatId?` on `PlayerState` + `join` |
| `shared/simulation.ts` | `createPlayer` accepts `hatId` |
| `server/index.ts` | Forward `message.hatId` |
| `client/src/game/useGameClient.ts` | Include `hatId` in profile + join + deps |
| `tests/simulation.test.ts` | Assert `HAT_OPTIONS` shape + `createPlayer` stores `hatId` |
| `tests/client-smoke.test.tsx` | Add `hatId: "none"` to fixture |
| `tests/menu-smoke.test.tsx` | NEW — smoke test for `WarmGoldMenu` |
| `tests/stats.test.ts` | NEW — test stats lib |

---

## Task 1: Hat Data Layer

**Files:**
- Modify: `shared/constants.ts`
- Modify: `shared/types.ts`
- Modify: `shared/simulation.ts` (`createPlayer` signature, line ~59)
- Modify: `server/index.ts` (join handler, line ~70)
- Modify: `client/src/game/useGameClient.ts`
- Modify: `tests/simulation.test.ts`
- Modify: `tests/client-smoke.test.tsx`

- [ ] **Step 1: Write a failing test for `HAT_OPTIONS` shape**

  Add to `tests/simulation.test.ts` imports at the top, alongside existing `ROPE_ACCESSORIES` import:

  ```typescript
  import { HAT_OPTIONS, ROPE_ACCESSORIES } from "../shared/constants";
  ```

  Add inside the existing `describe("authoritative simulation", () => { ... })` block:

  ```typescript
  it("HAT_OPTIONS has none as first entry and includes crown/halo/visor", () => {
    const ids = HAT_OPTIONS.map((h) => h.id);
    expect(ids[0]).toBe("none");
    expect(ids).toContain("crown");
    expect(ids).toContain("halo");
    expect(ids).toContain("visor");
  });

  it("createPlayer stores hatId on the player state", () => {
    const world = createWorld(101);
    const player = createPlayer(world, "hat_test", "HatPlayer", false, "cyan-core", "none", "crown");
    expect(player.hatId).toBe("crown");
  });
  ```

- [ ] **Step 2: Run tests to verify failure**

  Run: `npx vitest run tests/simulation.test.ts`

  Expected: 2 new tests FAIL — `HAT_OPTIONS is not exported`, `createPlayer takes 6 args not 7`.

- [ ] **Step 3: Add `HAT_OPTIONS` to `shared/constants.ts`**

  Append at the end of `shared/constants.ts` (after `ROPE_ACCESSORIES`):

  ```typescript
  export const HAT_OPTIONS = [
    { id: "none",    name: "Bare",    mark: "∅",  rarity: "" },
    { id: "crown",   name: "Crown",   mark: "👑", rarity: "myth" },
    { id: "halo",    name: "Halo",    mark: "○",  rarity: "common" },
    { id: "visor",   name: "Visor",   mark: "◧",  rarity: "common" },
    { id: "top-hat", name: "Top Hat", mark: "🎩", rarity: "rare" },
    { id: "helm",    name: "Helm",    mark: "🪖", rarity: "locked" },
    { id: "cap",     name: "Cap",     mark: "🧢", rarity: "locked" },
    { id: "mortar",  name: "Mortar",  mark: "🎓", rarity: "locked" },
    { id: "hardhat", name: "Hardhat", mark: "⛑",  rarity: "locked" }
  ] as const;

  export type HatId = typeof HAT_OPTIONS[number]["id"];
  ```

- [ ] **Step 4: Add `hatId?` to `PlayerState` and `join` in `shared/types.ts`**

  In the `PlayerState` type, add `hatId?: string;` after `ropeAccessoryId?: string;`.

  In the `ClientMessage` union, modify the `join` variant:

  ```typescript
  | { type: "join"; name: string; skinId?: string; ropeAccessoryId?: string; hatId?: string }
  ```

- [ ] **Step 5: Update `createPlayer` in `shared/simulation.ts`**

  Change the function signature (currently line 59):

  ```typescript
  export function createPlayer(
    world: World,
    id: string,
    name: string,
    bot = false,
    skinId?: string,
    ropeAccessoryId?: string,
    hatId?: string
  ): PlayerState {
  ```

  Inside the function body, add `hatId` to the player object literal (immediately after `ropeAccessoryId`):

  ```typescript
  ropeAccessoryId,
  hatId
  ```

- [ ] **Step 6: Update `server/index.ts` join handler**

  Change line ~70 from:
  ```typescript
  const player = createPlayer(world, id, message.name, false, message.skinId, message.ropeAccessoryId);
  ```
  to:
  ```typescript
  const player = createPlayer(world, id, message.name, false, message.skinId, message.ropeAccessoryId, message.hatId);
  ```

- [ ] **Step 7: Update `useGameClient.ts`**

  Change the function signature (line ~6):
  ```typescript
  export function useGameClient(enabled: boolean, profile: { name: string; skinId: string; ropeAccessoryId?: string; hatId?: string }) {
  ```

  Change the join message:
  ```typescript
  socket.send(JSON.stringify({ type: "join", name: profile.name, skinId: profile.skinId, ropeAccessoryId: profile.ropeAccessoryId, hatId: profile.hatId }));
  ```

  Add `profile.hatId` to the `useEffect` dependency array next to `profile.ropeAccessoryId`.

- [ ] **Step 8: Update `tests/client-smoke.test.tsx` fixture**

  Add `hatId: "none"` to the fixture player object (right after `ropeAccessoryId: "none"`).

- [ ] **Step 9: Run all tests**

  Run: `npx vitest run`

  Expected: 15/15 pass (13 existing + 2 new).

- [ ] **Step 10: Run typecheck**

  Run: `npx tsc --noEmit`

  Expected: 0 errors.

- [ ] **Step 11: Commit**

  ```bash
  git add shared/constants.ts shared/types.ts shared/simulation.ts server/index.ts client/src/game/useGameClient.ts tests/simulation.test.ts tests/client-smoke.test.tsx
  git commit -m "feat(data): add HAT_OPTIONS and hatId to PlayerState/join message"
  ```

---

## Task 2: Design Tokens, Fonts & Base Panel Styles

**Files:**
- Modify: `client/index.html`
- Modify: `client/src/styles.css`

- [ ] **Step 1: Add Google Fonts to `client/index.html`**

  Inside `<head>`, before any existing `<link>` tags or before `</head>`, add:

  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700;9..144,900&family=Outfit:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  ```

- [ ] **Step 2: Add the Warm Gold design tokens + base classes to `styles.css`**

  Append the following block to the **end** of `client/src/styles.css`:

  ```css
  /* ============ Warm Gold Design System ============ */
  :root {
    --wg-coffee: #0e0a06;
    --wg-coffee-2: #14100c;
    --wg-coffee-3: #1a140e;
    --wg-bourbon: #2d1f12;
    --wg-cream: #f5e9d3;
    --wg-cream-dim: #c4b59a;
    --wg-cream-mute: #8a7d68;
    --wg-gold: #f0b540;
    --wg-amber: #d97a3c;
    --wg-ember: #e85a4f;
    --wg-honey: #ffc966;
    --wg-panel-bg: rgba(20, 14, 8, 0.72);
    --wg-panel-border: rgba(245, 233, 211, 0.1);
    --wg-panel-border-strong: rgba(240, 181, 64, 0.3);
    --wg-serif: 'Fraunces', Georgia, serif;
    --wg-sans: 'Outfit', system-ui, sans-serif;
    --wg-mono: 'JetBrains Mono', monospace;
    --wg-ease-soft: cubic-bezier(0.16, 1, 0.3, 1);
    --wg-ease-snap: cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  /* === Stage shell === */
  .wg-stage {
    position: fixed;
    inset: 0;
    z-index: 10;
    overflow: hidden;
    color: var(--wg-cream);
    font-family: var(--wg-sans);
  }
  .wg-stage * { box-sizing: border-box; }

  /* === Background overlays (live canvas shows through) === */
  .wg-overlay {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 25% 20%, rgba(240, 181, 64, 0.16), transparent 45%),
      radial-gradient(ellipse at 75% 75%, rgba(217, 122, 60, 0.14), transparent 50%),
      radial-gradient(ellipse at 50% 100%, rgba(232, 90, 79, 0.10), transparent 50%),
      linear-gradient(160deg, rgba(10, 7, 3, 0.78) 0%, rgba(20, 16, 12, 0.62) 50%, rgba(26, 20, 12, 0.74) 100%);
    pointer-events: none;
  }
  .wg-grain {
    position: absolute;
    inset: 0;
    opacity: 0.05;
    mix-blend-mode: overlay;
    background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence baseFrequency='0.85' numOctaves='2' seed='5'/></filter><rect width='100%' height='100%' filter='url(%23n)' opacity='0.5'/></svg>");
    pointer-events: none;
  }

  /* === Top + bottom ornaments === */
  .wg-top-ornament {
    position: absolute;
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 14px;
    z-index: 11;
    font-family: var(--wg-serif);
    font-style: italic;
    font-size: 11px;
    letter-spacing: 0.3em;
    color: var(--wg-gold);
    text-transform: uppercase;
    font-weight: 500;
    white-space: nowrap;
    pointer-events: none;
  }
  .wg-top-ornament::before, .wg-top-ornament::after {
    content: '';
    width: 60px;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--wg-gold), transparent);
  }
  .wg-bottom-edge {
    position: absolute;
    bottom: 12px;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--wg-mono);
    font-size: 9px;
    letter-spacing: 0.4em;
    color: var(--wg-cream-mute);
    z-index: 11;
    pointer-events: none;
  }

  /* === Layout === */
  .wg-grid {
    position: absolute;
    inset: 0;
    padding: 56px 36px 36px;
    display: grid;
    grid-template-columns: 280px minmax(0, 480px) 280px;
    gap: 18px;
    justify-content: center;
    align-content: center;
    z-index: 12;
    max-width: 1180px;
    margin: 0 auto;
  }
  .wg-left-stack {
    display: grid;
    grid-template-rows: 1fr 1fr;
    gap: 16px;
  }

  /* === Panel base === */
  .wg-panel {
    background: var(--wg-panel-bg);
    border: 1px solid var(--wg-panel-border);
    border-radius: 18px;
    padding: 22px;
    backdrop-filter: blur(20px) saturate(140%);
    -webkit-backdrop-filter: blur(20px) saturate(140%);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.04) inset,
      0 16px 60px rgba(0, 0, 0, 0.4);
    position: relative;
    transition: transform 400ms var(--wg-ease-soft), border-color 400ms var(--wg-ease-soft);
    overflow: hidden;
  }
  .wg-panel:hover {
    transform: translateY(-2px);
    border-color: rgba(240, 181, 64, 0.2);
  }
  .wg-panel::before, .wg-panel::after {
    content: '';
    position: absolute;
    width: 14px;
    height: 14px;
    border: 1px solid rgba(240, 181, 64, 0.35);
    pointer-events: none;
  }
  .wg-panel::before {
    top: 8px; left: 8px;
    border-right: 0; border-bottom: 0;
  }
  .wg-panel::after {
    bottom: 8px; right: 8px;
    border-left: 0; border-top: 0;
  }
  .wg-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 14px;
    padding-bottom: 12px;
    border-bottom: 1px solid rgba(245, 233, 211, 0.06);
  }
  .wg-panel-title {
    font-family: var(--wg-serif);
    font-style: italic;
    font-weight: 600;
    font-size: 16px;
    font-variation-settings: 'opsz' 144;
    color: var(--wg-cream);
    letter-spacing: -0.01em;
  }
  .wg-panel-meta {
    font-family: var(--wg-mono);
    font-size: 9px;
    color: var(--wg-gold);
    letter-spacing: 0.2em;
    font-weight: 700;
  }

  /* Mobile / small screens */
  @media (max-width: 980px) {
    .wg-grid {
      grid-template-columns: 1fr;
      grid-template-rows: auto auto auto;
      max-width: 480px;
      padding: 40px 16px;
    }
    .wg-left-stack {
      grid-template-rows: auto auto;
    }
  }
  ```

- [ ] **Step 3: Verify build still succeeds**

  Run: `npx tsc --noEmit && npx vitest run`

  Expected: 0 type errors, all tests pass.

- [ ] **Step 4: Commit**

  ```bash
  git add client/index.html client/src/styles.css
  git commit -m "feat(ui): add warm gold design tokens, fonts, base panel styles"
  ```

---

## Task 3: Stats & Daily Challenge Persistence

**Files:**
- Create: `client/src/lib/stats.ts`
- Create: `client/src/lib/daily.ts`
- Create: `tests/stats.test.ts`

- [ ] **Step 1: Write failing tests for stats lib**

  Create `tests/stats.test.ts`:

  ```typescript
  import { afterEach, beforeEach, describe, expect, it } from "vitest";
  import { deriveTier, loadStats, recordGameEnd, saveStats, TIER_NAMES } from "../client/src/lib/stats";

  describe("stats library", () => {
    beforeEach(() => {
      window.localStorage.clear();
    });
    afterEach(() => {
      window.localStorage.clear();
    });

    it("loadStats returns zeros when nothing stored", () => {
      const s = loadStats();
      expect(s.bestScore).toBe(0);
      expect(s.totalKills).toBe(0);
      expect(s.totalPlayedSec).toBe(0);
      expect(s.winStreak).toBe(0);
      expect(s.gamesPlayed).toBe(0);
    });

    it("saveStats merges and persists", () => {
      saveStats({ bestScore: 500, totalKills: 3 });
      const reloaded = loadStats();
      expect(reloaded.bestScore).toBe(500);
      expect(reloaded.totalKills).toBe(3);
      expect(reloaded.totalPlayedSec).toBe(0);
    });

    it("recordGameEnd takes max of best score and increments counters", () => {
      saveStats({ bestScore: 1000, totalKills: 5, gamesPlayed: 2 });
      recordGameEnd({ score: 800, kills: 1, playedSec: 30 });
      recordGameEnd({ score: 1500, kills: 2, playedSec: 60 });
      const s = loadStats();
      expect(s.bestScore).toBe(1500);
      expect(s.totalKills).toBe(8);
      expect(s.totalPlayedSec).toBe(90);
      expect(s.gamesPlayed).toBe(4);
    });

    it("deriveTier returns Initiate at zero", () => {
      const t = deriveTier({ bestScore: 0, totalKills: 0, totalPlayedSec: 0, winStreak: 0, gamesPlayed: 0 });
      expect(t.index).toBe(0);
      expect(t.name).toBe(TIER_NAMES[0]);
      expect(t.progress).toBeGreaterThanOrEqual(0);
      expect(t.progress).toBeLessThanOrEqual(1);
    });

    it("deriveTier advances with score and kills", () => {
      const lowTier = deriveTier({ bestScore: 100, totalKills: 0, totalPlayedSec: 0, winStreak: 0, gamesPlayed: 0 });
      const highTier = deriveTier({ bestScore: 8000, totalKills: 30, totalPlayedSec: 0, winStreak: 0, gamesPlayed: 0 });
      expect(highTier.index).toBeGreaterThan(lowTier.index);
    });
  });
  ```

- [ ] **Step 2: Run failing test**

  Run: `npx vitest run tests/stats.test.ts`

  Expected: FAIL — `Cannot find module '.../lib/stats'`.

- [ ] **Step 3: Implement `stats.ts`**

  Create `client/src/lib/stats.ts`:

  ```typescript
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
  ```

- [ ] **Step 4: Run tests to verify**

  Run: `npx vitest run tests/stats.test.ts`

  Expected: 5/5 pass.

- [ ] **Step 5: Implement `daily.ts`**

  Create `client/src/lib/daily.ts`:

  ```typescript
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
  ```

- [ ] **Step 6: Run all tests**

  Run: `npx vitest run`

  Expected: all pass.

- [ ] **Step 7: Commit**

  ```bash
  git add client/src/lib/stats.ts client/src/lib/daily.ts tests/stats.test.ts
  git commit -m "feat(menu): add stats + daily-challenge localStorage persistence"
  ```

---

## Task 4: MiniSnakePreview Component

**Files:**
- Create: `client/src/components/menu/MiniSnakePreview.tsx`
- Modify: `client/src/styles.css` (add `.wg-mini-*` classes)

- [ ] **Step 1: Add CSS for the mini snake preview**

  Append to `client/src/styles.css`:

  ```css
  /* === Mini Snake Preview (loadout panel) === */
  .wg-mini-stage {
    height: 92px;
    position: relative;
    margin: 4px 0 14px;
    border-radius: 12px;
    overflow: hidden;
    background:
      radial-gradient(circle at 50% 50%, rgba(240, 181, 64, 0.12), transparent 60%),
      rgba(0, 0, 0, 0.32);
    border: 1px solid rgba(245, 233, 211, 0.05);
  }
  .wg-mini-stage::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image: radial-gradient(circle at center, rgba(240, 181, 64, 0.06) 0.5px, transparent 1px);
    background-size: 12px 12px;
    opacity: 0.6;
  }
  .wg-mini-stage::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(90deg, transparent, rgba(240, 181, 64, 0.08) 50%, transparent),
      linear-gradient(90deg, transparent, rgba(240, 181, 64, 0.05) 50%, transparent);
    background-size: 80px 1px, 50px 1px;
    background-position: 0 35%, 30px 65%;
    background-repeat: no-repeat;
    animation: wg-speed-lines 1.4s linear infinite;
    opacity: 0.7;
  }
  @keyframes wg-speed-lines {
    0% { background-position: -100px 35%, -130px 65%; }
    100% { background-position: 100% 35%, 100% 65%; }
  }
  .wg-mini-snake {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
  }
  .wg-mini-snake i {
    position: relative;
    width: 22px; height: 22px;
    margin-left: -7px;
    border-radius: 50%;
    box-shadow: inset -3px -4px 0 rgba(0, 0, 0, 0.18);
    animation: wg-slither-2d 1.2s ease-in-out infinite;
  }
  .wg-mini-snake i:nth-child(1) { margin-left: 0; }
  .wg-mini-snake i:nth-child(2) { animation-delay: 0.06s; }
  .wg-mini-snake i:nth-child(3) { animation-delay: 0.12s; }
  .wg-mini-snake i:nth-child(4) { animation-delay: 0.18s; }
  .wg-mini-snake i:nth-child(5) { animation-delay: 0.24s; width: 19px; height: 19px; }
  .wg-mini-snake i:nth-child(6) { animation-delay: 0.30s; width: 19px; height: 19px; }
  .wg-mini-snake i:nth-child(7) { animation-delay: 0.36s; width: 16px; height: 16px; opacity: 0.85; }
  @keyframes wg-slither-2d {
    0%, 100% { translate: 0 -4px; }
    50%      { translate: 0 4px; }
  }
  .wg-mini-snake .wg-mini-head { z-index: 4; }
  .wg-mini-snake .wg-mini-head::after {
    content: '';
    position: absolute;
    top: 6px; right: 4px;
    width: 4px; height: 4px;
    border-radius: 50%;
    background: #021018;
  }
  .wg-mini-hat {
    position: absolute;
    top: -12px; left: 50%;
    transform: translateX(-50%);
    font-size: 14px;
    z-index: 5;
    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.5));
  }
  ```

- [ ] **Step 2: Implement `MiniSnakePreview.tsx`**

  Create `client/src/components/menu/MiniSnakePreview.tsx`:

  ```tsx
  import { HAT_OPTIONS, SNAKE_SKINS } from "../../../../shared/constants";

  type MiniSnakePreviewProps = {
    skinId: string;
    hatId: string;
  };

  export function MiniSnakePreview({ skinId, hatId }: MiniSnakePreviewProps) {
    const skin = SNAKE_SKINS.find((s) => s.id === skinId) ?? SNAKE_SKINS[0];
    const hat = HAT_OPTIONS.find((h) => h.id === hatId) ?? HAT_OPTIONS[0];
    const beadStyle = {
      background: skin.color,
      boxShadow: `0 0 14px ${skin.color}90, inset -3px -4px 0 rgba(0,0,0,0.18)`
    };
    return (
      <div className="wg-mini-stage" aria-label={`${skin.name} preview`}>
        <div className="wg-mini-snake">
          <i className="wg-mini-head" style={beadStyle}>
            {hat.id !== "none" ? <span className="wg-mini-hat">{hat.mark}</span> : null}
          </i>
          <i style={beadStyle} />
          <i style={beadStyle} />
          <i style={beadStyle} />
          <i style={beadStyle} />
          <i style={beadStyle} />
          <i style={beadStyle} />
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 3: Run typecheck**

  Run: `npx tsc --noEmit`

  Expected: 0 errors.

- [ ] **Step 4: Commit**

  ```bash
  git add client/src/components/menu/MiniSnakePreview.tsx client/src/styles.css
  git commit -m "feat(menu): add MiniSnakePreview with slithering animation"
  ```

---

## Task 5: SnakePreview3D Component

**Files:**
- Create: `client/src/components/menu/SnakePreview3D.tsx`
- Modify: `client/src/styles.css` (add `.wg-3d-*` classes)

- [ ] **Step 1: Add CSS for the 3D preview**

  Append to `client/src/styles.css`:

  ```css
  /* === 3D Forward-Slither Preview === */
  .wg-3d-stage {
    position: relative;
    background:
      radial-gradient(circle at 50% 30%, rgba(240, 181, 64, 0.18), transparent 60%),
      radial-gradient(circle at 50% 100%, rgba(217, 122, 60, 0.14), transparent 60%),
      linear-gradient(180deg, #1a140c 0%, #0a0703 100%);
    display: grid;
    place-items: center;
    padding: 40px;
    overflow: hidden;
    min-height: 540px;
  }
  .wg-3d-stage::before {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(240, 181, 64, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(240, 181, 64, 0.05) 1px, transparent 1px);
    background-size: 40px 40px;
    -webkit-mask-image: radial-gradient(circle at center, black 30%, transparent 80%);
    mask-image: radial-gradient(circle at center, black 30%, transparent 80%);
  }
  .wg-3d-stage::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image: repeating-linear-gradient(0deg, transparent 0, transparent 60px, rgba(240, 181, 64, 0.08) 60px, rgba(240, 181, 64, 0.08) 61px);
    -webkit-mask-image: radial-gradient(circle at center, black, transparent 70%);
    mask-image: radial-gradient(circle at center, black, transparent 70%);
    animation: wg-3d-stage-lines 2.5s linear infinite;
    opacity: 0.6;
  }
  @keyframes wg-3d-stage-lines {
    0%   { background-position: 0 -100px; }
    100% { background-position: 0 0; }
  }
  .wg-3d-floor {
    position: absolute;
    bottom: 88px;
    left: 50%;
    transform: translateX(-50%);
    width: 280px; height: 50px;
    background: radial-gradient(ellipse at center, rgba(240, 181, 64, 0.3), transparent 70%);
    border-radius: 50%;
    filter: blur(10px);
    animation: wg-3d-floor-pulse 1.6s ease-in-out infinite;
  }
  @keyframes wg-3d-floor-pulse {
    0%, 100% { opacity: 0.7; transform: translateX(-50%) scale(1); }
    50%      { opacity: 1;   transform: translateX(-50%) scale(1.05); }
  }
  .wg-3d-arena {
    position: relative;
    width: 320px; height: 320px;
    perspective: 1100px;
    transform-style: preserve-3d;
  }
  .wg-3d-cam {
    position: absolute;
    inset: 0;
    transform-style: preserve-3d;
    animation: wg-3d-cam-sway 12s ease-in-out infinite alternate;
  }
  @keyframes wg-3d-cam-sway {
    0%   { transform: rotateY(-12deg) rotateX(8deg); }
    100% { transform: rotateY(12deg)  rotateX(8deg); }
  }
  .wg-3d-bead-pos {
    position: absolute;
    top: 50%; left: 50%;
    transform-style: preserve-3d;
  }
  .wg-3d-bead-pos.b1  { transform: translate3d(0, -20px,  140px); }
  .wg-3d-bead-pos.b2  { transform: translate3d(0, -16px,  110px); }
  .wg-3d-bead-pos.b3  { transform: translate3d(0, -10px,   80px); }
  .wg-3d-bead-pos.b4  { transform: translate3d(0,  -4px,   50px); }
  .wg-3d-bead-pos.b5  { transform: translate3d(0,   0px,   20px); }
  .wg-3d-bead-pos.b6  { transform: translate3d(0,   2px,  -10px); }
  .wg-3d-bead-pos.b7  { transform: translate3d(0,   4px,  -40px); }
  .wg-3d-bead-pos.b8  { transform: translate3d(0,   6px,  -70px); }
  .wg-3d-bead-pos.b9  { transform: translate3d(0,   8px,  -98px); }
  .wg-3d-bead-pos.b10 { transform: translate3d(0,  10px, -124px); }
  .wg-3d-bead-pos.b11 { transform: translate3d(0,  12px, -148px); }
  .wg-3d-bead-pos.b12 { transform: translate3d(0,  14px, -168px); }
  .wg-3d-bead {
    position: absolute;
    top: 0; left: 0;
    width: 44px; height: 44px;
    margin: -22px 0 0 -22px;
    border-radius: 50%;
    box-shadow:
      0 0 24px rgba(240, 181, 64, 0.6),
      inset -6px -8px 0 rgba(0, 0, 0, 0.18);
    animation: wg-slither-3d 1.6s ease-in-out infinite;
  }
  .wg-3d-bead-pos.b1  .wg-3d-bead { width: 54px; height: 54px; margin: -27px 0 0 -27px; animation-delay: 0s; }
  .wg-3d-bead-pos.b2  .wg-3d-bead { width: 50px; height: 50px; margin: -25px 0 0 -25px; animation-delay: 0.07s; opacity: 0.97; }
  .wg-3d-bead-pos.b3  .wg-3d-bead { width: 46px; height: 46px; margin: -23px 0 0 -23px; animation-delay: 0.14s; opacity: 0.94; }
  .wg-3d-bead-pos.b4  .wg-3d-bead { animation-delay: 0.21s; opacity: 0.92; }
  .wg-3d-bead-pos.b5  .wg-3d-bead { animation-delay: 0.28s; opacity: 0.9; }
  .wg-3d-bead-pos.b6  .wg-3d-bead { animation-delay: 0.35s; opacity: 0.87; }
  .wg-3d-bead-pos.b7  .wg-3d-bead { animation-delay: 0.42s; opacity: 0.84; }
  .wg-3d-bead-pos.b8  .wg-3d-bead { width: 40px; height: 40px; margin: -20px 0 0 -20px; animation-delay: 0.49s; opacity: 0.78; }
  .wg-3d-bead-pos.b9  .wg-3d-bead { width: 36px; height: 36px; margin: -18px 0 0 -18px; animation-delay: 0.56s; opacity: 0.72; }
  .wg-3d-bead-pos.b10 .wg-3d-bead { width: 32px; height: 32px; margin: -16px 0 0 -16px; animation-delay: 0.63s; opacity: 0.62; }
  .wg-3d-bead-pos.b11 .wg-3d-bead { width: 26px; height: 26px; margin: -13px 0 0 -13px; animation-delay: 0.70s; opacity: 0.5; }
  .wg-3d-bead-pos.b12 .wg-3d-bead { width: 22px; height: 22px; margin: -11px 0 0 -11px; animation-delay: 0.77s; opacity: 0.4; }
  @keyframes wg-slither-3d {
    0%, 100% { transform: translate3d(14px, 0, 0); }
    50%      { transform: translate3d(-14px, 0, 0); }
  }
  .wg-3d-bead.head { z-index: 12; }
  .wg-3d-bead.head::before, .wg-3d-bead.head::after {
    content: '';
    position: absolute;
    width: 7px; height: 9px;
    background: var(--wg-coffee);
    border-radius: 50%;
    top: 36%;
    z-index: 2;
  }
  .wg-3d-bead.head::before { left: 24%; }
  .wg-3d-bead.head::after  { right: 24%; }
  .wg-3d-hat {
    position: absolute;
    top: -32px; left: 50%;
    transform: translateX(-50%);
    font-size: 42px;
    z-index: 13;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.5));
  }
  .wg-3d-name {
    position: absolute;
    bottom: 32px;
    left: 50%;
    transform: translateX(-50%);
    text-align: center;
    z-index: 10;
    white-space: nowrap;
  }
  .wg-3d-name .label {
    font-family: var(--wg-mono);
    font-size: 9px;
    letter-spacing: 0.4em;
    color: var(--wg-gold);
    font-weight: 700;
    margin-bottom: 6px;
  }
  .wg-3d-name .name {
    font-family: var(--wg-serif);
    font-style: italic;
    font-weight: 700;
    font-size: 30px;
    color: var(--wg-cream);
    font-variation-settings: 'opsz' 144;
    letter-spacing: -0.02em;
  }
  .wg-3d-name .meta {
    font-size: 10px;
    color: var(--wg-cream-mute);
    margin-top: 6px;
    letter-spacing: 0.1em;
  }
  ```

- [ ] **Step 2: Implement `SnakePreview3D.tsx`**

  Create `client/src/components/menu/SnakePreview3D.tsx`:

  ```tsx
  import { HAT_OPTIONS, SNAKE_SKINS } from "../../../../shared/constants";

  type SnakePreview3DProps = {
    skinId: string;
    hatId: string;
    label: string;
    name: string;
    meta: string;
  };

  export function SnakePreview3D({ skinId, hatId, label, name, meta }: SnakePreview3DProps) {
    const skin = SNAKE_SKINS.find((s) => s.id === skinId) ?? SNAKE_SKINS[0];
    const hat = HAT_OPTIONS.find((h) => h.id === hatId) ?? HAT_OPTIONS[0];
    const beadStyle = {
      background: `radial-gradient(circle at 30% 30%, ${skin.accent} 0%, ${skin.color} 40%, ${skin.shadow} 100%)`,
      boxShadow: `0 0 24px ${skin.color}99, inset -6px -8px 0 rgba(0,0,0,0.18)`
    };
    return (
      <div className="wg-3d-stage" aria-label={`${name} 3D preview`}>
        <div className="wg-3d-floor" />
        <div className="wg-3d-arena">
          <div className="wg-3d-cam">
            <div className="wg-3d-bead-pos b12"><div className="wg-3d-bead" style={beadStyle} /></div>
            <div className="wg-3d-bead-pos b11"><div className="wg-3d-bead" style={beadStyle} /></div>
            <div className="wg-3d-bead-pos b10"><div className="wg-3d-bead" style={beadStyle} /></div>
            <div className="wg-3d-bead-pos b9"><div className="wg-3d-bead" style={beadStyle} /></div>
            <div className="wg-3d-bead-pos b8"><div className="wg-3d-bead" style={beadStyle} /></div>
            <div className="wg-3d-bead-pos b7"><div className="wg-3d-bead" style={beadStyle} /></div>
            <div className="wg-3d-bead-pos b6"><div className="wg-3d-bead" style={beadStyle} /></div>
            <div className="wg-3d-bead-pos b5"><div className="wg-3d-bead" style={beadStyle} /></div>
            <div className="wg-3d-bead-pos b4"><div className="wg-3d-bead" style={beadStyle} /></div>
            <div className="wg-3d-bead-pos b3"><div className="wg-3d-bead" style={beadStyle} /></div>
            <div className="wg-3d-bead-pos b2"><div className="wg-3d-bead" style={beadStyle} /></div>
            <div className="wg-3d-bead-pos b1">
              <div className="wg-3d-bead head" style={beadStyle}>
                {hat.id !== "none" ? <div className="wg-3d-hat">{hat.mark}</div> : null}
              </div>
            </div>
          </div>
        </div>
        <div className="wg-3d-name">
          <div className="label">{label}</div>
          <div className="name">{name}</div>
          <div className="meta">{meta}</div>
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 3: Verify typecheck**

  Run: `npx tsc --noEmit`

  Expected: 0 errors.

- [ ] **Step 4: Commit**

  ```bash
  git add client/src/components/menu/SnakePreview3D.tsx client/src/styles.css
  git commit -m "feat(menu): add SnakePreview3D with forward-slither animation and camera sway"
  ```

---

## Task 6: WardrobeModal Shell

**Files:**
- Create: `client/src/components/menu/WardrobeModal.tsx`
- Modify: `client/src/styles.css` (add `.wg-modal-*` classes)

- [ ] **Step 1: Add modal CSS**

  Append to `client/src/styles.css`:

  ```css
  /* === Wardrobe Modal Shell === */
  .wg-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(8, 5, 2, 0.78);
    backdrop-filter: blur(20px) saturate(150%);
    -webkit-backdrop-filter: blur(20px) saturate(150%);
    z-index: 100;
    display: grid;
    place-items: center;
    padding: 40px;
    animation: wg-modal-fade 600ms var(--wg-ease-soft);
  }
  @keyframes wg-modal-fade {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  .wg-modal {
    background:
      radial-gradient(circle at 30% 0%, rgba(240, 181, 64, 0.1), transparent 50%),
      rgba(20, 14, 8, 0.96);
    border: 1px solid rgba(240, 181, 64, 0.25);
    border-radius: 24px;
    width: 100%;
    max-width: 920px;
    max-height: calc(100dvh - 80px);
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    overflow: hidden;
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.06) inset,
      0 30px 100px rgba(0, 0, 0, 0.7),
      0 0 0 1px rgba(240, 181, 64, 0.08);
    position: relative;
    animation: wg-modal-rise 700ms var(--wg-ease-soft);
  }
  @keyframes wg-modal-rise {
    from { opacity: 0; transform: translateY(30px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  .wg-modal::before, .wg-modal::after {
    content: '';
    position: absolute;
    width: 28px; height: 28px;
    border: 2px solid var(--wg-gold);
    pointer-events: none;
    z-index: 5;
  }
  .wg-modal::before { top: 14px; left: 14px;  border-right: 0; border-bottom: 0; }
  .wg-modal::after  { bottom: 14px; right: 14px; border-left: 0; border-top: 0; }
  .wg-modal-close {
    position: absolute;
    top: 18px; right: 18px;
    width: 34px; height: 34px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(245, 233, 211, 0.12);
    color: var(--wg-cream-dim);
    display: grid; place-items: center;
    cursor: pointer;
    z-index: 10;
    font-size: 18px;
    font-family: var(--wg-serif);
    transition: all 200ms;
  }
  .wg-modal-close:hover {
    border-color: var(--wg-ember);
    color: var(--wg-ember);
    transform: rotate(90deg);
  }

  .wg-modal-side {
    padding: 32px 28px;
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    gap: 16px;
    background: rgba(10, 7, 3, 0.5);
    overflow-y: auto;
  }
  .wg-modal-eyebrow {
    font-family: var(--wg-mono);
    font-size: 9px;
    letter-spacing: 0.5em;
    color: var(--wg-gold);
    font-weight: 700;
    text-transform: uppercase;
  }
  .wg-modal-title {
    font-family: var(--wg-serif);
    font-style: italic;
    font-weight: 700;
    font-size: 30px;
    line-height: 1.05;
    color: var(--wg-cream);
    font-variation-settings: 'opsz' 144;
    letter-spacing: -0.02em;
    margin: 4px 0 0;
  }
  .wg-modal-title .accent { color: var(--wg-gold); }
  .wg-modal-subtitle {
    font-family: var(--wg-serif);
    font-style: italic;
    font-size: 12.5px;
    color: var(--wg-cream-mute);
    line-height: 1.55;
    margin-top: 8px;
  }

  .wg-skin-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    align-content: start;
  }
  .wg-skin-card {
    position: relative;
    aspect-ratio: 1;
    border-radius: 12px;
    background: rgba(0, 0, 0, 0.32);
    border: 1px solid rgba(245, 233, 211, 0.06);
    cursor: pointer;
    overflow: hidden;
    transition: all 220ms var(--wg-ease-soft);
  }
  .wg-skin-card:hover {
    transform: translateY(-2px);
    border-color: rgba(240, 181, 64, 0.4);
  }
  .wg-skin-card.selected {
    border-color: var(--wg-gold);
    box-shadow: 0 0 0 2px rgba(240, 181, 64, 0.3), 0 8px 20px rgba(240, 181, 64, 0.2);
  }
  .wg-skin-swatch {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 44px; height: 44px;
    border-radius: 50%;
    display: grid; place-items: center;
    font-size: 24px;
  }
  .wg-skin-swatch.has-glow {
    box-shadow: 0 0 18px currentColor, inset -6px -8px 0 rgba(0, 0, 0, 0.18);
  }
  .wg-skin-card .wg-skin-name {
    position: absolute;
    bottom: 8px; left: 0; right: 0;
    text-align: center;
    font-family: var(--wg-serif);
    font-style: italic;
    font-size: 11px;
    font-weight: 600;
    color: var(--wg-cream);
  }
  .wg-skin-card .wg-skin-lock {
    position: absolute;
    top: 8px; right: 8px;
    font-size: 11px;
    color: var(--wg-cream-mute);
  }
  .wg-skin-card .wg-skin-rare {
    position: absolute;
    top: 6px; left: 6px;
    font-family: var(--wg-mono);
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: var(--wg-cream-mute);
    background: rgba(0, 0, 0, 0.5);
    padding: 2px 5px;
    border-radius: 3px;
  }
  .wg-skin-card.locked .wg-skin-swatch { filter: grayscale(0.85) brightness(0.45); }
  .wg-skin-card.locked .wg-skin-name { color: var(--wg-cream-mute); }

  .wg-equip-row { display: grid; grid-template-columns: auto 1fr; gap: 10px; }
  .wg-equip-btn {
    padding: 14px 22px;
    background: linear-gradient(135deg, #fff8e7, var(--wg-cream));
    color: var(--wg-coffee);
    border: none;
    border-radius: 12px;
    font-family: var(--wg-serif);
    font-style: italic;
    font-weight: 700;
    font-size: 16px;
    cursor: pointer;
    transition: all 200ms var(--wg-ease-snap);
    display: flex; align-items: center; justify-content: center; gap: 8px;
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.6) inset,
      0 -2px 0 rgba(180, 140, 80, 0.35) inset,
      0 8px 22px rgba(240, 181, 64, 0.25);
  }
  .wg-equip-btn:hover {
    transform: translateY(-2px);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.6) inset,
      0 -2px 0 rgba(180, 140, 80, 0.35) inset,
      0 12px 28px rgba(240, 181, 64, 0.4);
  }
  .wg-cancel-btn {
    padding: 14px;
    background: transparent;
    color: var(--wg-cream-dim);
    border: 1px solid rgba(245, 233, 211, 0.1);
    border-radius: 12px;
    font-family: var(--wg-sans);
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 200ms;
  }
  .wg-cancel-btn:hover { border-color: var(--wg-ember); color: var(--wg-ember); }

  @media (max-width: 760px) {
    .wg-modal { grid-template-columns: 1fr; }
    .wg-modal-side { padding: 24px 20px; }
  }
  ```

- [ ] **Step 2: Implement `WardrobeModal.tsx`**

  Create `client/src/components/menu/WardrobeModal.tsx`:

  ```tsx
  import { useEffect, type ReactNode } from "react";

  type WardrobeModalProps = {
    open: boolean;
    onClose: () => void;
    preview: ReactNode;
    side: ReactNode;
  };

  export function WardrobeModal({ open, onClose, preview, side }: WardrobeModalProps) {
    useEffect(() => {
      if (!open) return;
      const onKey = (event: KeyboardEvent) => {
        if (event.key === "Escape") onClose();
      };
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    if (!open) return null;
    return (
      <div className="wg-modal-overlay" role="dialog" aria-modal="true" onClick={onClose}>
        <div className="wg-modal" onClick={(event) => event.stopPropagation()}>
          <button className="wg-modal-close" type="button" aria-label="Close" onClick={onClose}>×</button>
          {preview}
          {side}
        </div>
      </div>
    );
  }
  ```

- [ ] **Step 3: Verify typecheck**

  Run: `npx tsc --noEmit`

  Expected: 0 errors.

- [ ] **Step 4: Commit**

  ```bash
  git add client/src/components/menu/WardrobeModal.tsx client/src/styles.css
  git commit -m "feat(menu): add WardrobeModal shell with overlay and ESC close"
  ```

---

## Task 7: SkinPicker & HatPicker

**Files:**
- Create: `client/src/components/menu/SkinPicker.tsx`
- Create: `client/src/components/menu/HatPicker.tsx`

- [ ] **Step 1: Implement `SkinPicker.tsx`**

  Create `client/src/components/menu/SkinPicker.tsx`:

  ```tsx
  import { useState } from "react";
  import { SNAKE_SKINS } from "../../../../shared/constants";
  import { SnakePreview3D } from "./SnakePreview3D";
  import { WardrobeModal } from "./WardrobeModal";

  type SkinPickerProps = {
    open: boolean;
    onClose: () => void;
    skinId: string;
    hatId: string;
    onChange: (skinId: string) => void;
  };

  const SKIN_RARITY: Record<string, string> = {
    "cyan-core": "CMN",
    "embercoil": "CMN",
    "venom-lime": "CMN",
    "void-violet": "EPIC",
    "solar-gold": "RARE"
  };

  export function SkinPicker({ open, onClose, skinId, hatId, onChange }: SkinPickerProps) {
    const [draft, setDraft] = useState(skinId);
    const selected = SNAKE_SKINS.find((s) => s.id === draft) ?? SNAKE_SKINS[0];
    const handleEquip = () => {
      onChange(draft);
      onClose();
    };
    const handleCancel = () => {
      setDraft(skinId);
      onClose();
    };
    return (
      <WardrobeModal
        open={open}
        onClose={handleCancel}
        preview={
          <SnakePreview3D
            skinId={draft}
            hatId={hatId}
            label="· · · CURRENT SELECTION · · ·"
            name={selected.name}
            meta={SKIN_RARITY[selected.id] ?? "CMN"}
          />
        }
        side={
          <div className="wg-modal-side">
            <div className="wg-modal-eyebrow">CHAPTER · I</div>
            <div>
              <div className="wg-modal-title">Choose your <span className="accent">silhouette</span></div>
              <div className="wg-modal-subtitle">A skin is a vessel — that decides whether they remember you tomorrow.</div>
            </div>
            <div className="wg-skin-grid" role="radiogroup" aria-label="Skin options">
              {SNAKE_SKINS.map((skin) => {
                const rare = SKIN_RARITY[skin.id] ?? "CMN";
                return (
                  <button
                    key={skin.id}
                    type="button"
                    role="radio"
                    aria-checked={skin.id === draft}
                    aria-label={skin.name}
                    className={skin.id === draft ? "wg-skin-card selected" : "wg-skin-card"}
                    onClick={() => setDraft(skin.id)}
                  >
                    <div className="wg-skin-rare" style={rare === "EPIC" ? { color: "var(--wg-ember)" } : rare === "RARE" ? { color: "var(--wg-gold)" } : undefined}>{rare}</div>
                    <div
                      className="wg-skin-swatch has-glow"
                      style={{ background: `linear-gradient(135deg, ${skin.color}, ${skin.shadow})`, color: skin.color }}
                    />
                    <div className="wg-skin-name">{skin.name}</div>
                  </button>
                );
              })}
            </div>
            <div className="wg-equip-row">
              <button className="wg-cancel-btn" type="button" onClick={handleCancel}>Cancel</button>
              <button className="wg-equip-btn" type="button" onClick={handleEquip}>Wear &nbsp;<span style={{ fontStyle: "normal" }}>→</span></button>
            </div>
          </div>
        }
      />
    );
  }
  ```

- [ ] **Step 2: Implement `HatPicker.tsx`**

  Create `client/src/components/menu/HatPicker.tsx`:

  ```tsx
  import { useState } from "react";
  import { HAT_OPTIONS } from "../../../../shared/constants";
  import { SnakePreview3D } from "./SnakePreview3D";
  import { WardrobeModal } from "./WardrobeModal";

  type HatPickerProps = {
    open: boolean;
    onClose: () => void;
    skinId: string;
    hatId: string;
    onChange: (hatId: string) => void;
  };

  const RARITY_COLOR: Record<string, string> = {
    myth: "var(--wg-ember)",
    rare: "var(--wg-gold)",
    common: "",
    locked: "",
    "": ""
  };

  const RARITY_LABEL: Record<string, string> = {
    myth: "MYTH",
    rare: "RARE",
    common: "CMN",
    locked: "—",
    "": "—"
  };

  export function HatPicker({ open, onClose, skinId, hatId, onChange }: HatPickerProps) {
    const [draft, setDraft] = useState(hatId);
    const selected = HAT_OPTIONS.find((h) => h.id === draft) ?? HAT_OPTIONS[0];
    const handleEquip = () => {
      onChange(draft);
      onClose();
    };
    const handleCancel = () => {
      setDraft(hatId);
      onClose();
    };
    const meta = selected.id === "none" ? "—" : selected.rarity.toUpperCase();
    return (
      <WardrobeModal
        open={open}
        onClose={handleCancel}
        preview={
          <SnakePreview3D
            skinId={skinId}
            hatId={draft}
            label="· · · CURRENT SELECTION · · ·"
            name={selected.name}
            meta={meta}
          />
        }
        side={
          <div className="wg-modal-side">
            <div className="wg-modal-eyebrow">CHAPTER · II</div>
            <div>
              <div className="wg-modal-title">Crown the <span className="accent">head</span></div>
              <div className="wg-modal-subtitle">A hat does nothing for your speed — it does everything for the silence afterwards.</div>
            </div>
            <div className="wg-skin-grid" role="radiogroup" aria-label="Hat options">
              {HAT_OPTIONS.map((hat) => {
                const isLocked = hat.rarity === "locked";
                return (
                  <button
                    key={hat.id}
                    type="button"
                    role="radio"
                    aria-checked={hat.id === draft}
                    aria-label={hat.name}
                    aria-disabled={isLocked}
                    className={
                      hat.id === draft
                        ? "wg-skin-card selected"
                        : isLocked
                          ? "wg-skin-card locked"
                          : "wg-skin-card"
                    }
                    onClick={() => { if (!isLocked) setDraft(hat.id); }}
                  >
                    {isLocked ? <div className="wg-skin-lock">🔒</div> : <div className="wg-skin-rare" style={{ color: RARITY_COLOR[hat.rarity] }}>{RARITY_LABEL[hat.rarity]}</div>}
                    <div
                      className="wg-skin-swatch"
                      style={{
                        background: hat.id === draft ? "rgba(240,181,64,0.12)" : "rgba(245,233,211,0.05)",
                        boxShadow: hat.id === draft ? "0 0 18px rgba(240,181,64,0.4)" : "none"
                      }}
                    >
                      {hat.mark}
                    </div>
                    <div className="wg-skin-name">{hat.name}</div>
                  </button>
                );
              })}
            </div>
            <div className="wg-equip-row">
              <button className="wg-cancel-btn" type="button" onClick={handleCancel}>Cancel</button>
              <button className="wg-equip-btn" type="button" onClick={handleEquip}>Wear &nbsp;<span style={{ fontStyle: "normal" }}>→</span></button>
            </div>
          </div>
        }
      />
    );
  }
  ```

- [ ] **Step 3: Run typecheck**

  Run: `npx tsc --noEmit`

  Expected: 0 errors.

- [ ] **Step 4: Commit**

  ```bash
  git add client/src/components/menu/SkinPicker.tsx client/src/components/menu/HatPicker.tsx
  git commit -m "feat(menu): add SkinPicker and HatPicker modal contents"
  ```

---

## Task 8: LoadoutPanel & LifetimePanel

**Files:**
- Create: `client/src/components/menu/LoadoutPanel.tsx`
- Create: `client/src/components/menu/LifetimePanel.tsx`
- Modify: `client/src/styles.css` (`.wg-loadout-*`, `.wg-stat-*`, `.wg-tier-*`)

- [ ] **Step 1: Add loadout + stats CSS**

  Append to `client/src/styles.css`:

  ```css
  /* === Loadout summary rows === */
  .wg-loadout-summary { display: grid; gap: 8px; }
  .wg-loadout-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 14px;
    background: rgba(0, 0, 0, 0.22);
    border-radius: 10px;
    border: 1px solid rgba(245, 233, 211, 0.05);
    font-size: 12px;
    cursor: pointer;
    transition: all 200ms var(--wg-ease-soft);
    color: inherit;
    width: 100%;
    text-align: left;
    font: inherit;
  }
  .wg-loadout-row:hover {
    border-color: rgba(240, 181, 64, 0.3);
    background: rgba(240, 181, 64, 0.05);
    transform: translateX(2px);
  }
  .wg-loadout-row .lbl {
    color: var(--wg-cream-mute);
    text-transform: uppercase;
    font-size: 9px;
    letter-spacing: 0.2em;
    font-weight: 700;
  }
  .wg-loadout-row .val {
    display: flex; align-items: center; gap: 8px;
    color: var(--wg-cream);
    font-family: var(--wg-serif);
    font-style: italic;
    font-weight: 600;
    font-size: 13px;
  }
  .wg-loadout-row .swatch {
    width: 14px; height: 14px;
    border-radius: 4px;
  }
  .wg-loadout-row .arrow { color: var(--wg-gold); font-size: 10px; }

  .wg-loadout-edit-btn {
    margin-top: 14px;
    width: 100%;
    padding: 12px;
    background: transparent;
    border: 1px solid var(--wg-gold);
    border-radius: 10px;
    color: var(--wg-gold);
    font-family: var(--wg-sans);
    font-weight: 700;
    font-size: 11px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 250ms var(--wg-ease-soft);
  }
  .wg-loadout-edit-btn:hover {
    background: rgba(240, 181, 64, 0.1);
    letter-spacing: 0.22em;
  }

  /* === Stats grid === */
  .wg-stats-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .wg-stat-block {
    padding: 12px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 10px;
    border: 1px solid rgba(245, 233, 211, 0.04);
  }
  .wg-stat-num {
    font-family: var(--wg-serif);
    font-weight: 700;
    font-size: 26px;
    color: var(--wg-gold);
    font-variant-numeric: tabular-nums;
    font-variation-settings: 'opsz' 144;
    line-height: 1;
  }
  .wg-stat-num.cream { color: var(--wg-cream); }
  .wg-stat-num.amber { color: var(--wg-amber); }
  .wg-stat-num.ember { color: var(--wg-ember); }
  .wg-stat-label {
    font-size: 9px;
    color: var(--wg-cream-mute);
    letter-spacing: 0.2em;
    font-weight: 700;
    text-transform: uppercase;
    margin-top: 6px;
  }
  .wg-tier-badge {
    margin-top: 14px;
    padding: 12px 14px;
    background: linear-gradient(135deg, rgba(240, 181, 64, 0.12), rgba(217, 122, 60, 0.05));
    border: 1px solid rgba(240, 181, 64, 0.25);
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .wg-tier-icon {
    width: 32px; height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--wg-gold), var(--wg-amber));
    display: grid; place-items: center;
    font-family: var(--wg-serif);
    font-style: italic;
    font-weight: 800;
    color: var(--wg-coffee);
    box-shadow: 0 0 16px rgba(240, 181, 64, 0.5);
    flex-shrink: 0;
    font-size: 12px;
  }
  .wg-tier-info { flex: 1; }
  .wg-tier-name {
    font-family: var(--wg-serif);
    font-style: italic;
    font-size: 14px;
    font-weight: 600;
    color: var(--wg-cream);
  }
  .wg-tier-progress {
    height: 4px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 2px;
    margin-top: 6px;
    overflow: hidden;
  }
  .wg-tier-progress > i {
    display: block; height: 100%;
    background: linear-gradient(90deg, var(--wg-gold), var(--wg-amber));
    border-radius: 2px;
  }
  .wg-tier-num {
    font-family: var(--wg-mono);
    font-size: 9px;
    color: var(--wg-gold);
    letter-spacing: 0.1em;
    font-weight: 700;
  }
  ```

- [ ] **Step 2: Implement `LoadoutPanel.tsx`**

  Create `client/src/components/menu/LoadoutPanel.tsx`:

  ```tsx
  import { HAT_OPTIONS, ROPE_ACCESSORIES, SNAKE_SKINS } from "../../../../shared/constants";
  import { MiniSnakePreview } from "./MiniSnakePreview";

  type LoadoutPanelProps = {
    skinId: string;
    hatId: string;
    ropeAccessoryId: string;
    onOpenSkin: () => void;
    onOpenHat: () => void;
    onOpenCharm: () => void;
  };

  export function LoadoutPanel({ skinId, hatId, ropeAccessoryId, onOpenSkin, onOpenHat, onOpenCharm }: LoadoutPanelProps) {
    const skin = SNAKE_SKINS.find((s) => s.id === skinId) ?? SNAKE_SKINS[0];
    const hat = HAT_OPTIONS.find((h) => h.id === hatId) ?? HAT_OPTIONS[0];
    const rope = ROPE_ACCESSORIES.find((r) => r.id === ropeAccessoryId) ?? ROPE_ACCESSORIES[0];

    return (
      <section className="wg-panel" aria-label="Loadout">
        <div className="wg-panel-header">
          <div className="wg-panel-title">Loadout</div>
          <div className="wg-panel-meta">III SLOTS</div>
        </div>
        <MiniSnakePreview skinId={skinId} hatId={hatId} />
        <div className="wg-loadout-summary">
          <button type="button" className="wg-loadout-row" onClick={onOpenSkin}>
            <span className="lbl">Skin</span>
            <span className="val">
              <span className="swatch" style={{ background: skin.color, boxShadow: `0 0 8px ${skin.color}99` }} />
              {skin.name}
              <span className="arrow">▸</span>
            </span>
          </button>
          <button type="button" className="wg-loadout-row" onClick={onOpenHat}>
            <span className="lbl">Hat</span>
            <span className="val">
              {hat.id !== "none" ? <span>{hat.mark}</span> : null}
              {hat.name}
              <span className="arrow">▸</span>
            </span>
          </button>
          <button type="button" className="wg-loadout-row" onClick={onOpenCharm}>
            <span className="lbl">Charm</span>
            <span className="val">
              {rope.id !== "none" ? <span>{ropeMarkOf(rope.id)}</span> : null}
              {rope.name}
              <span className="arrow">▸</span>
            </span>
          </button>
        </div>
        <button type="button" className="wg-loadout-edit-btn" onClick={onOpenSkin}>▸ Open Wardrobe</button>
      </section>
    );
  }

  function ropeMarkOf(id: string): string {
    switch (id) {
      case "skull":   return "☠️";
      case "star":    return "⭐";
      case "diamond": return "💎";
      case "bolt":    return "⚡";
      case "fire":    return "🔥";
      case "eye":     return "👁️";
      case "heart":   return "❤️";
      default:        return "";
    }
  }
  ```

- [ ] **Step 3: Implement `LifetimePanel.tsx`**

  Create `client/src/components/menu/LifetimePanel.tsx`:

  ```tsx
  import { deriveTier, type StoredStats } from "../../lib/stats";

  type LifetimePanelProps = {
    stats: StoredStats;
  };

  function formatPlayed(sec: number): string {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}`;
    return `${m}m`;
  }

  function toRoman(n: number): string {
    const r = ["I", "II", "III", "IV", "V", "VI", "VII"];
    return r[Math.max(0, Math.min(r.length - 1, n))];
  }

  export function LifetimePanel({ stats }: LifetimePanelProps) {
    const tier = deriveTier(stats);
    return (
      <section className="wg-panel" aria-label="Lifetime stats">
        <div className="wg-panel-header">
          <div className="wg-panel-title">Lifetime</div>
          <div className="wg-panel-meta">{stats.gamesPlayed} GAMES</div>
        </div>
        <div className="wg-stats-grid">
          <div className="wg-stat-block">
            <div className="wg-stat-num">{stats.bestScore.toLocaleString()}</div>
            <div className="wg-stat-label">Best Score</div>
          </div>
          <div className="wg-stat-block">
            <div className="wg-stat-num cream">{stats.totalKills}</div>
            <div className="wg-stat-label">Total Kills</div>
          </div>
          <div className="wg-stat-block">
            <div className="wg-stat-num amber">{formatPlayed(stats.totalPlayedSec)}</div>
            <div className="wg-stat-label">Played</div>
          </div>
          <div className="wg-stat-block">
            <div className="wg-stat-num ember">{stats.winStreak}</div>
            <div className="wg-stat-label">Win Streak</div>
          </div>
        </div>
        <div className="wg-tier-badge">
          <div className="wg-tier-icon">{toRoman(tier.index)}</div>
          <div className="wg-tier-info">
            <div className="wg-tier-name">{tier.name}</div>
            <div className="wg-tier-progress"><i style={{ width: `${Math.round(tier.progress * 100)}%` }} /></div>
          </div>
          <div className="wg-tier-num">{Math.min(tier.points, tier.nextThreshold)}/{tier.nextThreshold}</div>
        </div>
      </section>
    );
  }
  ```

- [ ] **Step 4: Run typecheck**

  Run: `npx tsc --noEmit`

  Expected: 0 errors.

- [ ] **Step 5: Commit**

  ```bash
  git add client/src/components/menu/LoadoutPanel.tsx client/src/components/menu/LifetimePanel.tsx client/src/styles.css
  git commit -m "feat(menu): add LoadoutPanel and LifetimePanel"
  ```

---

## Task 9: CenterPanel & ArenaHallPanel

**Files:**
- Create: `client/src/components/menu/CenterPanel.tsx`
- Create: `client/src/components/menu/ArenaHallPanel.tsx`
- Modify: `client/src/styles.css` (`.wg-center-*`, `.wg-lb-*`, `.wg-daily-*`, `.wg-news-*`, `.wg-region-*`, `.wg-name-*`, `.wg-play-*`, `.wg-secondary-*`)

- [ ] **Step 1: Add center + right panel CSS**

  Append to `client/src/styles.css`:

  ```css
  /* === Center panel === */
  .wg-center-panel {
    background: rgba(20, 14, 8, 0.55);
    border: 1px solid var(--wg-panel-border-strong);
    border-radius: 22px;
    padding: 38px 38px 30px;
    backdrop-filter: blur(28px) saturate(150%);
    -webkit-backdrop-filter: blur(28px) saturate(150%);
    display: grid;
    gap: 18px;
    position: relative;
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.06) inset,
      0 24px 80px rgba(0, 0, 0, 0.5);
  }
  .wg-center-panel::before, .wg-center-panel::after {
    content: '';
    position: absolute;
    width: 24px; height: 24px;
    border: 1.5px solid var(--wg-gold);
    pointer-events: none;
  }
  .wg-center-panel::before { top: 14px; left: 14px;  border-right: 0; border-bottom: 0; }
  .wg-center-panel::after  { bottom: 14px; right: 14px; border-left: 0; border-top: 0; }

  .wg-brand-block { text-align: center; padding-top: 4px; }
  .wg-brand-eyebrow {
    font-family: var(--wg-mono);
    font-size: 9px;
    letter-spacing: 0.5em;
    color: var(--wg-gold);
    font-weight: 700;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .wg-logo {
    font-family: var(--wg-serif);
    font-weight: 900;
    font-size: 64px;
    font-variation-settings: 'opsz' 144;
    line-height: 0.95;
    letter-spacing: -0.04em;
    background: linear-gradient(170deg, #fff8e7 0%, var(--wg-gold) 50%, var(--wg-amber) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    margin: 0;
  }
  .wg-logo .amp {
    font-style: italic;
    font-weight: 400;
    font-size: 0.7em;
    vertical-align: 0.05em;
    margin: 0 -0.05em;
  }
  .wg-brand-tagline {
    font-family: var(--wg-serif);
    font-style: italic;
    font-weight: 400;
    font-size: 14px;
    color: var(--wg-cream-dim);
    margin-top: 8px;
    letter-spacing: 0.01em;
  }

  .wg-divider {
    display: flex; align-items: center; gap: 12px;
    margin: 0 auto;
    width: 60%;
  }
  .wg-divider::before, .wg-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(240, 181, 64, 0.5), transparent);
  }
  .wg-divider .dot {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: var(--wg-gold);
    box-shadow: 0 0 8px var(--wg-gold);
  }

  .wg-region-row { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; }
  .wg-region-chip {
    padding: 6px 12px;
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(245, 233, 211, 0.08);
    border-radius: 999px;
    font-size: 10px;
    font-weight: 600;
    color: var(--wg-cream-mute);
    letter-spacing: 0.06em;
    cursor: pointer;
    display: flex; align-items: center; gap: 6px;
    transition: all 200ms var(--wg-ease-soft);
    font-family: var(--wg-mono);
  }
  .wg-region-chip.active {
    border-color: var(--wg-gold);
    color: var(--wg-gold);
    background: rgba(240, 181, 64, 0.08);
  }
  .wg-region-chip .ping {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: #5dd0a3;
    box-shadow: 0 0 6px #5dd0a3;
  }

  .wg-name-input-wrap {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 20px;
    background: rgba(0, 0, 0, 0.42);
    border: 1px solid rgba(245, 233, 211, 0.12);
    border-radius: 14px;
    transition: all 200ms var(--wg-ease-soft);
  }
  .wg-name-input-wrap:focus-within { border-color: var(--wg-gold); }
  .wg-name-input-icon {
    width: 30px; height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--wg-gold), var(--wg-amber));
    display: grid; place-items: center;
    color: var(--wg-coffee);
    font-weight: 800;
    font-size: 13px;
    font-family: var(--wg-serif);
    font-style: italic;
  }
  .wg-name-input {
    flex: 1;
    font-family: var(--wg-serif);
    font-size: 22px;
    font-weight: 600;
    color: var(--wg-cream);
    background: transparent;
    border: none;
    outline: none;
    letter-spacing: -0.01em;
    font-variation-settings: 'opsz' 144;
  }
  .wg-name-meta {
    font-family: var(--wg-mono);
    font-size: 10px;
    color: var(--wg-cream-mute);
    letter-spacing: 0.15em;
  }

  .wg-play-btn {
    position: relative;
    padding: 22px 28px;
    background: linear-gradient(135deg, #fff8e7 0%, var(--wg-cream) 100%);
    color: var(--wg-coffee);
    border: none;
    border-radius: 18px;
    font-family: var(--wg-serif);
    font-style: italic;
    font-weight: 700;
    font-size: 22px;
    letter-spacing: -0.01em;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    font-variation-settings: 'opsz' 144;
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.6) inset,
      0 -3px 0 rgba(180, 140, 80, 0.4) inset,
      0 14px 40px rgba(240, 181, 64, 0.35),
      0 24px 60px rgba(0, 0, 0, 0.4);
    overflow: hidden;
    text-align: left;
    transition: transform 220ms var(--wg-ease-snap), box-shadow 220ms var(--wg-ease-soft);
  }
  .wg-play-btn:hover {
    transform: translateY(-3px);
    box-shadow:
      0 1px 0 rgba(255, 255, 255, 0.6) inset,
      0 -3px 0 rgba(180, 140, 80, 0.4) inset,
      0 22px 50px rgba(240, 181, 64, 0.5),
      0 30px 70px rgba(0, 0, 0, 0.5);
  }
  .wg-play-btn::before {
    content: '';
    position: absolute;
    top: 0; bottom: 0; left: -50%;
    width: 50%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent);
    animation: wg-shimmer 4s ease-in-out infinite;
  }
  @keyframes wg-shimmer {
    0%, 70%  { left: -50%; }
    100%     { left: 150%; }
  }
  .wg-play-btn .arrow-circle {
    width: 42px; height: 42px;
    border-radius: 50%;
    background: var(--wg-coffee);
    color: var(--wg-gold);
    display: grid; place-items: center;
    font-style: normal;
    font-size: 18px;
    font-weight: 700;
    flex-shrink: 0;
    font-family: var(--wg-sans);
  }
  .wg-play-btn small {
    display: block;
    font-style: normal;
    font-family: var(--wg-mono);
    font-size: 9px;
    letter-spacing: 0.3em;
    font-weight: 700;
    color: rgba(14, 10, 6, 0.55);
    margin-bottom: 2px;
  }

  .wg-secondary-row {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
  }
  .wg-secondary-btn {
    padding: 12px 8px;
    background: transparent;
    border: 1px solid rgba(245, 233, 211, 0.1);
    border-radius: 10px;
    color: var(--wg-cream-dim);
    font-family: var(--wg-sans);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    transition: all 200ms var(--wg-ease-soft);
  }
  .wg-secondary-btn:hover {
    border-color: var(--wg-gold);
    color: var(--wg-gold);
  }
  .wg-secondary-btn .icon { font-size: 16px; margin-bottom: 2px; }

  /* === Right panel: leaderboard, daily, news === */
  .wg-lb-list { margin-top: 4px; display: grid; gap: 2px; }
  .wg-lb-row {
    display: grid;
    grid-template-columns: 22px 1fr auto;
    gap: 10px;
    align-items: center;
    padding: 7px 8px;
    border-radius: 6px;
    transition: background 180ms;
  }
  .wg-lb-row:hover { background: rgba(245, 233, 211, 0.04); }
  .wg-lb-rank {
    font-family: var(--wg-mono);
    font-weight: 700;
    font-size: 10px;
    color: var(--wg-cream-mute);
    text-align: center;
    letter-spacing: 0.05em;
  }
  .wg-lb-row.top1 .wg-lb-rank { color: var(--wg-gold); }
  .wg-lb-row.top2 .wg-lb-rank { color: var(--wg-cream); }
  .wg-lb-row.top3 .wg-lb-rank { color: var(--wg-amber); }
  .wg-lb-name {
    font-family: var(--wg-sans);
    font-weight: 600;
    font-size: 12px;
    color: var(--wg-cream);
    display: flex; align-items: center; gap: 8px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  .wg-lb-color {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
    box-shadow: 0 0 6px currentColor;
  }
  .wg-lb-score {
    font-family: var(--wg-mono);
    font-size: 11px;
    font-weight: 700;
    color: var(--wg-cream);
    font-variant-numeric: tabular-nums;
  }
  .wg-lb-row.you {
    background: linear-gradient(90deg, rgba(240, 181, 64, 0.1), transparent);
    border-left: 2px solid var(--wg-gold);
    padding-left: 6px;
  }
  .wg-lb-row.you .wg-lb-name, .wg-lb-row.you .wg-lb-score { color: var(--wg-gold); }

  .wg-daily {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid rgba(245, 233, 211, 0.06);
  }
  .wg-daily-header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
  .wg-daily-name {
    font-family: var(--wg-serif);
    font-style: italic;
    font-weight: 600;
    font-size: 14px;
    color: var(--wg-cream);
  }
  .wg-daily-time {
    font-family: var(--wg-mono);
    font-size: 9px;
    color: var(--wg-ember);
    letter-spacing: 0.1em;
    font-weight: 700;
  }
  .wg-daily-desc {
    font-size: 11px;
    color: var(--wg-cream-dim);
    line-height: 1.5;
    margin-bottom: 10px;
  }
  .wg-daily-bar {
    height: 6px;
    background: rgba(0, 0, 0, 0.4);
    border-radius: 3px;
    overflow: hidden;
    position: relative;
  }
  .wg-daily-bar > i {
    display: block; height: 100%;
    background: linear-gradient(90deg, var(--wg-gold), var(--wg-amber));
    border-radius: 3px;
    position: relative;
  }
  .wg-daily-bar > i::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.5), transparent);
    animation: wg-bar-shine 3s ease-in-out infinite;
  }
  @keyframes wg-bar-shine {
    0%, 100% { transform: translateX(-100%); }
    50%      { transform: translateX(100%); }
  }
  .wg-daily-meta {
    display: flex; justify-content: space-between; margin-top: 8px;
    font-family: var(--wg-mono);
    font-size: 10px;
    font-weight: 700;
  }
  .wg-daily-meta .progress { color: var(--wg-cream); }
  .wg-daily-meta .reward { color: var(--wg-gold); }

  .wg-news-strip {
    margin-top: 14px;
    padding: 9px 12px;
    background: rgba(232, 90, 79, 0.08);
    border: 1px solid rgba(232, 90, 79, 0.2);
    border-radius: 10px;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .wg-news-pulse {
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--wg-ember);
    box-shadow: 0 0 8px var(--wg-ember);
    animation: wg-news-pulse 1.4s ease-in-out infinite;
    flex-shrink: 0;
  }
  @keyframes wg-news-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%      { transform: scale(1.4); opacity: 0.6; }
  }
  .wg-news-text {
    font-size: 11px;
    color: var(--wg-cream);
    line-height: 1.4;
  }
  .wg-news-text b { color: var(--wg-ember); font-family: var(--wg-mono); font-weight: 700; }
  ```

- [ ] **Step 2: Implement `CenterPanel.tsx`**

  Create `client/src/components/menu/CenterPanel.tsx`:

  ```tsx
  type CenterPanelProps = {
    name: string;
    onNameChange: (name: string) => void;
    onStart: () => void;
    onSettings: () => void;
    onStats: () => void;
    onHowToPlay: () => void;
    latencyMs?: number;
  };

  export function CenterPanel({ name, onNameChange, onStart, onSettings, onStats, onHowToPlay, latencyMs }: CenterPanelProps) {
    const ping = typeof latencyMs === "number" && latencyMs > 0 ? `${latencyMs}ms` : "—";
    const trimmed = name.trim() || "You";
    return (
      <section className="wg-center-panel" aria-label="Arena entry">
        <div className="wg-brand-block">
          <div className="wg-brand-eyebrow">Multiplayer · Persistent · 2026</div>
          <h1 className="wg-logo">Slither<span className="amp">&amp;</span>a</h1>
          <div className="wg-brand-tagline">Pour. Coil. Devour. — A cozy carnage for refined serpents.</div>
        </div>
        <div className="wg-divider"><span className="dot" /></div>
        <div className="wg-region-row">
          <div className="wg-region-chip active"><span className="ping" />EU-Frankfurt · {ping}</div>
          <div className="wg-region-chip">US-East · 92ms</div>
          <div className="wg-region-chip">Asia · 180ms</div>
        </div>
        <label className="wg-name-input-wrap">
          <span className="wg-name-input-icon" aria-hidden="true">◈</span>
          <input
            className="wg-name-input"
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            maxLength={16}
            aria-label="Player name"
          />
          <span className="wg-name-meta">{name.length}/16</span>
        </label>
        <button type="button" className="wg-play-btn" onClick={onStart}>
          <div>
            <small>BEGIN THE ARENA</small>
            <span>Enter as {trimmed}</span>
          </div>
          <span className="arrow-circle">→</span>
        </button>
        <div className="wg-secondary-row">
          <button type="button" className="wg-secondary-btn" onClick={onSettings}>
            <span className="icon">⚙</span><span>Settings</span>
          </button>
          <button type="button" className="wg-secondary-btn" onClick={onStats}>
            <span className="icon">📊</span><span>Stats</span>
          </button>
          <button type="button" className="wg-secondary-btn" onClick={onHowToPlay}>
            <span className="icon">❔</span><span>How to Play</span>
          </button>
        </div>
      </section>
    );
  }
  ```

- [ ] **Step 3: Implement `ArenaHallPanel.tsx`**

  Create `client/src/components/menu/ArenaHallPanel.tsx`:

  ```tsx
  import type { LeaderboardEntry } from "../../../../shared/types";
  import { formatCountdown, type DailyChallenge } from "../../lib/daily";

  type ArenaHallPanelProps = {
    leaderboard: LeaderboardEntry[];
    online: number;
    daily: DailyChallenge;
    countdownSec: number;
  };

  const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

  export function ArenaHallPanel({ leaderboard, online, daily, countdownSec }: ArenaHallPanelProps) {
    const slice = leaderboard.slice(0, 6);
    const progressPct = Math.max(0, Math.min(100, Math.round((daily.progress / Math.max(1, daily.target)) * 100)));
    return (
      <section className="wg-panel" aria-label="Arena hall">
        <div className="wg-panel-header">
          <div className="wg-panel-title">The Hall</div>
          <div className="wg-panel-meta">LIVE · {online} ON</div>
        </div>
        <div className="wg-lb-list" aria-label="Leaderboard">
          {slice.map((entry, i) => (
            <div
              key={entry.id}
              className={[
                "wg-lb-row",
                i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : "",
                entry.you ? "you" : ""
              ].filter(Boolean).join(" ")}
            >
              <span className="wg-lb-rank">{ROMAN[i]}</span>
              <span className="wg-lb-name">
                <span className="wg-lb-color" style={{ color: entry.color, background: entry.color }} />
                {entry.name}{entry.you ? " (You)" : ""}
              </span>
              <span className="wg-lb-score">{entry.score.toLocaleString()}</span>
            </div>
          ))}
          {slice.length === 0 ? (
            <div className="wg-lb-row" style={{ color: "var(--wg-cream-mute)", fontStyle: "italic" }}>
              <span />
              <span>The arena awaits…</span>
              <span />
            </div>
          ) : null}
        </div>
        <div className="wg-daily">
          <div className="wg-daily-header">
            <div className="wg-daily-name">{daily.name}</div>
            <div className="wg-daily-time">{formatCountdown(countdownSec)}</div>
          </div>
          <div className="wg-daily-desc">{daily.desc}</div>
          <div className="wg-daily-bar"><i style={{ width: `${progressPct}%` }} /></div>
          <div className="wg-daily-meta">
            <span className="progress">{daily.progress} / {daily.target}</span>
            <span className="reward">+{daily.reward} XP</span>
          </div>
        </div>
        <div className="wg-news-strip">
          <div className="wg-news-pulse" />
          <div className="wg-news-text"><b>v0.7</b>&nbsp; Charm physics &amp; fairer collisions.</div>
        </div>
      </section>
    );
  }
  ```

- [ ] **Step 4: Run typecheck**

  Run: `npx tsc --noEmit`

  Expected: 0 errors.

- [ ] **Step 5: Commit**

  ```bash
  git add client/src/components/menu/CenterPanel.tsx client/src/components/menu/ArenaHallPanel.tsx client/src/styles.css
  git commit -m "feat(menu): add CenterPanel (logo, play, secondary) and ArenaHallPanel (leaderboard, daily, news)"
  ```

---

## Task 10: WarmGoldMenu Container

**Files:**
- Create: `client/src/components/menu/WarmGoldMenu.tsx`
- Create: `tests/menu-smoke.test.tsx`

- [ ] **Step 1: Write failing smoke test**

  Create `tests/menu-smoke.test.tsx`:

  ```tsx
  import { render, screen } from "@testing-library/react";
  import { describe, expect, it, vi } from "vitest";
  import { WarmGoldMenu } from "../client/src/components/menu/WarmGoldMenu";

  describe("WarmGoldMenu", () => {
    const baseProps = {
      name: "Tester",
      skinId: "cyan-core",
      hatId: "none",
      ropeAccessoryId: "none",
      leaderboard: [{ id: "tester", name: "Tester", score: 1234, color: "#22d8ff", you: true }],
      online: 7,
      latencyMs: 24,
      onNameChange: vi.fn(),
      onSkinChange: vi.fn(),
      onHatChange: vi.fn(),
      onRopeAccessoryChange: vi.fn(),
      onStart: vi.fn()
    };

    it("renders the brand and the play CTA", () => {
      render(<WarmGoldMenu {...baseProps} />);
      expect(screen.getByRole("heading", { name: /Slither/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Begin the arena/i })).toBeInTheDocument();
    });

    it("renders the loadout panel and shows the skin name", () => {
      render(<WarmGoldMenu {...baseProps} />);
      expect(screen.getByLabelText("Loadout")).toBeInTheDocument();
      expect(screen.getByText("Cyan Core")).toBeInTheDocument();
    });

    it("renders the leaderboard with the provided entry", () => {
      render(<WarmGoldMenu {...baseProps} />);
      expect(screen.getByLabelText("Leaderboard")).toBeInTheDocument();
      expect(screen.getByText(/Tester \(You\)/)).toBeInTheDocument();
    });

    it("calls onStart when play button is clicked", async () => {
      const onStart = vi.fn();
      render(<WarmGoldMenu {...baseProps} onStart={onStart} />);
      screen.getByRole("button", { name: /Begin the arena/i }).click();
      expect(onStart).toHaveBeenCalledTimes(1);
    });
  });
  ```

- [ ] **Step 2: Run failing test**

  Run: `npx vitest run tests/menu-smoke.test.tsx`

  Expected: FAIL — module not found.

- [ ] **Step 3: Implement `WarmGoldMenu.tsx`**

  Create `client/src/components/menu/WarmGoldMenu.tsx`:

  ```tsx
  import { useEffect, useMemo, useState } from "react";
  import type { LeaderboardEntry } from "../../../../shared/types";
  import { loadDaily, secondsUntilMidnight } from "../../lib/daily";
  import { loadStats } from "../../lib/stats";
  import { ArenaHallPanel } from "./ArenaHallPanel";
  import { CenterPanel } from "./CenterPanel";
  import { HatPicker } from "./HatPicker";
  import { LifetimePanel } from "./LifetimePanel";
  import { LoadoutPanel } from "./LoadoutPanel";
  import { SkinPicker } from "./SkinPicker";

  type WarmGoldMenuProps = {
    name: string;
    skinId: string;
    hatId: string;
    ropeAccessoryId: string;
    leaderboard: LeaderboardEntry[];
    online: number;
    latencyMs?: number;
    onNameChange: (name: string) => void;
    onSkinChange: (skinId: string) => void;
    onHatChange: (hatId: string) => void;
    onRopeAccessoryChange: (id: string) => void;
    onStart: () => void;
  };

  type ModalKind = "skin" | "hat" | "charm" | null;

  export function WarmGoldMenu({
    name, skinId, hatId, ropeAccessoryId, leaderboard, online, latencyMs,
    onNameChange, onSkinChange, onHatChange, onStart
  }: WarmGoldMenuProps) {
    const [modal, setModal] = useState<ModalKind>(null);
    const stats = useMemo(() => loadStats(), []);
    const daily = useMemo(() => loadDaily(), []);
    const [countdown, setCountdown] = useState(() => secondsUntilMidnight());

    useEffect(() => {
      const id = window.setInterval(() => setCountdown(secondsUntilMidnight()), 1000);
      return () => window.clearInterval(id);
    }, []);

    const noop = () => undefined;

    return (
      <section className="wg-stage" aria-label="Slithera main menu">
        <div className="wg-overlay" />
        <div className="wg-grain" />
        <div className="wg-top-ornament">A Coil &amp; Honey Arena · Est. MMXXVI</div>
        <div className="wg-grid">
          <div className="wg-left-stack">
            <LoadoutPanel
              skinId={skinId}
              hatId={hatId}
              ropeAccessoryId={ropeAccessoryId}
              onOpenSkin={() => setModal("skin")}
              onOpenHat={() => setModal("hat")}
              onOpenCharm={() => setModal("charm")}
            />
            <LifetimePanel stats={stats} />
          </div>
          <CenterPanel
            name={name}
            latencyMs={latencyMs}
            onNameChange={onNameChange}
            onStart={onStart}
            onSettings={noop}
            onStats={noop}
            onHowToPlay={noop}
          />
          <ArenaHallPanel leaderboard={leaderboard} online={online} daily={daily} countdownSec={countdown} />
        </div>
        <div className="wg-bottom-edge">SLITHERA · NO. 002 · MMXXVI</div>

        <SkinPicker
          open={modal === "skin"}
          onClose={() => setModal(null)}
          skinId={skinId}
          hatId={hatId}
          onChange={onSkinChange}
        />
        <HatPicker
          open={modal === "hat"}
          onClose={() => setModal(null)}
          skinId={skinId}
          hatId={hatId}
          onChange={onHatChange}
        />
      </section>
    );
  }
  ```

- [ ] **Step 4: Run tests**

  Run: `npx vitest run tests/menu-smoke.test.tsx`

  Expected: 4/4 pass.

- [ ] **Step 5: Run full test suite + typecheck**

  Run: `npx vitest run && npx tsc --noEmit`

  Expected: all tests pass, 0 type errors.

- [ ] **Step 6: Commit**

  ```bash
  git add client/src/components/menu/WarmGoldMenu.tsx tests/menu-smoke.test.tsx
  git commit -m "feat(menu): add WarmGoldMenu container wiring all panels and modals"
  ```

---

## Task 11: Menu Backdrop Hook (Local Simulation)

**Files:**
- Create: `client/src/lib/menuBackdrop.ts`

- [ ] **Step 1: Implement `menuBackdrop.ts`**

  Create `client/src/lib/menuBackdrop.ts`:

  ```typescript
  import { useEffect, useState } from "react";
  import { TICK_RATE } from "../../../shared/constants";
  import { createWorld, makeSnapshot, stepWorld } from "../../../shared/simulation";
  import type { ServerSnapshot } from "../../../shared/types";

  /**
   * Drives a client-side simulation while the user is in the menu so the
   * PixiGame canvas behind the menu is never empty. Bots wander the world.
   * The synthetic snapshot has no human player, so PixiGame's camera falls
   * back to the world center automatically.
   */
  export function useMenuSimulation(active: boolean): ServerSnapshot | undefined {
    const [snapshot, setSnapshot] = useState<ServerSnapshot | undefined>(undefined);

    useEffect(() => {
      if (!active) return;
      const world = createWorld(Math.floor(Math.random() * 100000));
      const stepDt = 1 / TICK_RATE;
      let stopped = false;
      const intervalId = window.setInterval(() => {
        if (stopped) return;
        stepWorld(world, stepDt);
        setSnapshot(makeSnapshot(world));
      }, 1000 / 30);
      return () => {
        stopped = true;
        window.clearInterval(intervalId);
      };
    }, [active]);

    return active ? snapshot : undefined;
  }
  ```

- [ ] **Step 2: Run typecheck**

  Run: `npx tsc --noEmit`

  Expected: 0 errors.

- [ ] **Step 3: Commit**

  ```bash
  git add client/src/lib/menuBackdrop.ts
  git commit -m "feat(menu): add useMenuSimulation hook for live canvas backdrop"
  ```

---

## Task 12: App Integration & Cleanup

**Files:**
- Modify: `client/src/App.tsx`
- Delete: `client/src/components/MainMenu.tsx`
- Modify: `client/src/styles.css` (remove old `.main-menu`/`.menu-*`/`.future-slots` block — but KEEP `.pixi-canvas`, `.game-shell`, `.game-canvas`, `.hud`, `.controls`, `.glass-button`, `.brand-plate`, `.leaderboard`, `.perf`, `.score`, `.death`, `.touch-controls`, `.minimap`, `.fullscreen-button`, `.arena-status`, `.status-dot` and the existing media queries that are NOT inside the legacy `.main-menu` block; only the menu-specific selectors are removed)

- [ ] **Step 1: Rewrite `App.tsx` to use `WarmGoldMenu` and the menu backdrop**

  Replace the contents of `client/src/App.tsx` with:

  ```tsx
  import { useEffect, useMemo, useState } from "react";
  import { GameHud } from "./components/GameHud";
  import { WarmGoldMenu } from "./components/menu/WarmGoldMenu";
  import { PixiGame } from "./game/PixiGame";
  import { useGameClient } from "./game/useGameClient";
  import { useMenuSimulation } from "./lib/menuBackdrop";
  import { recordGameEnd } from "./lib/stats";
  import { SNAKE_SKINS } from "../../shared/constants";
  import type { ClientInput } from "../../shared/types";

  export default function App() {
    const autoStart = new URLSearchParams(window.location.search).get("play") === "1";
    const [started, setStarted] = useState(autoStart);
    const [paused, setPaused] = useState(!autoStart);
    const [name, setName] = useState("You");
    const [skinId, setSkinId] = useState<string>(SNAKE_SKINS[0].id);
    const [hatId, setHatId] = useState("none");
    const [ropeAccessoryId, setRopeAccessoryId] = useState("none");
    const [perf, setPerf] = useState({ fps: 0, renderer: "webgl" });
    const profile = useMemo(
      () => ({ name: name.trim() || "You", skinId, hatId, ropeAccessoryId }),
      [name, skinId, hatId, ropeAccessoryId]
    );
    const { status, playerId, snapshot, latency, sendInput, respawn } = useGameClient(started, profile);
    const menuSnapshot = useMenuSimulation(!started);
    const player = useMemo(() => snapshot?.players.find((item) => item.id === playerId), [snapshot, playerId]);

    // Record game-end stats when local player transitions alive -> dead.
    const [lastAlive, setLastAlive] = useState<{ alive: boolean; score: number; kills: number; startedAt: number }>(
      { alive: false, score: 0, kills: 0, startedAt: 0 }
    );
    useEffect(() => {
      if (!player) return;
      if (player.alive && !lastAlive.alive) {
        setLastAlive({ alive: true, score: 0, kills: 0, startedAt: Date.now() });
      }
      if (!player.alive && lastAlive.alive) {
        const playedSec = Math.max(0, Math.floor((Date.now() - lastAlive.startedAt) / 1000));
        recordGameEnd({ score: player.score, kills: player.kills, playedSec });
        setLastAlive((prev) => ({ ...prev, alive: false }));
      }
    }, [player, lastAlive]);

    const handleInput = (input: ClientInput) => {
      if (!paused) sendInput(input);
    };

    const renderedSnapshot = started ? snapshot : menuSnapshot;
    const renderedPlayerId = started ? playerId : undefined;
    const leaderboard = renderedSnapshot?.leaderboard ?? [];
    const online = renderedSnapshot?.players.length ?? 0;

    return (
      <main className="game-shell">
        <PixiGame
          snapshot={renderedSnapshot}
          playerId={renderedPlayerId}
          paused={!started ? false : paused}
          onInput={handleInput}
          onPerf={setPerf}
        />
        {started ? (
          <GameHud
            status={status}
            latency={latency}
            player={player}
            playerId={playerId}
            snapshot={snapshot}
            paused={paused}
            perf={perf}
            onPause={() => setPaused((value) => !value)}
            onPlay={() => {
              setPaused(false);
              if (player && !player.alive) respawn();
            }}
            onRespawn={respawn}
            onBoost={(boosting) => {
              if (!player) return;
              handleInput({ heading: player.targetHeading, boosting });
            }}
          />
        ) : (
          <WarmGoldMenu
            name={name}
            skinId={skinId}
            hatId={hatId}
            ropeAccessoryId={ropeAccessoryId}
            leaderboard={leaderboard}
            online={online}
            latencyMs={latency}
            onNameChange={setName}
            onSkinChange={setSkinId}
            onHatChange={setHatId}
            onRopeAccessoryChange={setRopeAccessoryId}
            onStart={() => {
              setStarted(true);
              setPaused(false);
            }}
          />
        )}
      </main>
    );
  }
  ```

- [ ] **Step 2: Delete the old MainMenu component**

  Delete `client/src/components/MainMenu.tsx`.

- [ ] **Step 3: Remove legacy menu CSS from `styles.css`**

  In `client/src/styles.css`, delete the following blocks (each is a contiguous selector block — locate by selector, remove the whole rule incl. closing brace):

  - `.main-menu { ... }`
  - `.menu-backdrop { ... }`
  - `.menu-panel { ... }`
  - `.menu-topbar { ... }`
  - `.menu-brand { ... }`
  - `.menu-brand h1 { ... }`
  - `.menu-brand span { ... }`
  - `.menu-online { ... }`
  - `.menu-online svg { ... }`
  - `.menu-grid { ... }` (the old definition only — the new `.wg-grid` stays)
  - `.menu-profile, .menu-preview, .menu-cosmetics { ... }`
  - `.menu-profile { ... }`
  - `.name-field { ... }`
  - `.name-field span, .cosmetic-header { ... }`
  - `.name-field input { ... }`
  - `.name-field input:focus { ... }`
  - `.menu-loadout-summary { ... }`
  - `.menu-loadout-summary span { ... }`
  - `.menu-loadout-summary b { ... }`
  - `.menu-preview { ... }`
  - `.preview-stage { ... }`
  - `.preview-snake { ... }` and all its `.preview-snake i:nth-child(N)` rules
  - `.preview-snake b { ... }` and `.preview-snake b span { ... }` rules
  - `.preview-stage em { ... }`
  - `.preview-rope-item { ... }`
  - `.menu-cosmetics { ... }`
  - `.skin-options { ... }` (the old `.main-menu` skin grid; keep `.wg-skin-grid`)
  - `.skin-card { ... }` and its hover/selected/i variants
  - `.skin-card b { ... }`
  - `.hat-options { ... }`
  - `.hat-card { ... }` and its hover/selected/span/b variants
  - `.menu-start { ... }` and hover variant
  - `.rope-options { ... }`, `.rope-card { ... }`, `.cosmetic-badge-new { ... }` (replaced by `.wg-*`)
  - Inside the `@media (max-width: 980px)` rule: remove the `.menu-panel`, `.menu-grid`, `.menu-profile, .menu-preview, .menu-cosmetics`, `.skin-options` overrides (keep the `.brand-plate`, `.leaderboard`, `.perf`, `.touch-controls`, `.minimap`, `.score`, `.score strong` overrides).
  - Inside the `@media (max-width: 640px)` rule: remove `.main-menu`, `.menu-panel`, `.menu-topbar`, `.menu-brand`, `.menu-brand h1`, `.menu-grid`, `.menu-cosmetics`, `.menu-preview`, `.preview-stage`, `.preview-snake`, `.preview-stage em`, `.skin-options`, `.skin-card`, `.hat-options, .rope-options`, `.menu-start` overrides.

  After deletion, the file contains only the in-game styles + the `.wg-*` design system block.

- [ ] **Step 4: Run all tests**

  Run: `npx vitest run`

  Expected: all pass.

- [ ] **Step 5: Run typecheck**

  Run: `npx tsc --noEmit`

  Expected: 0 errors.

- [ ] **Step 6: Verify in dev server**

  Run: `npm run dev`

  Open `http://localhost:5173`. Verify:
  - The new warm-gold main menu appears with 3 panels
  - Bots are visible in the canvas behind the menu (live local sim)
  - Clicking the Skin row in the loadout opens the skin modal with 3D preview that slithers
  - Clicking the Hat row opens the hat modal; hat overlay appears on the head
  - Selecting a skin/hat updates the loadout summary and the mini snake preview
  - Pressing Enter Arena starts the multiplayer game with the selected loadout
  - In a second browser window, the other player is visible with the chosen skin (cosmetic sync)
  - Mobile: under 980px the layout stacks vertically with the center panel first; under 640px modal is single-column

- [ ] **Step 7: Commit**

  ```bash
  git add client/src/App.tsx client/src/styles.css
  git rm client/src/components/MainMenu.tsx
  git commit -m "feat(menu): replace MainMenu with WarmGoldMenu, wire menu backdrop sim, remove legacy menu CSS"
  ```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Aesthetic direction (CSS variables, fonts, ornamentation) — Task 2
- [x] Layout 280/480/280 grid + breakpoints — Task 2
- [x] Mini snake preview centered with slither — Task 4
- [x] 3D forward-slither preview — Task 5
- [x] Wardrobe modal shell — Task 6
- [x] Skin & hat pickers — Task 7
- [x] Loadout panel — Task 8
- [x] Lifetime panel + tier — Task 8
- [x] Center panel — Task 9
- [x] Arena hall (leaderboard + daily + news) — Task 9
- [x] Stats persistence — Task 3
- [x] Daily challenge persistence — Task 3
- [x] Hat data layer (constants/types/sim/server/client/tests) — Task 1
- [x] Live canvas backdrop via local sim — Task 11
- [x] App integration + cleanup — Task 12
- [x] Multiplayer cosmetic sync — Tested implicitly via Task 1 (PlayerState propagation)

**Type consistency:**
- `HAT_OPTIONS` defined in Task 1, consumed in Tasks 4, 5, 7, 8 ✅
- `StoredStats` defined in Task 3, consumed in Tasks 8, 10, 12 ✅
- `DailyChallenge` defined in Task 3, consumed in Tasks 9, 10 ✅
- `MiniSnakePreview` props (skinId, hatId) consistent with usage in Task 8 ✅
- `SnakePreview3D` props (skinId, hatId, label, name, meta) consistent with usage in Task 7 ✅
- `WardrobeModal` (open, onClose, preview, side) consistent with Task 7 ✅
- `WarmGoldMenu` props consistent between Task 10 declaration and Task 12 caller ✅
- `useMenuSimulation` returns `ServerSnapshot | undefined`, consumed correctly in App.tsx ✅

**No placeholders:**
- Every step has either complete code, exact file edits, or commands. No TODO/TBD.

**Out-of-scope items confirmed deferred:**
- In-game HUD redesign (`GameHud.tsx`)
- Hat rendering on snake heads in `PixiGame` (mockup-only)
- Real region servers
- Daily challenge server-side validation / progress tracking events
- Achievement system, friends, chat

Plan complete.

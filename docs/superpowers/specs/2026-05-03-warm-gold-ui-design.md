# Slithera — Warm Gold UI Redesign Spec

**Date:** 2026-05-03
**Author:** brainstorming session, approved by user
**Goal:** Replace the existing Slithera main menu with a Warm Gold Brown design system: 3-panel layout, slithering snake previews, modal-based skin/hat selection, and a live game canvas backdrop.

**Scope:** Main menu surface only. In-game HUD (`GameHud.tsx`) is **out of scope** for this iteration.

---

## Aesthetic direction

**Tone:** Cozy premium — coffee-and-honey, gentleman's club meets refined arcade.

**Palette (CSS variables, app-wide):**
- `--coffee` `#0e0a06` (base bg)
- `--coffee-2` `#14100c` (panel bg dark)
- `--cream` `#f5e9d3` (primary text & buttons)
- `--cream-dim` `#c4b59a` (secondary text)
- `--cream-mute` `#8a7d68` (tertiary / labels)
- `--gold` `#f0b540` (primary accent)
- `--amber` `#d97a3c` (secondary accent)
- `--ember` `#e85a4f` (alert / mythic)

**Color rule:** Panels are dark coffee with cream text. Gold/amber/ember are accents only (focus rings, badges, dividers, icons, the play button's drop-shadow). The play button is **cream over coffee**, not full gold. White and black mix in via the cream/coffee balance for legibility.

**Typography:**
- Display: **Fraunces** (variable, italic for ornament, opsz 144)
- Body: **Outfit** (geometric sans, weights 400–800)
- Numerics / metadata: **JetBrains Mono** (tabular figures)
- Loaded via Google Fonts in `index.html`

**Ornamentation:**
- Gold L-corner detail on every panel (top-left + bottom-right)
- Roman-numeral tier labels (I, II, III)
- Top header: `· · · A Coil & Honey Arena · Est. MMXXVI · · ·` with hairline gold rules
- Footer: `SLITHERA · NO. 002 · MMXXVI` in JetBrains Mono uppercase

---

## Layout

3-panel grid centered within a max 1180px container:

```
┌─────────┬──────────────┬─────────┐
│ 280 px  │  ≤ 480 px    │ 280 px  │   ← center is narrower than v1 mockup
│ LEFT    │ CENTER       │ RIGHT   │
│ stack   │ stack        │ stack   │
└─────────┴──────────────┴─────────┘
```

- `grid-template-columns: 280px minmax(0, 480px) 280px`
- `gap: 18px`, padding `56px 36px 36px`
- `justify-content: center` so the whole grid hugs the middle when viewport is wider
- Below `980px` viewport: stack vertically (left → center → right), center first
- Below `640px`: single-column, full-width panels

**Left panel (split top/bottom):**
- Top: **Loadout** card — centered slithering mini-snake preview (with hat overlay), 3 summary rows (Skin / Hat / Charm), `▸ Open Wardrobe` button
- Bottom: **Lifetime** card — 4 stat blocks (Best, Kills, Played, Streak), tier badge with progress bar

**Center panel:**
- Eyebrow line (`MULTIPLAYER · PERSISTENT · 2026`)
- Logo: `Slither&a` with gradient cream→gold→amber (Fraunces 900, opsz 144)
- Tagline italic
- Hairline divider with gold dot
- Region chip row (active: EU-Frankfurt — only one chip is functional, rest are visual)
- Name input (Fraunces, character counter on the right)
- **Play button** — cream gradient with coffee text, italic Fraunces, animated shimmer, arrow circle on the right
- Secondary row: Settings · Stats · How to Play

**Right panel:**
- **Live leaderboard** — top 6, Roman-numeral ranks, you-row highlighted gold
- **Daily Tribute** — title + countdown + description + progress bar with shine + reward
- News strip with red pulse dot

---

## Snake previews (two places, same principle)

### Mini snake (loadout panel)

- Centered horizontally and vertically inside an 92px-tall stage
- 7 beads in flex row, head with 2 dot eyes, hat overlay as child of head
- **Slither animation:** each bead does 1.2s sine `translateY(-4px ↔ 4px)`, ease-in-out
- **Stagger:** `nth-child(N) { animation-delay: (N-1) * 60ms }` so the wave passes head → tail
- Hat is positioned `top:-12px; left:50%` inside the head bead → inherits the head's transform → swings with it
- **Speed lines** inside stage background → 1.4s linear horizontal sweep gives the "moving forward in place" illusion

### 3D preview (skin & hat modals)

- 320×320 stage, perspective `1100px`
- 12 beads positioned along Z axis (head at z+140, tail at z-168, slight Y descent)
- Each bead in its own `.bead-pos` wrapper for static placement; `.bead` inside does the slither animation
- **Slither animation:** 1.6s lateral X-axis wave (`translateX(14px ↔ -14px)`), ease-in-out, 70ms stagger
- **Camera sway:** parent rotates `rotateY(±12°) rotateX(8deg)` over 12s (alternate, ease-in-out) → all sides revealed
- **Floor pulse:** soft amber blur ellipse breathes 1.6s in sync with body
- **Speed lines:** vertical lines passing through stage at 2.5s linear → forward-motion illusion
- Hat (e.g. 👑) is inside the head bead → undulates and sways with head

---

## Modals (skin & hat)

- 920px max-width, 1.2fr (preview) / 1fr (selection grid)
- Modal background: dark coffee with subtle gold radial top-glow
- Gold L-corners on the modal itself, plus rotating × close button (top-right)
- Entrance: 700ms ease-out fade + rise (`translateY(30px) scale(0.96) → 0,1`)
- Right side:
  - Eyebrow `CHAPTER · I` (skin) / `CHAPTER · II` (hat) in mono
  - Italic Fraunces title with one gold word emphasized
  - Subtitle in italic Fraunces
  - 3×3 grid of cards with rarity badge (CMN / RARE / EPIC / MYTH), lock icon for unowned
  - Selected card: gold border + glow ring
  - Footer: Cancel + **Wear →** (cream button, italic Fraunces)

---

## Live canvas backdrop

The main menu is overlaid on the existing `PixiGame` component. While in the menu (not started), the canvas should show ambient bot activity — never empty.

**Approach:** local simulation in the menu.

1. Add `client/src/lib/menuBackdrop.ts` exporting `useMenuSimulation()` — a hook that, when active, runs `createWorld` + `stepWorld` from `shared/simulation.ts` at 30Hz client-side and synthesizes `ServerSnapshot` objects via `makeSnapshot`.
2. In `App.tsx`, when `started === false`, route this synthetic snapshot stream into `<PixiGame />` instead of the websocket snapshot.
3. When user clicks **Enter Arena** (`onStart`), tear down the local sim and switch to `useGameClient(true, profile)`.
4. The bot population (`MIN_ACTIVE_SNAKES = 6`) gives organic motion. No human player exists in the menu sim.
5. The PixiGame renders behind the menu panels (existing layering already supports this; menu has `z-index: 10`).
6. To prevent the menu's snake preview from being visually distracting against the live canvas, panel backdrop-blur (`blur(20-28px) saturate(140%)`) softens what's behind.

---

## Data model changes

### `shared/constants.ts`
- Add `HAT_OPTIONS` array of `{ id, name, mark, rarity }` matching the mockup. `id` values: `none`, `crown`, `halo`, `visor`, `top-hat`, `helm`, `cap`, `mortar`, `hardhat`. `mark` is the emoji/symbol used in HUD and previews.
- Add `HatId` type derived from `HAT_OPTIONS`.

### `shared/types.ts`
- Add `hatId?: string` on `PlayerState`
- Add `hatId?: string` to the `join` variant of `ClientMessage`

### `shared/simulation.ts`
- `createPlayer` signature gains an optional 7th param `hatId?: string`
- Player object stores `hatId`

### `server/index.ts`
- Pass `message.hatId` to `createPlayer` in the join handler

### `client/src/game/useGameClient.ts`
- `profile` type includes `hatId?: string`
- Join message includes `hatId`
- `useEffect` deps include `profile.hatId`

### `tests/`
- `tests/simulation.test.ts`: assert `HAT_OPTIONS` shape (`none` first, contains `crown` + `halo` + `visor`); assert `createPlayer` stores `hatId`
- `tests/client-smoke.test.tsx`: add `hatId: "none"` to fixture

**Multiplayer cosmetic sync:** All three cosmetic fields (`skinId`, `hatId`, `ropeAccessoryId`) live on `PlayerState`, are broadcast in every snapshot, and are smoothed in `smoothPlayers`. Every client renders every other client's full loadout from authoritative state. No per-client cosmetic visibility.

> **Note:** Hat rendering inside `PixiGame` is **out of scope** for this iteration — the mockup shows hats only in the menu / modal previews. A follow-up task will add hat rendering on snake heads in-game.

---

## Stats panel data

Persisted client-side in `localStorage` under key `slithera-stats`:

```ts
type StoredStats = {
  bestScore: number;
  totalKills: number;
  totalPlayedSec: number;
  winStreak: number;
  gamesPlayed: number;
};
```

- Initial value: all zeros.
- Updated on game end (when local player transitions `alive → !alive` and respawn delay elapses, or when user returns to menu).
- A small helper `client/src/lib/stats.ts` exports `loadStats()`, `saveStats(partial)`, `recordGameEnd(snapshotPlayer)`.
- Stats panel renders these values; numbers are typeset in Fraunces 700, opsz 144, with tabular figures.
- Tier is derived: `tier = clamp(1, floor((bestScore + totalKills*30) / 1000) + 1, 7)` mapped to names `[Initiate, Apprentice, Sommelier, Vintner, Connoisseur, Master, Legend]`. Progress bar fills toward the next tier threshold.

---

## Daily challenge

- Mocked client-side. Stored in `localStorage` under `slithera-daily` with shape `{ date: 'YYYY-MM-DD', challengeId, progress, target, claimed }`.
- On menu mount, if stored date != today, generate a new daily from a fixed list of 4–5 challenges (e.g. *Devour 30 morsels mid-boost*, *Survive 2 minutes in the top 5*, *Defeat 3 bots*).
- Progress increments are not implemented this iteration (display-only). A follow-up task will wire actual events.
- Countdown: time until midnight local.

---

## Region selector

Cosmetic only. Three chips: EU-Frankfurt (active, ping derived from real `latency` value), US-East and Asia (display-only with mocked ping). Server endpoint configuration is unchanged.

---

## Files to add

```
client/src/components/menu/
  WarmGoldMenu.tsx           — replaces MainMenu
  LoadoutPanel.tsx           — left top
  LifetimePanel.tsx          — left bottom
  CenterPanel.tsx            — center
  ArenaHallPanel.tsx         — right (leaderboard + daily + news)
  MiniSnakePreview.tsx       — slithering mini snake (used in LoadoutPanel)
  SnakePreview3D.tsx         — 3D forward-slither preview (used in modals)
  WardrobeModal.tsx          — shared modal frame (overlay, close button, layout)
  SkinPicker.tsx             — uses WardrobeModal + SnakePreview3D
  HatPicker.tsx              — uses WardrobeModal + SnakePreview3D (with hat overlay)

client/src/lib/
  menuBackdrop.ts            — useMenuSimulation hook for live canvas
  stats.ts                   — localStorage stats persistence + tier derivation
  daily.ts                   — localStorage daily-challenge generation
```

## Files to modify

```
client/src/styles.css        — full rewrite of .main-menu / .menu-* sections; new .wg-* classes
client/src/App.tsx           — use WarmGoldMenu; wire local sim when !started; add hatId state
client/src/components/MainMenu.tsx  — DELETE (replaced by WarmGoldMenu)
client/index.html            — add Google Fonts <link> for Fraunces, Outfit, JetBrains Mono
shared/constants.ts          — add HAT_OPTIONS + HatId type
shared/types.ts              — add hatId to PlayerState + join
shared/simulation.ts         — createPlayer accepts hatId
server/index.ts              — forward message.hatId
client/src/game/useGameClient.ts  — include hatId in profile + join
tests/simulation.test.ts     — assert HAT_OPTIONS + createPlayer stores hatId
tests/client-smoke.test.tsx  — add hatId to fixture
```

---

## Out of scope (deferred)

- In-game HUD redesign (`GameHud.tsx`) — separate iteration
- Hat rendering on snake heads in `PixiGame` (mockup only shows it in menu)
- Real region selector functionality (multi-region servers)
- Daily challenge progress tracking (display-only this iteration)
- Achievement system, friends list, chat, profile pages
- Server-side stats persistence

---

## Self-review

- ✅ No placeholders / TBDs
- ✅ Layout numbers explicit (`280 / 480 / 280`, `18px gap`, breakpoints)
- ✅ Animation parameters explicit (durations, stagger, easing)
- ✅ Data model deltas listed file-by-file
- ✅ Tests update path called out
- ✅ Out-of-scope section keeps the work bounded
- ✅ Live canvas backdrop has a concrete implementation path (local sim)
- ✅ Stats and daily challenge have explicit storage shape
- ✅ Multiplayer cosmetic sync rule stated and tied to authoritative state

Ready for implementation plan.

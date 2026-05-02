# Slithera Gameplay & Visual Overhaul Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Overhaul snake rendering to slither.io circle style, fix tail growth stutter, add rope-physics accessory cosmetic system, hide mouse cursor in-game, and redesign the main menu to expose the new cosmetic slot.

**Architecture:** Client-only rope physics (spring simulation) stored alongside RenderedPlayer state in PixiGame's render loop closure. `ropeAccessoryId` propagates from App state → profile → join message → PlayerState → snapshots. All render changes stay in PixiGame.tsx; shared/types.ts and shared/constants.ts carry the new cosmetic data contract.

**Tech Stack:** PixiJS 8 (Graphics API), React 19, TypeScript 5, Vitest 4, Node.js WebSocket server (ws).

---

## File Map

| File | What changes |
|------|-------------|
| `client/src/styles.css` | `cursor: none` on `.pixi-canvas`; new `.rope-options`, `.rope-card`, `.cosmetic-badge-new` CSS |
| `client/src/game/PixiGame.tsx` | Remove head glow; rewrite `drawSnake` with circle segments; delete `drawSmoothStroke`/`drawTailCap`/`sampledPath`; fix `approachRenderedLength`; add `RopeState` type + `ropeStates` Map + `updateRopeState` + `drawRopeAccessory` + icon helpers; copy `ropeAccessoryId` in `smoothPlayers` |
| `shared/constants.ts` | Add `ROPE_ACCESSORIES` array + `RopeAccessoryId` type |
| `shared/types.ts` | Add `ropeAccessoryId?: string` to `PlayerState`; add `ropeAccessoryId?: string` to `join` variant of `ClientMessage` |
| `shared/simulation.ts` | Add `ropeAccessoryId?: string` param to `createPlayer` |
| `server/index.ts` | Pass `message.ropeAccessoryId` to `createPlayer` in join handler |
| `client/src/game/useGameClient.ts` | Include `ropeAccessoryId` in join message; accept it in profile type |
| `client/src/App.tsx` | Add `ropeAccessoryId` state; add to `profile` memo; pass to `MainMenu` |
| `client/src/components/MainMenu.tsx` | Add `ropeAccessoryId` + `onRopeAccessoryChange` props; add Rope Item section; update preview; remove future-slots |
| `tests/client-smoke.test.tsx` | Add `ropeAccessoryId: 'none'` to the fixture `PlayerState` |
| `tests/simulation.test.ts` | Add test for `createPlayer` with `ropeAccessoryId` |

---

## Task 1: Quick Visual Fixes — Cursor + Head Glow

**Files:**
- Modify: `client/src/styles.css` (`.pixi-canvas` block, line 55)
- Modify: `client/src/game/PixiGame.tsx` (`drawSnake`, line 301)

- [ ] **Step 1: Hide the mouse cursor on the game canvas**

  In `client/src/styles.css`, find the `.pixi-canvas` block and add `cursor: none;`:

  ```css
  .pixi-canvas {
    display: block;
    touch-action: none;
    cursor: none;
  }
  ```

- [ ] **Step 2: Remove the head shadow circle (glow)**

  In `client/src/game/PixiGame.tsx` inside `drawSnake`, remove the dark outline circle on the head.

  Find and delete this single line (currently line 301):
  ```typescript
  graphics.circle(head.x, head.y, 22.5 * growth).fill({ color: 0x061018, alpha: 0.82 });
  ```

  The head rendering that remains (line 302 onwards) becomes:
  ```typescript
  graphics.circle(head.x, head.y, 19 * growth).fill({ color, alpha: 1 });
  graphics.circle(head.x - 5 * growth, head.y - 7 * growth, 6.2 * growth).fill({ color: accent, alpha: 0.22 });
  // eyes unchanged...
  ```

- [ ] **Step 3: Start dev server and verify**

  Run: `npm run dev`

  Open `http://localhost:5173` in browser. Verify:
  - Mouse cursor disappears when hovering over the game canvas
  - Snake head no longer has a dark halo ring around it

- [ ] **Step 4: Commit**

  ```bash
  git add client/src/styles.css client/src/game/PixiGame.tsx
  git commit -m "fix: hide mouse cursor on canvas, remove head glow"
  ```

---

## Task 2: Tail Growth Stutter Fix

**Files:**
- Modify: `client/src/game/PixiGame.tsx` (`approachRenderedLength`, lines 487–530)

- [ ] **Step 1: Locate `approachRenderedLength` in PixiGame.tsx (line 487)**

  The growing branch (starting around line 491) currently reads:
  ```typescript
  if (player.segments.length < targetLength) {
    player.visualSegmentProgress = Math.max(player.visualSegmentProgress, target.segmentProgress, 0) + TAIL_GROW_SEGMENTS_PER_SECOND * dt;
    while (player.segments.length < targetLength && player.visualSegmentProgress >= 1) {
      player.segments.push(extendRenderedTail(player.segments, SEGMENT_SPACING, player.heading));
      player.visualSegmentProgress -= 1;
    }
    player.visualSegmentProgress = Math.min(player.visualSegmentProgress, 0.98);
    return;
  }
  ```

- [ ] **Step 2: Replace `extendRenderedTail` call with server-position-first logic**

  Replace the `while` loop body only — the push line — with:
  ```typescript
  if (player.segments.length < targetLength) {
    player.visualSegmentProgress = Math.max(player.visualSegmentProgress, target.segmentProgress, 0) + TAIL_GROW_SEGMENTS_PER_SECOND * dt;
    while (player.segments.length < targetLength && player.visualSegmentProgress >= 1) {
      const serverPos = target.segments[player.segments.length];
      const newSeg = serverPos
        ? { x: serverPos.x, y: serverPos.y }
        : extendRenderedTail(player.segments, SEGMENT_SPACING, player.heading);
      player.segments.push(newSeg);
      player.visualSegmentProgress -= 1;
    }
    player.visualSegmentProgress = Math.min(player.visualSegmentProgress, 0.98);
    return;
  }
  ```

- [ ] **Step 3: Run existing tests to confirm no regression**

  Run: `npx vitest run tests/simulation.test.ts`

  Expected output: all 9 tests pass.

- [ ] **Step 4: Verify in dev server**

  With `npm run dev` running, play until the snake eats several food pellets. Watch the tail as it grows — it should extend smoothly without any popping or stuttering.

- [ ] **Step 5: Commit**

  ```bash
  git add client/src/game/PixiGame.tsx
  git commit -m "fix: use server segment position when growing tail to eliminate stutter"
  ```

---

## Task 3: Circle-Segment Snake Rendering

**Files:**
- Modify: `client/src/game/PixiGame.tsx` (full `drawSnake` rewrite; delete helpers)

- [ ] **Step 1: Rewrite `drawSnake` with per-segment circles**

  Replace the entire `drawSnake` function (lines 286–325) with:

  ```typescript
  function drawSnake(graphics: Graphics, labels: Container, player: PlayerState, you: boolean, view: WorldBounds, rope?: RopeState): void {
    if (!player.alive || player.segments.length === 0) return;
    const color = Number.parseInt(player.color.slice(1), 16);
    const accent = Number.parseInt(player.accent.slice(1), 16);
    const growth = snakeSizeScale(player);
    const displaySegments = segmentsWithGrowingTail(player);
    const segCount = displaySegments.length;
    const taperingStart = Math.floor(segCount * 0.8);
    const bodyRadius = 14 * growth;

    // Draw body circles tail-first so head renders on top
    for (let i = segCount - 1; i >= 1; i -= 1) {
      const seg = displaySegments[i];
      if (!insideBounds(seg, view)) continue;
      let radius: number;
      if (i >= taperingStart) {
        const tailProg = (i - taperingStart) / Math.max(1, segCount - 1 - taperingStart);
        radius = (14 - tailProg * 5) * growth;
      } else {
        radius = bodyRadius;
      }
      graphics.circle(seg.x, seg.y, radius).fill({ color, alpha: 1 });
    }

    // Head
    const head = displaySegments[0];
    if (!insideBounds(head, view)) return;
    const headRadius = 16 * growth;
    graphics.circle(head.x, head.y, headRadius).fill({ color, alpha: 1 });
    // Shimmer highlight
    graphics.circle(head.x - headRadius * 0.28, head.y - headRadius * 0.28, headRadius * 0.32).fill({ color: accent, alpha: 0.22 });
    // Eyes
    const eyeOffset = { x: Math.cos(player.heading + Math.PI / 2) * 6 * growth, y: Math.sin(player.heading + Math.PI / 2) * 6 * growth };
    const nose = { x: Math.cos(player.heading) * 8 * growth, y: Math.sin(player.heading) * 8 * growth };
    graphics.circle(head.x + nose.x + eyeOffset.x, head.y + nose.y + eyeOffset.y, 4 * growth).fill("#031018");
    graphics.circle(head.x + nose.x - eyeOffset.x, head.y + nose.y - eyeOffset.y, 4 * growth).fill("#031018");
    graphics.circle(head.x + nose.x + eyeOffset.x + 1 * growth, head.y + nose.y + eyeOffset.y - 1 * growth, 1.3 * growth).fill("#ffffff");
    graphics.circle(head.x + nose.x - eyeOffset.x + 1 * growth, head.y + nose.y - eyeOffset.y - 1 * growth, 1.3 * growth).fill("#ffffff");

    // Rope accessory (drawn after head so it appears on top of body)
    if (rope && player.ropeAccessoryId && player.ropeAccessoryId !== "none") {
      const attachX = head.x - Math.cos(player.heading) * 18;
      const attachY = head.y - Math.sin(player.heading) * 18;
      graphics.moveTo(attachX, attachY).lineTo(rope.x, rope.y).stroke({ color: 0xc8dce8, alpha: 0.5, width: 1.8 });
      drawRopeAccessory(graphics, player.ropeAccessoryId, rope.x, rope.y, accent);
    }

    // Label
    if (you) {
      const label = new Text({
        text: "You",
        style: { fill: "#ffffff", fontFamily: "Inter, system-ui, sans-serif", fontSize: 18, fontWeight: "700" }
      });
      label.anchor.set(0.5);
      label.position.set(head.x, head.y - 42);
      labels.addChild(label);
    }
  }
  ```

  Note: `rope?: RopeState` parameter is forward-declared here — `RopeState` type is added in Task 5. For now, TypeScript will error until Task 5 is complete; proceed through Tasks 3–5 before running typecheck.

- [ ] **Step 2: Update the `drawFrame` call site to pass `undefined` as rope for now**

  In `drawFrame`, find:
  ```typescript
  for (const player of sorted) drawSnake(snakes, labels, player, player.id === playerIdRef.current, view);
  ```
  Change to:
  ```typescript
  for (const player of sorted) drawSnake(snakes, labels, player, player.id === playerIdRef.current, view, undefined);
  ```

- [ ] **Step 3: Delete the now-unused helper functions**

  Delete the following three functions entirely from PixiGame.tsx:
  - `drawSmoothStroke` (lines ~354–364)
  - `drawTailCap` (lines ~366–371)
  - `sampledPath` (lines ~345–352)

- [ ] **Step 4: Run typecheck**

  Run: `npx tsc --noEmit`

  Expected: errors only about `RopeState` (not yet defined — will be fixed in Task 5). No other errors.

- [ ] **Step 5: Verify in dev server**

  Run: `npm run dev`

  The snake should now render as overlapping circles in slither.io style. Body is uniform width; tail tapers over the last 20% of segments.

- [ ] **Step 6: Commit**

  ```bash
  git add client/src/game/PixiGame.tsx
  git commit -m "feat: replace stroke-based snake rendering with slither.io-style circle segments"
  ```

---

## Task 4: Rope Accessory Data Layer

**Files:**
- Modify: `shared/constants.ts`
- Modify: `shared/types.ts`
- Modify: `shared/simulation.ts` (`createPlayer`, line 59)
- Modify: `server/index.ts` (join handler, line 68)
- Modify: `client/src/game/useGameClient.ts`
- Modify: `tests/simulation.test.ts`
- Modify: `tests/client-smoke.test.tsx`

- [ ] **Step 1: Write a failing test for `ROPE_ACCESSORIES` shape**

  Add to `tests/simulation.test.ts` inside the `describe` block:

  ```typescript
  it("ROPE_ACCESSORIES has none as first entry and all expected ids", () => {
    const { ROPE_ACCESSORIES } = await import("../shared/constants");
    const ids = ROPE_ACCESSORIES.map((a) => a.id);
    expect(ids[0]).toBe("none");
    expect(ids).toContain("skull");
    expect(ids).toContain("star");
    expect(ids).toContain("diamond");
  });
  ```

  Run: `npx vitest run tests/simulation.test.ts`

  Expected: FAIL — `ROPE_ACCESSORIES` does not exist yet.

  Note: The `await import` approach won't work here since it's not async. Change to a top-level import:

  Add to the top of `tests/simulation.test.ts` imports:
  ```typescript
  import { ROPE_ACCESSORIES } from "../shared/constants";
  ```

  And write the test as a sync test:
  ```typescript
  it("ROPE_ACCESSORIES has none as first entry and includes skull/star/diamond", () => {
    const ids = ROPE_ACCESSORIES.map((a) => a.id);
    expect(ids[0]).toBe("none");
    expect(ids).toContain("skull");
    expect(ids).toContain("star");
    expect(ids).toContain("diamond");
  });
  ```

  Run: `npx vitest run tests/simulation.test.ts`

  Expected: FAIL — `ROPE_ACCESSORIES` is not exported from constants.

- [ ] **Step 2: Add `ROPE_ACCESSORIES` to `shared/constants.ts`**

  Append to the bottom of `shared/constants.ts`:

  ```typescript
  export const ROPE_ACCESSORIES = [
    { id: "none",    name: "None"    },
    { id: "skull",   name: "Skull"   },
    { id: "star",    name: "Star"    },
    { id: "diamond", name: "Diamond" },
    { id: "bolt",    name: "Bolt"    },
    { id: "fire",    name: "Fire"    },
    { id: "eye",     name: "Eye"     },
    { id: "heart",   name: "Heart"   }
  ] as const;

  export type RopeAccessoryId = typeof ROPE_ACCESSORIES[number]["id"];
  ```

  Run: `npx vitest run tests/simulation.test.ts`

  Expected: new test passes, all 9 existing tests still pass.

- [ ] **Step 3: Add `ropeAccessoryId` to `PlayerState` in `shared/types.ts`**

  In `shared/types.ts`, add `ropeAccessoryId?: string` to `PlayerState`:

  ```typescript
  export type PlayerState = {
    id: EntityId;
    name: string;
    skinId: string;
    color: string;
    accent: string;
    score: number;
    boost: number;
    alive: boolean;
    bot: boolean;
    boosting: boolean;
    speed: number;
    heading: number;
    targetHeading: number;
    segments: SnakeSegment[];
    segmentProgress: number;
    kills: number;
    deathAt?: number;
    ropeAccessoryId?: string;
  };
  ```

  Also add `ropeAccessoryId?: string` to the `join` variant in `ClientMessage`:

  ```typescript
  export type ClientMessage =
    | { type: "join"; name: string; skinId?: string; ropeAccessoryId?: string }
    | { type: "input"; input: ClientInput; seq: number }
    | { type: "ping"; nonce: number }
    | { type: "respawn" };
  ```

- [ ] **Step 4: Update `createPlayer` in `shared/simulation.ts` to accept `ropeAccessoryId`**

  Change the signature at line 59:
  ```typescript
  export function createPlayer(world: World, id: string, name: string, bot = false, skinId?: string, ropeAccessoryId?: string): PlayerState {
  ```

  Inside the function body, add `ropeAccessoryId` to the player object (after `kills: 0`):
  ```typescript
  const player: PlayerState = {
    id,
    name: sanitizeName(name, bot ? "Bot" : "Player"),
    skinId: skin.id,
    color: skin.color || fallbackColor,
    accent: skin.accent,
    score: MIN_SCORE,
    boost: 100,
    alive: true,
    bot,
    boosting: false,
    speed: BASE_SPEED,
    heading,
    targetHeading: heading,
    segments: makeSegments(spawn, heading, START_LENGTH),
    segmentProgress: 0,
    kills: 0,
    ropeAccessoryId
  };
  ```

- [ ] **Step 5: Write a test that `createPlayer` stores `ropeAccessoryId`**

  Add to `tests/simulation.test.ts`:

  ```typescript
  it("createPlayer stores ropeAccessoryId on the player state", () => {
    const world = createWorld(99);
    const player = createPlayer(world, "rope_test", "RopePlayer", false, "cyan-core", "skull");
    expect(player.ropeAccessoryId).toBe("skull");
  });
  ```

  Run: `npx vitest run tests/simulation.test.ts`

  Expected: all tests pass (the new one too).

- [ ] **Step 6: Update `server/index.ts` join handler to forward `ropeAccessoryId`**

  In `server/index.ts` at line 70, change:
  ```typescript
  const player = createPlayer(world, id, message.name, false, message.skinId);
  ```
  To:
  ```typescript
  const player = createPlayer(world, id, message.name, false, message.skinId, message.ropeAccessoryId);
  ```

- [ ] **Step 7: Update `useGameClient.ts` to include `ropeAccessoryId` in the join message**

  Change the function signature at line 6:
  ```typescript
  export function useGameClient(enabled: boolean, profile: { name: string; skinId: string; ropeAccessoryId?: string }) {
  ```

  Change the join message at line 28 (inside `socket.addEventListener("open", ...)`):
  ```typescript
  socket.send(JSON.stringify({ type: "join", name: profile.name, skinId: profile.skinId, ropeAccessoryId: profile.ropeAccessoryId }));
  ```

- [ ] **Step 8: Update smoke test fixture to include `ropeAccessoryId`**

  In `tests/client-smoke.test.tsx`, add `ropeAccessoryId: "none"` to the `PlayerState` fixture object (it's optional but adding it prevents future type drift):

  ```typescript
  const snapshot: ServerSnapshot = {
    type: "snapshot",
    tick: 1,
    serverTime: Date.now(),
    players: [
      {
        id: "you",
        name: "You",
        skinId: "cyan-core",
        color: "#22d8ff",
        accent: "#b9f6ff",
        score: 12840,
        boost: 76,
        alive: true,
        bot: false,
        boosting: false,
        speed: 168,
        heading: 0,
        targetHeading: 0,
        segments: [{ x: 1000, y: 900 }],
        segmentProgress: 0,
        kills: 0,
        ropeAccessoryId: "none"
      }
    ],
    food: [{ id: "food_1", x: 700, y: 600, color: "#ffd24d", value: 2, driftAngle: 0, driftSpeed: 0 }],
    leaderboard: [{ id: "you", name: "You", score: 12840, color: "#22d8ff", you: true }]
  };
  ```

- [ ] **Step 9: Run all tests**

  Run: `npx vitest run`

  Expected: all tests pass.

- [ ] **Step 10: Commit**

  ```bash
  git add shared/constants.ts shared/types.ts shared/simulation.ts server/index.ts client/src/game/useGameClient.ts tests/simulation.test.ts tests/client-smoke.test.tsx
  git commit -m "feat: add ROPE_ACCESSORIES constant and ropeAccessoryId to PlayerState/join message"
  ```

---

## Task 5: Rope Physics + Rendering in PixiGame.tsx

**Files:**
- Modify: `client/src/game/PixiGame.tsx`

- [ ] **Step 1: Add `RopeState` type at the top of PixiGame.tsx**

  Add after the existing type declarations (after `WorldBounds` type, around line 35):

  ```typescript
  type RopeState = {
    x: number;
    y: number;
    vx: number;
    vy: number;
  };
  ```

- [ ] **Step 2: Add `ropeStates` Map to the render loop closure**

  Inside the `useEffect` callback (after `const deathEffects: DeathEffect[] = [];` around line 91), add:

  ```typescript
  const ropeStates = new Map<string, RopeState>();
  ```

- [ ] **Step 3: Wire `updateRopeState` call and pass rope to `drawSnake` in `drawFrame`**

  In `drawFrame`, find:
  ```typescript
  const sorted = [...renderedPlayers].sort((a, b) => a.segments.length - b.segments.length);
  for (const player of sorted) drawSnake(snakes, labels, player, player.id === playerIdRef.current, view, undefined);
  ```

  Replace with:
  ```typescript
  const sorted = [...renderedPlayers].sort((a, b) => a.segments.length - b.segments.length);
  for (const player of sorted) {
    updateRopeState(ropeStates, player, dt);
    drawSnake(snakes, labels, player, player.id === playerIdRef.current, view, ropeStates.get(player.id));
  }
  ```

  Also remove dead players from ropeStates to prevent memory leaks. Add after the `smoothPlayers` call:
  ```typescript
  const renderedPlayers = smoothPlayers(renderPlayers, state?.players ?? [], dt, deathEffects);
  // Clean up rope states for removed players
  for (const id of ropeStates.keys()) {
    if (!renderedPlayers.find((p) => p.id === id)) ropeStates.delete(id);
  }
  ```

- [ ] **Step 4: Copy `ropeAccessoryId` in `smoothPlayers`**

  In `smoothPlayers`, inside the loop that updates existing cached players, add `ropeAccessoryId` copy after the `skinId` copy (around line 411):

  ```typescript
  current.color = target.color;
  current.accent = target.accent;
  current.skinId = target.skinId;
  current.ropeAccessoryId = target.ropeAccessoryId;
  ```

- [ ] **Step 5: Add `updateRopeState` function**

  Add this function anywhere near the bottom of PixiGame.tsx (before the utility functions section):

  ```typescript
  function updateRopeState(states: Map<string, RopeState>, player: PlayerState, dt: number): void {
    if (!player.ropeAccessoryId || player.ropeAccessoryId === "none" || !player.alive || player.segments.length === 0) {
      states.delete(player.id);
      return;
    }
    const head = player.segments[0];
    const ropeLength = 44;
    const targetX = head.x - Math.cos(player.heading) * ropeLength;
    const targetY = head.y - Math.sin(player.heading) * ropeLength;

    let state = states.get(player.id);
    if (!state) {
      states.set(player.id, { x: targetX, y: targetY, vx: 0, vy: 0 });
      return;
    }

    const springK = 14;
    const damping = 0.84;
    const fx = (targetX - state.x) * springK * dt;
    const fy = (targetY - state.y) * springK * dt;
    state.vx = (state.vx + fx) * damping;
    state.vy = (state.vy + fy) * damping;
    state.x += state.vx * dt;
    state.y += state.vy * dt;
  }
  ```

- [ ] **Step 6: Add `drawRopeAccessory` and icon helper functions**

  Add these functions to PixiGame.tsx:

  ```typescript
  function drawRopeAccessory(graphics: Graphics, accessoryId: string, cx: number, cy: number, accent: number): void {
    graphics.circle(cx, cy, 12).fill({ color: 0x1a2030, alpha: 1 });
    graphics.circle(cx, cy, 12).stroke({ color: 0xc8dce8, alpha: 0.3, width: 1.2 });
    const r = 7;
    switch (accessoryId) {
      case "skull":   drawSkullIcon(graphics, cx, cy, r, accent); break;
      case "star":    graphics.poly(starIconPoints(cx, cy, r, r * 0.42)).fill({ color: accent, alpha: 1 }); break;
      case "diamond": graphics.poly([cx, cy - r, cx + r * 0.58, cy, cx, cy + r, cx - r * 0.58, cy]).fill({ color: accent, alpha: 1 }); break;
      case "bolt":    graphics.poly(boltIconPoints(cx, cy, r)).fill({ color: accent, alpha: 1 }); break;
      case "fire":    drawFireIcon(graphics, cx, cy, r, accent); break;
      case "eye":     drawEyeIcon(graphics, cx, cy, r, accent); break;
      case "heart":   drawHeartIcon(graphics, cx, cy, r, accent); break;
    }
  }

  function starIconPoints(cx: number, cy: number, outer: number, inner: number): number[] {
    const pts: number[] = [];
    for (let i = 0; i < 10; i += 1) {
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      const r = i % 2 === 0 ? outer : inner;
      pts.push(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    }
    return pts;
  }

  function boltIconPoints(cx: number, cy: number, r: number): number[] {
    return [cx + 1.5, cy - r, cx - 2.5, cy - 0.5, cx + 2, cy - 0.5, cx - 1.5, cy + r, cx + 2.5, cy + 0.5, cx - 2, cy + 0.5];
  }

  function drawSkullIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
    g.circle(cx, cy - r * 0.1, r * 0.78).fill({ color, alpha: 1 });
    g.circle(cx - r * 0.28, cy - r * 0.16, r * 0.28).fill({ color: 0x1a2030, alpha: 1 });
    g.circle(cx + r * 0.28, cy - r * 0.16, r * 0.28).fill({ color: 0x1a2030, alpha: 1 });
    const tw = r * 0.18, th = r * 0.28, ty = cy + r * 0.42;
    for (let i = -1; i <= 1; i += 1) {
      g.rect(cx + i * r * 0.28 - tw / 2, ty, tw, th).fill({ color, alpha: 1 });
    }
  }

  function drawFireIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
    g.circle(cx, cy + r * 0.18, r * 0.62).fill({ color, alpha: 1 });
    g.circle(cx, cy - r * 0.08, r * 0.42).fill({ color, alpha: 0.85 });
    g.circle(cx, cy - r * 0.58, r * 0.24).fill({ color, alpha: 0.7 });
  }

  function drawEyeIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
    g.circle(cx - r * 0.3, cy, r * 0.52).fill({ color, alpha: 1 });
    g.circle(cx + r * 0.3, cy, r * 0.52).fill({ color, alpha: 1 });
    g.rect(cx - r * 0.7, cy - r * 0.52, r * 1.4, r * 1.04).fill({ color, alpha: 1 });
    g.circle(cx, cy, r * 0.36).fill({ color: 0x1a2030, alpha: 1 });
    g.circle(cx + r * 0.1, cy - r * 0.1, r * 0.14).fill({ color: 0xffffff, alpha: 1 });
  }

  function drawHeartIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
    g.circle(cx - r * 0.28, cy - r * 0.1, r * 0.42).fill({ color, alpha: 1 });
    g.circle(cx + r * 0.28, cy - r * 0.1, r * 0.42).fill({ color, alpha: 1 });
    g.poly([cx - r * 0.7, cy + r * 0.08, cx + r * 0.7, cy + r * 0.08, cx, cy + r]).fill({ color, alpha: 1 });
  }
  ```

- [ ] **Step 7: Run typecheck**

  Run: `npx tsc --noEmit`

  Expected: zero errors.

- [ ] **Step 8: Verify rope accessory in dev server**

  In the game, temporarily hardcode a `ropeAccessoryId` on a bot player in the browser console, or directly edit `server/index.ts` to set `ropeAccessoryId: "skull"` in `createPlayer` calls for bots. Verify:
  - A thin string connects from the head to a small circle behind it
  - The circle swings outward when the snake turns
  - The skull icon renders inside the circle

- [ ] **Step 9: Commit**

  ```bash
  git add client/src/game/PixiGame.tsx
  git commit -m "feat: add rope accessory spring physics and per-icon PixiJS rendering"
  ```

---

## Task 6: Main Menu Redesign + App State Wiring

**Files:**
- Modify: `client/src/App.tsx`
- Modify: `client/src/components/MainMenu.tsx`
- Modify: `client/src/styles.css`

- [ ] **Step 1: Add `ropeAccessoryId` state and profile wiring in `App.tsx`**

  In `client/src/App.tsx`, add `ropeAccessoryId` state:

  ```typescript
  const [ropeAccessoryId, setRopeAccessoryId] = useState("none");
  ```

  Update the `profile` memo to include it:

  ```typescript
  const profile = useMemo(() => ({ name: name.trim() || "You", skinId, ropeAccessoryId }), [name, skinId, ropeAccessoryId]);
  ```

  Add `ropeAccessoryId` and `onRopeAccessoryChange` props to the `<MainMenu>` component render:

  ```typescript
  <MainMenu
    name={name}
    skinId={skinId}
    hatId={hatId}
    ropeAccessoryId={ropeAccessoryId}
    onNameChange={setName}
    onSkinChange={setSkinId}
    onHatChange={setHatId}
    onRopeAccessoryChange={setRopeAccessoryId}
    onStart={() => {
      setStarted(true);
      setPaused(false);
    }}
  />
  ```

- [ ] **Step 2: Add `.rope-options`, `.rope-card`, and `.cosmetic-badge-new` to `styles.css`**

  Append to the end of `client/src/styles.css`:

  ```css
  .rope-options {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }

  .rope-card {
    min-height: 72px;
    border: 1px solid rgba(182, 220, 240, 0.18);
    border-radius: 8px;
    color: #dbefff;
    background: rgba(3, 14, 23, 0.7);
    display: grid;
    justify-items: center;
    align-content: center;
    gap: 7px;
    cursor: pointer;
    transition:
      transform 160ms ease,
      border-color 160ms ease,
      background 160ms ease;
  }

  .rope-card:hover,
  .rope-card.selected {
    transform: translateY(-2px);
    border-color: rgba(34, 216, 255, 0.86);
    background: rgba(5, 28, 42, 0.9);
  }

  .rope-card span {
    font-size: 20px;
    line-height: 1;
  }

  .rope-card b {
    font-size: 12px;
    line-height: 1.1;
  }

  .cosmetic-badge-new {
    display: inline-flex;
    align-items: center;
    padding: 2px 8px;
    border: 1px solid rgba(34, 216, 255, 0.5);
    border-radius: 20px;
    background: rgba(34, 216, 255, 0.15);
    color: var(--cyan);
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.5px;
  }
  ```

  Also update the responsive breakpoints for `.rope-options` at `@media (max-width: 640px)`:

  ```css
  @media (max-width: 640px) {
    /* existing rules ... */
    .rope-options {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  ```

- [ ] **Step 3: Rewrite `MainMenu.tsx`**

  Replace the entire content of `client/src/components/MainMenu.tsx` with:

  ```typescript
  import type { CSSProperties } from "react";
  import { Crown, Palette, Play, Radio, User, Zap } from "lucide-react";
  import { ROPE_ACCESSORIES, SNAKE_SKINS } from "../../../shared/constants";

  type MainMenuProps = {
    name: string;
    skinId: string;
    hatId: string;
    ropeAccessoryId: string;
    onNameChange: (name: string) => void;
    onSkinChange: (skinId: string) => void;
    onHatChange: (hatId: string) => void;
    onRopeAccessoryChange: (id: string) => void;
    onStart: () => void;
  };

  const HAT_OPTIONS = [
    { id: "none",   name: "None",  mark: "—" },
    { id: "crown",  name: "Crown", mark: "👑" },
    { id: "halo",   name: "Halo",  mark: "○" },
    { id: "visor",  name: "Visor", mark: "◧" }
  ] as const;

  const ROPE_EMOJI: Record<string, string> = {
    none:    "—",
    skull:   "☠️",
    star:    "⭐",
    diamond: "💎",
    bolt:    "⚡",
    fire:    "🔥",
    eye:     "👁️",
    heart:   "❤️"
  };

  const PREVIEW_SEGMENTS = Array.from({ length: 10 }, (_, index) => index);

  export function MainMenu({ name, skinId, hatId, ropeAccessoryId, onNameChange, onSkinChange, onHatChange, onRopeAccessoryChange, onStart }: MainMenuProps) {
    const selectedSkin = SNAKE_SKINS.find((skin) => skin.id === skinId) ?? SNAKE_SKINS[0];
    const selectedHat = HAT_OPTIONS.find((hat) => hat.id === hatId) ?? HAT_OPTIONS[0];
    const selectedRope = ROPE_ACCESSORIES.find((acc) => acc.id === ropeAccessoryId) ?? ROPE_ACCESSORIES[0];
    const previewStyle = {
      "--skin-color": selectedSkin.color,
      "--skin-accent": selectedSkin.accent,
      "--skin-shadow": selectedSkin.shadow
    } as CSSProperties;

    return (
      <section className="main-menu" aria-label="Slithera main menu">
        <div className="menu-backdrop" />
        <div className="menu-panel" style={previewStyle}>
          <div className="menu-topbar">
            <div className="menu-brand">
              <h1>SLITHERA</h1>
              <span>Arena Loadout</span>
            </div>
            <div className="menu-online">
              <Radio size={16} />
              <span>Live Arena</span>
            </div>
          </div>

          <div className="menu-grid">
            <section className="menu-profile" aria-label="Player profile">
              <label className="name-field">
                <span>
                  <User size={17} />
                  Player Name
                </span>
                <input maxLength={16} value={name} onChange={(event) => onNameChange(event.target.value)} aria-label="Player name" />
              </label>

              <div className="menu-loadout-summary">
                <span>{selectedSkin.name}</span>
                <b>
                  {selectedHat.id !== "none" ? selectedHat.name : "No hat"}
                  {selectedRope.id !== "none" ? ` · ${selectedRope.name}` : ""}
                </b>
              </div>

              <button className="menu-start" type="button" onClick={onStart}>
                <Play size={24} fill="currentColor" />
                <span>Enter Arena</span>
                <Zap size={22} fill="currentColor" />
              </button>
            </section>

            <section className="menu-preview" aria-label="Snake preview">
              <div className="preview-stage">
                <div className="preview-snake">
                  {PREVIEW_SEGMENTS.map((index) => (
                    <i key={index} />
                  ))}
                  <b>
                    <span />
                    <span />
                  </b>
                </div>
                {selectedHat.id !== "none" ? <em>{selectedHat.mark}</em> : null}
                {selectedRope.id !== "none" ? (
                  <div className="preview-rope-item" aria-hidden="true">
                    {ROPE_EMOJI[selectedRope.id]}
                  </div>
                ) : null}
              </div>
            </section>

            <section className="menu-cosmetics" aria-label="Cosmetic loadout">
              <div className="cosmetic-header">
                <Palette size={18} />
                <span>Snake Skin</span>
              </div>
              <div className="skin-options">
                {SNAKE_SKINS.map((skin) => (
                  <button
                    className={skin.id === skinId ? "skin-card selected" : "skin-card"}
                    key={skin.id}
                    type="button"
                    onClick={() => onSkinChange(skin.id)}
                    aria-label={skin.name}
                  >
                    <i style={{ background: skin.color, boxShadow: `0 0 18px ${skin.color}` }} />
                    <b>{skin.name}</b>
                  </button>
                ))}
              </div>

              <div className="cosmetic-header">
                <Crown size={18} fill="currentColor" />
                <span>Hat</span>
              </div>
              <div className="hat-options">
                {HAT_OPTIONS.map((hat) => (
                  <button
                    className={hat.id === hatId ? "hat-card selected" : "hat-card"}
                    key={hat.id}
                    type="button"
                    onClick={() => onHatChange(hat.id)}
                    aria-label={hat.name}
                  >
                    <span>{hat.mark}</span>
                    <b>{hat.name}</b>
                  </button>
                ))}
              </div>

              <div className="cosmetic-header">
                <span>🪢 Rope Item</span>
                <span className="cosmetic-badge-new">NEW</span>
              </div>
              <div className="rope-options">
                {ROPE_ACCESSORIES.map((acc) => (
                  <button
                    className={acc.id === ropeAccessoryId ? "rope-card selected" : "rope-card"}
                    key={acc.id}
                    type="button"
                    onClick={() => onRopeAccessoryChange(acc.id)}
                    aria-label={acc.name}
                  >
                    <span>{ROPE_EMOJI[acc.id]}</span>
                    <b>{acc.name}</b>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </section>
    );
  }
  ```

- [ ] **Step 4: Add `.preview-rope-item` CSS to position the emoji accessory icon in the preview**

  In `client/src/styles.css`, add after `.preview-stage em`:

  ```css
  .preview-rope-item {
    position: absolute;
    left: 154px;
    top: 88px;
    font-size: 18px;
    line-height: 1;
    filter: drop-shadow(0 0 4px rgba(34, 216, 255, 0.4));
  }
  ```

- [ ] **Step 5: Run all tests**

  Run: `npx vitest run`

  Expected: all tests pass.

- [ ] **Step 6: Run typecheck**

  Run: `npx tsc --noEmit`

  Expected: zero errors.

- [ ] **Step 7: Verify full flow in dev server**

  Run: `npm run dev`

  Verify:
  1. Main menu shows Hat section (Crown/Halo/Visor/None) and new Rope Item section with 8 options
  2. Selecting a rope accessory shows its emoji near the preview snake head
  3. "future-slots" placeholder is gone
  4. Clicking "Enter Arena" with a rope accessory selected → the snake in-game has the accessory on a string that swings when turning
  5. Other players (bots) without `ropeAccessoryId` show no accessory

- [ ] **Step 8: Commit**

  ```bash
  git add client/src/App.tsx client/src/components/MainMenu.tsx client/src/styles.css
  git commit -m "feat: add rope item cosmetic slot to main menu and wire ropeAccessoryId through app state"
  ```

---

## Self-Review Checklist

**Spec coverage:**
- [x] Snake circle rendering (Task 3)
- [x] Tail growth stutter fix (Task 2)
- [x] Remove head glow (Task 1)
- [x] Hide mouse cursor (Task 1)
- [x] Rope accessory constants + types + server (Task 4)
- [x] Rope spring physics (Task 5)
- [x] Rope icon rendering — all 7 icons (Task 5)
- [x] ropeAccessoryId propagation App→profile→join→PlayerState (Task 4 + Task 6)
- [x] Main menu Rope Item section active (Task 6)
- [x] Remove future-slots placeholder (Task 6)

**Type consistency:**
- `RopeState` defined in Task 5 Step 1; referenced in Task 3 Step 1 (forward reference — note in that step to complete Task 5 before running typecheck)
- `ROPE_ACCESSORIES` defined in Task 4 Step 2; used in Task 6 Step 3 (correct)
- `ropeAccessoryId` added to `PlayerState` in Task 4 Step 3; read in Task 5 Step 4 (correct)
- `drawRopeAccessory` defined in Task 5 Step 6; called in Task 3 Step 1 inside `drawSnake` (forward reference — resolved once both tasks complete)

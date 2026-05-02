# Slithera — Gameplay & Visual Overhaul Design

**Date:** 2026-05-02  
**Status:** Approved

---

## Overview

A focused overhaul of Slithera covering five areas: snake rendering style, tail growth bug fix, two quick visual fixes, a new rope accessory cosmetic system, and a main menu redesign to expose the new cosmetic slot.

---

## 1. Snake Rendering — Slither.io Circle Style

**Problem:** Current renderer uses `drawSmoothStroke` (quadratic-curve-based stroke paths) producing a tube/pipe aesthetic. The user wants the slither.io look: individual overlapping circles at each segment position.

**Solution:** Replace `drawSmoothStroke` calls in `drawSnake` (PixiGame.tsx) with per-segment circle rendering.

### Rendering Rules
- Each segment index `i` renders as a filled circle at `segments[i]`
- **Body radius:** `14 * growth` (uniform from neck to near-tail)
- **Tail taper:** for the last 20% of segments, radius scales linearly from `14 * growth` down to `9 * growth`
- **Head:** larger circle `16 * growth`, no dark outline shadow circle (the current `22.5 * growth` dark circle is removed)
- **Head accent:** small shimmer circle at upper-left of head (`radius * 0.32`, accent color, alpha 0.22)
- **Eyes:** unchanged — two dark circles + white highlight dots, positioned via `player.heading`
- **Render order:** tail-first (index `segments.length-1` → 0) so head draws on top
- **Segment overlap:** circles spaced at `SEGMENT_SPACING = 18` with radius ~14 → natural overlap creates solid body

### What is Removed
- `drawSmoothStroke` function (can be deleted)
- `drawTailCap` function (replaced by taper)
- `sampledPath` function (no longer needed)
- The dark shadow outline circle on the head (`graphics.circle(head.x, head.y, 22.5 * growth)`)

### Performance
- Skip segments outside `view` bounds (existing culling logic applies per-segment)
- For snakes > 180 segments, render every other body segment (stride 2), keep head + last 10 tail segments always rendered

---

## 2. Tail Growth Stutter Fix

**Problem:** When a snake eats food and its segment count increases, the tail visually stutters/pops instead of growing smoothly. Root cause: in `approachRenderedLength` (PixiGame.tsx), new segments are added via `extendRenderedTail` (a geometric extrapolation) rather than using the authoritative position from the server snapshot.

**Solution:** In `approachRenderedLength`, when adding a new segment, use `target.segments[player.segments.length]` if it exists (server has already computed the correct position), falling back to `extendRenderedTail` only when the server hasn't added the segment yet.

```typescript
// In approachRenderedLength, growing branch:
while (player.segments.length < targetLength && player.visualSegmentProgress >= 1) {
  const serverPos = target.segments[player.segments.length];
  const newSeg = serverPos
    ? { x: serverPos.x, y: serverPos.y }
    : extendRenderedTail(player.segments, SEGMENT_SPACING, player.heading);
  player.segments.push(newSeg);
  player.visualSegmentProgress -= 1;
}
```

**Note:** `drawSmoothStroke`, `drawTailCap`, and `sampledPath` helper functions in PixiGame.tsx become unused after this change and should be deleted.

---

## 3. Quick Fixes

### 3a. Remove Mouse Cursor (Direction Arrow)
**File:** `client/src/styles.css`  
**Change:** Add `cursor: none;` to `.pixi-canvas`

### 3b. Remove Head Glow
**File:** `client/src/game/PixiGame.tsx`, `drawSnake` function  
**Change:** Remove the line:
```typescript
graphics.circle(head.x, head.y, 22.5 * growth).fill({ color: 0x061018, alpha: 0.82 });
```
This dark shadow circle creates the halo/glow appearance around the head.

---

## 4. Rope Accessory System

A new cosmetic slot: a small accessory icon attached to the snake's head by a visible string, following with spring physics.

### Constants (`shared/constants.ts`)
New export:
```typescript
export const ROPE_ACCESSORIES = [
  { id: 'none',    name: 'None'    },
  { id: 'skull',   name: 'Skull'   },
  { id: 'star',    name: 'Star'    },
  { id: 'diamond', name: 'Diamond' },
  { id: 'bolt',    name: 'Bolt'    },
  { id: 'fire',    name: 'Fire'    },
  { id: 'eye',     name: 'Eye'     },
  { id: 'heart',   name: 'Heart'   },
] as const;
```

### Types (`shared/types.ts`)
Add `ropeAccessoryId?: string` to player join message and `PlayerState`.

### Physics (client-only, `PixiGame.tsx`)
Each rendered player gets a `RopeState`:
```typescript
type RopeState = { x: number; y: number; vx: number; vy: number };
```
Stored in a `Map<string, RopeState>` inside the render loop closure.

**Per-frame update** (inside `smoothPlayers` or a new `updateRopeState` call):
```
ropeLength = 44px (from center of head)
targetX = head.x - cos(heading) * ropeLength
targetY = head.y - sin(heading) * ropeLength

springK = 14
dampingFactor = 0.84

fx = (targetX - rope.x) * springK * dt
fy = (targetY - rope.y) * springK * dt

rope.vx = (rope.vx + fx) * dampingFactor
rope.vy = (rope.vy + fy) * dampingFactor
rope.x += rope.vx * dt
rope.y += rope.vy * dt
```

On player spawn/first frame: initialize rope position at `targetX, targetY` with zero velocity.

### Rendering
In `drawSnake`, after drawing the head, if `player.ropeAccessoryId` is set and not `'none'`:

1. **String:** thin line from `(head.x - cos(heading)*18, head.y - sin(heading)*18)` to `(rope.x, rope.y)` — color `rgba(200,220,240,0.5)`, width 1.8px
2. **Accessory background:** filled circle at `(rope.x, rope.y)`, radius 12, color `#1a2030`, slight border
3. **Accessory icon:** geometric shape drawn with PixiJS Graphics, color matches `player.accent`

### Accessory Icon Shapes (all drawn with PixiJS Graphics)
| ID | Shape |
|----|-------|
| skull | Two eye-circles + three rectangular teeth |
| star | 5-point star polygon |
| diamond | 4-point diamond polygon |
| bolt | Lightning bolt polygon |
| fire | Teardrop + flame polygon |
| eye | Ellipse + pupil circle |
| heart | Two circles + triangle |

### Server-side
The server does NOT simulate rope physics — this is purely cosmetic/client-side. `ropeAccessoryId` is transmitted in the snapshot as part of `PlayerState`.

Add `ropeAccessoryId` to `createPlayer` signature and `join` message handling in `server/index.ts`.

---

## 5. Main Menu Redesign

### Layout
Keep the existing 3-column grid but update content:

**Column 1 (Profile):** unchanged — name input, loadout summary, Enter Arena button  
**Column 2 (Preview):** update the CSS-based snake preview to show:
- Circle-segment snake (matching new render style)  
- Rope + accessory icon visible in preview

**Column 3 (Cosmetics):** 
- **Snake Skin** section: unchanged (5 skin cards)
- **Hat** section: rename from "Hat Locker" to just "Hat", keep Crown/Halo/Visor/None
- **Rope Item** section: NEW active slot with "NEW" badge, 8 accessory cards (2×4 grid), icons as emoji in card buttons
- Remove the "future-slots" locked placeholder div entirely

### State
Add `ropeAccessoryId` to `App.tsx` state alongside `hatId`. Pass down to `MainMenu` and include in `profile` object sent to `useGameClient`.

### CSS
- Add `.rope-options` grid (same style as `.hat-options` but 4 columns)
- Add `.rope-card` button (same style as `.hat-card`)
- Add `.cosmetic-badge-new` for the "NEW" pill

---

## Files Changed

| File | Changes |
|------|---------|
| `shared/constants.ts` | Add `ROPE_ACCESSORIES` array |
| `shared/types.ts` | Add `ropeAccessoryId?: string` to `PlayerState` and join message type |
| `server/index.ts` | Accept `ropeAccessoryId` in join message, store on PlayerState |
| `client/src/styles.css` | `cursor: none` on `.pixi-canvas`; new `.rope-options`, `.rope-card`, `.cosmetic-badge-new` |
| `client/src/App.tsx` | Add `ropeAccessoryId` state, pass to `MainMenu` and `profile` |
| `client/src/components/MainMenu.tsx` | Add Rope Item section, update preview snake, remove future-slots |
| `client/src/game/PixiGame.tsx` | Circle rendering, remove head glow, rope physics + rendering |

---

## Out of Scope

- Server-side rope physics (client-only)
- Sound effects
- New skins
- Mobile-specific layout changes
- Hat rendering in-game (existing hat system rendering unchanged for now)

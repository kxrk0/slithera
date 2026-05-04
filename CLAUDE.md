# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Slithera** is a production-oriented multiplayer arena snake game with an authoritative WebSocket server backend and a React + PixiJS client frontend. The game features cosmetics unlocked through Firebase authentication, exclusive developer tools, and persistent player progression.

### Architecture

The codebase is split into three main areas:

- **`client/src/`** — React app (Vite) with PixiJS canvas rendering, UI components (modals, HUD), and game state management via WebSocket
- **`server/`** — Authoritative Node.js WebSocket server that runs the game simulation, broadcasts snapshots at 45 Hz, and handles player input
- **`shared/`** — Types, constants, and deterministic game simulation logic (physics, collision, spawn logic) shared between client and server

### Key Technologies

- **Frontend**: React 19, PixiJS 8, Vite 7, TypeScript, Firebase Auth
- **Backend**: Node.js, WebSocket (ws library)
- **Testing**: Vitest with jsdom for browser-like environment
- **Build**: Multi-stage TypeScript compilation (client via Vite, server via tsc)
- **Deployment**: Docker with multi-stage build (compile stage → production image)

## Common Commands

### Development

```bash
# Start dev server (runs client on :5173 + server on :8787 concurrently)
npm run dev

# Stop the dev server (kills lingering processes)
npm run stop
```

The dev setup uses Vite's proxy (`/ws` → `localhost:8787`) so the client connects to the server without CORS issues. Open `http://localhost:5173` after `npm run dev` is ready.

### Testing & Checks

```bash
# Run all tests (Vitest, single run)
npm run test

# Type-check both client and server
npm run typecheck

# Build and check for errors (does typecheck first)
npm run build
```

### Production Build

```bash
# Full build (typecheck → vite build → tsc server)
npm run build

# Test the production build locally
npm run preview

# Start the production server (serves client from dist/ + WS endpoint)
npm start
```

The production server runs on port 8787 (configurable via `PORT` env var) and serves both the built client SPA and the WebSocket endpoint at `/ws`.

## Code Structure & Patterns

### Shared Simulation (`shared/simulation.ts`)

The authoritative game logic lives here. Key functions:

- **`createWorld(seed)`** — Initialize game world with deterministic RNG, food, and bot players
- **`stepWorld(world, dt)`** — Advance physics/collision by dt milliseconds (called at 60 Hz server-side)
- **`applyInput(player, input, heading)`** — Apply player steering/boost
- **`createPlayer(world, name, uid, ...cosmetics)`** — Spawn new player with safe spawn point
- **`respawn(world, playerId)`** — Respawn dead player with safe spawn logic
- **`makeSnapshot(world, tick)`** — Build server snapshot for broadcast (leaderboard, players, food)

Safe spawning (introduced to prevent spawn-camping):
- `safeSpawnPoint(world, margin)` evaluates 16 random candidates and returns the point furthest from all living players' heads (min 320px distance when possible)

### Server (`server/index.ts`)

- Creates HTTP + WebSocket server on port 8787
- Maintains `world` object and broadcast loop (SNAPSHOT_RATE = 45 Hz)
- Processes per-socket input, rate-limited (60 msg/sec sustained, 30 burst)
- Handles `/health` endpoint for monitoring (uptime, player counts, tick)
- Serves compiled client from `dist/` in production; dev mode requires Vite

### Client Game Loop (`client/src/game/useGameClient.ts` + `PixiGame.tsx`)

- `useGameClient` — React hook managing WebSocket connection, input buffer, and snapshot interpolation
- `PixiGame` — PixiJS renderer drawing players, food, effects; synced to snapshot state
- **Important**: All Pixi Text objects must be explicitly `.destroy()` before removal to prevent GPU memory leak (see: drawFrame in PixiGame.tsx)

### React Components

- **`GameHud.tsx`** — HUD overlay (leaderboard, killfeed, pause, death screens) with cosmetic rendering
- **`PixiGame.tsx`** — Canvas container; 60 FPS render loop with interpolation
- **`menu/*`** — Modals for cosmetics, stats, achievements, quests, market, wardrobe
- **`WarmGoldMenu.tsx`** — Main menu, profile, and loadout selection

### Client Data Layers

- **`lib/auth.ts`** — Firebase integration, user sign-in/out, UID tracking
- **`lib/loadout.ts`** — Save/load player cosmetics and name to localStorage
- **`lib/inventory.ts`** — Cosmetics ownership tracking (skins, hats, charms, emotes)
- **`lib/stats.ts`** — Match history and lifetime stats
- **`lib/economy.ts`** — Coins/XP reward tracking and spending
- **`lib/achievements.ts`** — Unlock logic and display

### Exclusive Features

- **Developer Badge**: Controlled by `DEV_UIDS` array in `shared/exclusive.ts`
  - Check UID via `isDevUid(uid)`, set `isDev` flag in PlayerState
  - Renders red "DEV" badge in-game (left of name) and leaderboard
  - Add new dev UID to DEV_UIDS to grant the badge

- **Exclusive Skins**: Defined in `shared/exclusive.ts` with `EXCLUSIVE_SKIN_OWNERS` map
  - Check ownership in client via `exclusive/hasSkin(uid, skinId)`
  - Prevent purchase/equipping via `exclusive/canEquipSkin(uid, skinId)`

## Performance & Memory Notes

### GPU Memory (PixiJS Text)

Text rendering in PixiJS allocates GPU texture memory. Memory leaks occur when Text objects are removed without `.destroy()`:

```js
// CORRECT: destroy before removing
for (const child of labels.children) {
  child.destroy();
}
labels.removeChildren();

// WRONG: memory leak
labels.removeChildren(); // leaves GPU textures allocated
```

This caused the "Chrome grey screen" crash when accumulating thousands of text objects over a long play session. All text-heavy code (player labels, HUD, etc.) must explicitly destroy.

### World Size & Limits

- World bounds: 5200 × 3400 px
- Max segments per snake: 260
- Max food on field: 260 (520 after drops)
- Active player range: 6–14 humans + bots

### Server Simulation

- Tick rate: 60 Hz (16.67 ms per step)
- Snapshot broadcast: 45 Hz (~22 ms per broadcast)
- Bot count scales with human count (4 bots per human target)

## Testing

Tests live in the `tests/` directory and run via Vitest. Test patterns:

- Import from `shared/` directly (no build step)
- Use jsdom environment for DOM/browser APIs
- Mock WebSocket if testing client hooks

Example:
```bash
npm run test -- --watch  # Run tests in watch mode
npm run test -- length   # Run tests matching "length"
```

## Debugging

### Server Logs

The server outputs structured JSON logs (parseable):
```json
{"ts":"2026-05-04T10:30:45.000Z","event":"player_joined","playerId":"abc123","name":"Player"}
```

Monitor via:
```bash
npm run dev:server 2>&1 | jq '.event'  # Filter events
```

### Network (WebSocket)

- Open DevTools (F12) → Network tab
- Filter for WS (WebSocket)
- Click the connection to inspect frames (snapshots, input, events)

### Client Rendering

PixiJS has built-in debugging:
- `window.pixiDebug` in console for PIXI.settings
- Check canvas size: `DevTools → Application → Storage → Local Storage` for `wg-` prefixed keys

## Deployment

### Docker Build

```dockerfile
# Multi-stage: compile → production
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-alpine
COPY --from=build /app/dist /app/dist
COPY --from=build /app/dist-server /app/dist-server
COPY --from=build /app/package.json /app/package.json
EXPOSE 8787
CMD ["npm", "start"]
```

Build & run:
```bash
docker build -t slithera .
docker run -p 8787:8787 -e PORT=8787 slithera
```

### Environment Variables

- `PORT` — Server listen port (default: 8787)
- `NODE_ENV` — Set to `production` for production builds

## Common Edits

### Adding a New Cosmetic (Skin/Hat/Charm)

1. Add the item to `shared/constants.ts` in the appropriate array (`SNAKE_SKINS`, `HAT_OPTIONS`, `ROPE_ACCESSORIES`)
2. If exclusive to a UID, add owner entry in `shared/exclusive.ts` under the relevant map
3. Cosmetic render code is in `PixiGame.tsx` (skins) and `GameHud.tsx` (hats in leaderboard)

### Changing Game Balance

- Update constants in `shared/constants.ts` (speeds, sizes, spawn rates, etc.)
- Safe to change without server restart if client & server stay in sync (restart dev server to apply)

### Fixing Server Stability

- Check for memory leaks in `PixiGame.tsx` text rendering (`.destroy()` all Text objects)
- Monitor world state growth: food count, player count, segment allocation (see: `MAX_SEGMENTS`)
- Profile with `--inspect` flag: `node --inspect dist-server/server/index.js`

## Files to Avoid Modifying

- `package-lock.json` — Auto-generated; commit changes to `package.json` instead
- `dist/` and `dist-server/` — Build outputs; regenerate with `npm run build`
- `.git/` — Use Git commands, not direct file edits

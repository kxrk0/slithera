# Slithera

Slithera is a production-oriented PixiJS arena snake game with a React HUD and an authoritative Node WebSocket server.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:5173`. The Vite dev server proxies `/ws` to the authoritative game server on `http://localhost:8787`.

## Production Build

```bash
npm run build
npm start
```

The production server serves the built client from `dist` and hosts the WebSocket endpoint at `/ws`.

## Checks

```bash
npm run typecheck
npm run test
npm run build
```

## Controls

- Move pointer or finger across the arena to steer.
- Hold pointer/touch or press Space to boost.
- Use Play/Pause, Respawn, and fullscreen controls from the HUD.

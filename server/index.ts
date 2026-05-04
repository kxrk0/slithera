import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer, type WebSocket } from "ws";
import { SNAPSHOT_RATE, TICK_RATE } from "../shared/constants.js";
import { applyInput, createPlayer, createWorld, makeSnapshot, removePlayer, respawn, stepWorld } from "../shared/simulation.js";
import type { ClientMessage, ServerMessage } from "../shared/types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = __dirname.includes(`dist-server${path.sep}server`)
  ? path.resolve(__dirname, "..", "..")
  : path.resolve(__dirname, "..");
const distRoot = path.join(projectRoot, "dist");
const port = Number(process.env.PORT ?? 8787);
const startedAt = Date.now();

// Structured logger — every line a parseable JSON object
function log(event: string, fields: Record<string, unknown> = {}): void {
  // eslint-disable-next-line no-console
  console.log(JSON.stringify({ ts: new Date().toISOString(), event, ...fields }));
}
function logError(event: string, fields: Record<string, unknown> = {}): void {
  // eslint-disable-next-line no-console
  console.error(JSON.stringify({ ts: new Date().toISOString(), level: "error", event, ...fields }));
}

// Per-socket rate limit: token bucket, 60 messages/sec sustained, burst 30.
type SocketState = {
  tokens: number;
  lastRefillMs: number;
  ip: string;
};
const RATE_LIMIT_PER_SEC = 60;
const RATE_LIMIT_BURST = 30;
const socketStates = new WeakMap<WebSocket, SocketState>();

function consumeToken(socket: WebSocket): boolean {
  const state = socketStates.get(socket);
  if (!state) return true;
  const now = Date.now();
  const elapsed = (now - state.lastRefillMs) / 1000;
  state.tokens = Math.min(RATE_LIMIT_BURST, state.tokens + elapsed * RATE_LIMIT_PER_SEC);
  state.lastRefillMs = now;
  if (state.tokens < 1) return false;
  state.tokens -= 1;
  return true;
}

const world = createWorld(Date.now() % 100000);
const sockets = new Map<WebSocket, string>();
const lastEmoteAt = new Map<string, number>();
let shuttingDown = false;
const server = createServer(async (request, response) => {
  if (request.url?.startsWith("/health")) {
    const players = [...world.players.values()];
    const body = {
      ok: true,
      uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
      players: players.length,
      humans: players.filter((p) => !p.bot).length,
      bots: players.filter((p) => p.bot).length,
      food: world.food.size,
      tick: world.tick
    };
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(body));
    return;
  }

  if (request.url?.startsWith("/ws")) {
    response.writeHead(426);
    response.end("WebSocket upgrade required");
    return;
  }

  if (!existsSync(distRoot)) {
    response.writeHead(200, { "content-type": "text/plain; charset=utf-8" });
    response.end("Slithera WebSocket server is running. Start Vite for the client in development.");
    return;
  }

  const url = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  const filePath = path.normalize(path.join(distRoot, requested));

  if (!filePath.startsWith(distRoot)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const content = await readFile(filePath);
    response.writeHead(200, { "content-type": contentType(filePath) });
    response.end(content);
  } catch {
    const fallback = await readFile(path.join(distRoot, "index.html"));
    response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    response.end(fallback);
  }
});

const wss = new WebSocketServer({ server, path: "/ws" });

wss.on("connection", (socket, request) => {
  const ip = (request.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim()
    ?? request.socket.remoteAddress
    ?? "unknown";
  socketStates.set(socket, {
    tokens: RATE_LIMIT_BURST,
    lastRefillMs: Date.now(),
    ip
  });
  log("ws.connect", { ip });

  socket.on("message", (raw) => {
    if (!consumeToken(socket)) {
      const state = socketStates.get(socket);
      logError("ws.rate-limit", { ip: state?.ip ?? "unknown", playerId: sockets.get(socket) });
      send(socket, { type: "error", message: "Rate limit exceeded" });
      return;
    }
    // Cap incoming payload size — anything more than 4KB is suspicious for our message types
    const text = raw.toString();
    if (text.length > 4096) {
      logError("ws.oversize", { ip: socketStates.get(socket)?.ip ?? "unknown", bytes: text.length });
      send(socket, { type: "error", message: "Message too large" });
      return;
    }
    let message: ClientMessage;
    try {
      message = JSON.parse(text) as ClientMessage;
    } catch {
      logError("ws.malformed", { ip: socketStates.get(socket)?.ip ?? "unknown" });
      send(socket, { type: "error", message: "Malformed message" });
      return;
    }
    if (!message || typeof message !== "object" || typeof (message as { type?: unknown }).type !== "string") {
      logError("ws.invalid-shape", { ip: socketStates.get(socket)?.ip ?? "unknown" });
      send(socket, { type: "error", message: "Invalid message shape" });
      return;
    }

    if (message.type === "join") {
      const id = `human_${randomUUID()}`;
      const uid = typeof message.uid === "string" && message.uid.length > 0 && message.uid.length < 200
        ? message.uid
        : undefined;
      const player = createPlayer(
        world,
        id,
        message.name,
        false,
        message.skinId,
        message.ropeAccessoryId,
        message.hatId,
        uid
      );
      sockets.set(socket, player.id);
      log("player.join", {
        playerId: player.id,
        name: player.name,
        skin: player.skinId,
        charm: player.ropeAccessoryId,
        hat: player.hatId,
        uid: uid ?? null,
        humans: [...world.players.values()].filter((p) => !p.bot).length
      });
      send(socket, { type: "welcome", id: player.id, snapshot: makeSnapshot(world, player.id) });
      return;
    }

    if (message.type === "ping") {
      send(socket, { type: "pong", nonce: message.nonce, serverTime: Date.now() });
      return;
    }

    const playerId = sockets.get(socket);
    if (!playerId) {
      send(socket, { type: "error", message: "Join before sending game messages" });
      return;
    }

    if (message.type === "input") {
      applyInput(world, playerId, message.input);
    } else if (message.type === "respawn") {
      respawn(world, playerId);
    } else if (message.type === "emote") {
      const validEmotes = new Set(["wave", "laugh", "skull", "fire", "heart", "shock"]);
      if (!validEmotes.has(message.emoteId)) return;
      const last = lastEmoteAt.get(playerId) ?? 0;
      const now = Date.now();
      if (now - last < 1500) return; // 1.5s cooldown per player
      lastEmoteAt.set(playerId, now);
      world.events.push({ type: "emote", playerId, emoteId: message.emoteId });
      broadcast({ type: "event", event: { type: "emote", playerId, emoteId: message.emoteId } });
    }
  });

  socket.on("close", () => {
    const playerId = sockets.get(socket);
    if (playerId) {
      removePlayer(world, playerId);
      lastEmoteAt.delete(playerId);
      log("player.leave", { playerId, humans: [...world.players.values()].filter((p) => !p.bot).length });
    } else {
      log("ws.disconnect", { ip });
    }
    sockets.delete(socket);
    socketStates.delete(socket);
  });

  socket.on("error", (err) => {
    logError("ws.error", { ip, error: String(err) });
  });
});

const tickTimer = setInterval(() => {
  const events = stepWorld(world, 1 / TICK_RATE);
  for (const event of events) {
    broadcast({ type: "event", event });
  }
}, 1000 / TICK_RATE);

const snapshotTimer = setInterval(() => {
  for (const [socket, playerId] of sockets) {
    if (socket.readyState === socket.OPEN) {
      send(socket, makeSnapshot(world, playerId));
    }
  }
}, 1000 / SNAPSHOT_RATE);

// Periodic metric snapshot — useful for fly logs/grafana
const metricsTimer = setInterval(() => {
  const players = [...world.players.values()];
  log("metrics", {
    humans: players.filter((p) => !p.bot).length,
    bots: players.filter((p) => p.bot).length,
    alive: players.filter((p) => p.alive).length,
    food: world.food.size,
    tick: world.tick
  });
}, 60_000);

server.listen(port, () => {
  log("server.listening", { port });
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    logError("server.port-in-use", { port });
    process.exitCode = 1;
    shutdown();
    return;
  }
  throw error;
});

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
process.once("SIGHUP", shutdown);

function shutdown(): void {
  if (shuttingDown) return;
  shuttingDown = true;
  log("server.shutdown");

  clearInterval(tickTimer);
  clearInterval(snapshotTimer);
  clearInterval(metricsTimer);

  for (const socket of wss.clients) {
    socket.close(1001, "Server shutting down");
  }
  wss.close();

  server.close(() => {
    process.exit(process.exitCode ?? 0);
  });

  setTimeout(() => {
    process.exit(process.exitCode ?? 0);
  }, 1200).unref();
}

function send(socket: WebSocket, message: ServerMessage): void {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(message));
  }
}

function broadcast(message: ServerMessage): void {
  for (const socket of wss.clients) {
    send(socket, message);
  }
}

function contentType(filePath: string): string {
  if (filePath.endsWith(".html")) return "text/html; charset=utf-8";
  if (filePath.endsWith(".js")) return "text/javascript; charset=utf-8";
  if (filePath.endsWith(".css")) return "text/css; charset=utf-8";
  if (filePath.endsWith(".svg")) return "image/svg+xml";
  if (filePath.endsWith(".png")) return "image/png";
  return "application/octet-stream";
}

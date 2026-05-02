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

const world = createWorld(Date.now() % 100000);
const sockets = new Map<WebSocket, string>();
let shuttingDown = false;
const server = createServer(async (request, response) => {
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

wss.on("connection", (socket) => {
  socket.on("message", (raw) => {
    let message: ClientMessage;
    try {
      message = JSON.parse(raw.toString()) as ClientMessage;
    } catch {
      send(socket, { type: "error", message: "Malformed message" });
      return;
    }

    if (message.type === "join") {
      const id = `human_${randomUUID()}`;
      const player = createPlayer(world, id, message.name, false, message.skinId, message.ropeAccessoryId);
      sockets.set(socket, player.id);
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
    }
  });

  socket.on("close", () => {
    const playerId = sockets.get(socket);
    if (playerId) removePlayer(world, playerId);
    sockets.delete(socket);
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

server.listen(port, () => {
  console.log(`Slithera server listening on http://localhost:${port}`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Slithera server port ${port} is already in use. Run "npm run stop" and try again.`);
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

  clearInterval(tickTimer);
  clearInterval(snapshotTimer);

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

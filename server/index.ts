import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { WebSocketServer, type WebSocket } from "ws";
import { SNAPSHOT_RATE, TICK_RATE } from "../shared/constants.js";
import { applyInput, createPlayer, createWorld, makeSnapshot, removePlayer, respawn, stepWorld } from "../shared/simulation.js";
import type { ClientMessage, ServerMessage } from "../shared/types.js";
import { isDevUid } from "../shared/exclusive.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = __dirname.includes(`dist-server${path.sep}server`)
  ? path.resolve(__dirname, "..", "..")
  : path.resolve(__dirname, "..");
const distRoot = path.join(projectRoot, "dist");
const port = Number(process.env.PORT ?? 8787);
const startedAt = Date.now();
const ADMIN_KEY = process.env.ADMIN_KEY ?? "";

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
const playerSockets = new Map<string, WebSocket>(); // reverse map: playerId → socket
const playerUids = new Map<string, string>();        // playerId → Firebase UID
const lastEmoteAt = new Map<string, number>();
const lastChatAt = new Map<string, number>();
// party code → ordered list of playerIds (first = leader)
const parties = new Map<string, string[]>();
// playerId → party code
const playerToParty = new Map<string, string>();
// runtime ban lists (cleared on restart; persist via external tooling if needed)
const bannedUids = new Set<string>();
const bannedIps = new Set<string>();
let shuttingDown = false;

function generatePartyCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code: string;
  do {
    code = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  } while (parties.has(code));
  return code;
}

function sendToPlayer(playerId: string, message: ServerMessage): void {
  const socket = playerSockets.get(playerId);
  if (socket) send(socket, message);
}

function broadcastToParty(code: string, message: ServerMessage): void {
  const members = parties.get(code);
  if (!members) return;
  for (const id of members) sendToPlayer(id, message);
}

function buildPartyState(code: string): ServerMessage {
  const memberIds = parties.get(code) ?? [];
  const members = memberIds.map((id) => {
    const p = world.players.get(id);
    return { id, name: p?.name ?? "?", color: p?.color ?? "#888", score: Math.floor(p?.score ?? 0), alive: p?.alive ?? false };
  });
  return { type: "party_state", code, members };
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function checkAdmin(req: IncomingMessage, res: ServerResponse): boolean {
  if (!ADMIN_KEY) {
    res.writeHead(503, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "ADMIN_KEY not configured on server" }));
    return false;
  }
  if (req.headers["authorization"] !== `Bearer ${ADMIN_KEY}`) {
    res.writeHead(401, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: false, error: "Unauthorized" }));
    return false;
  }
  return true;
}

function leaveParty(playerId: string): void {
  const code = playerToParty.get(playerId);
  if (!code) return;
  playerToParty.delete(playerId);
  const members = parties.get(code);
  if (!members) return;
  const newMembers = members.filter((id) => id !== playerId);
  const player = world.players.get(playerId);
  if (player) player.partyId = undefined;
  if (newMembers.length === 0) {
    parties.delete(code);
  } else {
    parties.set(code, newMembers);
    broadcastToParty(code, buildPartyState(code));
  }
  sendToPlayer(playerId, { type: "party_state", code: null, members: [] });
}
const server = createServer(async (request, response) => {
  if (request.url?.startsWith("/admin")) {
    if (!checkAdmin(request, response)) return;

    if (request.method === "GET" && request.url === "/admin/state") {
      const players = [...world.players.values()];
      const body = {
        ok: true,
        uptimeSec: Math.floor((Date.now() - startedAt) / 1000),
        tick: world.tick,
        memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        players: players.filter((p) => !p.bot).map((p) => ({
          id: p.id,
          name: p.name,
          uid: playerUids.get(p.id) ?? null,
          alive: p.alive,
          score: Math.floor(p.score),
          kills: p.kills,
          partyId: p.partyId ?? null,
          isDev: p.isDev ?? false
        })),
        bots: players.filter((p) => p.bot).length,
        food: world.food.size,
        parties: [...parties.entries()].map(([code, members]) => ({ code, members })),
        bannedUids: [...bannedUids],
        bannedIps: [...bannedIps]
      };
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify(body, null, 2));
      return;
    }

    let data: Record<string, unknown> = {};
    if (request.method === "POST") {
      const raw = await readBody(request);
      if (raw) {
        try { data = JSON.parse(raw) as Record<string, unknown>; }
        catch {
          response.writeHead(400, { "content-type": "application/json" });
          response.end(JSON.stringify({ ok: false, error: "Invalid JSON body" }));
          return;
        }
      }
    }

    if (request.method === "POST" && request.url === "/admin/kick") {
      const targetId = String(data.playerId ?? "");
      const socket = playerSockets.get(targetId);
      if (!socket) {
        response.writeHead(404, { "content-type": "application/json" });
        response.end(JSON.stringify({ ok: false, error: "Player not found" }));
        return;
      }
      send(socket, { type: "error", message: "You were kicked by an admin." });
      socket.close(1008, "Kicked by admin");
      log("admin.kick", { targetId });
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: true }));
      return;
    }

    if (request.method === "POST" && request.url === "/admin/broadcast") {
      const text = String(data.text ?? "").trim().slice(0, 200);
      if (!text) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ ok: false, error: "text is required" }));
        return;
      }
      const now = Date.now();
      broadcast({
        type: "chat_message",
        message: { id: `admin_${now}`, playerId: "admin", name: "[SERVER]", color: "#ff6b35", text, scope: "global", ts: now }
      });
      log("admin.broadcast", { text });
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: true }));
      return;
    }

    if (request.method === "POST" && request.url === "/admin/ban") {
      const uid = String(data.uid ?? "").trim();
      const ip = String(data.ip ?? "").trim();
      if (!uid && !ip) {
        response.writeHead(400, { "content-type": "application/json" });
        response.end(JSON.stringify({ ok: false, error: "uid or ip required" }));
        return;
      }
      if (uid) bannedUids.add(uid);
      if (ip) bannedIps.add(ip);
      // Disconnect any currently-connected matching player
      for (const [playerId, sock] of playerSockets) {
        const state = socketStates.get(sock);
        if ((uid && playerUids.get(playerId) === uid) || (ip && state?.ip === ip)) {
          send(sock, { type: "error", message: "You have been banned from this server." });
          sock.close(1008, "Banned");
        }
      }
      log("admin.ban", { uid: uid || null, ip: ip || null });
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: true }));
      return;
    }

    if (request.method === "POST" && request.url === "/admin/unban") {
      const uid = String(data.uid ?? "").trim();
      const ip = String(data.ip ?? "").trim();
      if (uid) bannedUids.delete(uid);
      if (ip) bannedIps.delete(ip);
      log("admin.unban", { uid: uid || null, ip: ip || null });
      response.writeHead(200, { "content-type": "application/json" });
      response.end(JSON.stringify({ ok: true }));
      return;
    }

    response.writeHead(404, { "content-type": "application/json" });
    response.end(JSON.stringify({ ok: false, error: "Unknown admin route" }));
    return;
  }

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

const wss = new WebSocketServer({ noServer: true });
const wssSpectate = new WebSocketServer({ noServer: true });

// Route upgrade requests manually — avoids ws multi-server path-routing bug
server.on("upgrade", (request, socket, head) => {
  const pathname = new URL(request.url ?? "/", "http://localhost").pathname;
  if (pathname === "/ws") {
    wss.handleUpgrade(request, socket, head, (ws) => wss.emit("connection", ws, request));
  } else if (pathname === "/ws-spectate") {
    wssSpectate.handleUpgrade(request, socket, head, (ws) => wssSpectate.emit("connection", ws, request));
  } else {
    socket.destroy();
  }
});

// Spectator WebSocket — dev-only, invisible to regular players
const spectators = new Set<WebSocket>();
wssSpectate.on("connection", (socket) => {
  let authed = false;

  socket.on("message", (raw) => {
    const text = raw.toString().slice(0, 512);
    let msg: Record<string, unknown>;
    try { msg = JSON.parse(text) as Record<string, unknown>; } catch { socket.close(); return; }

    if (!authed) {
      if (msg.type !== "spectate_auth" || !isDevUid(msg.uid as string)) {
        socket.close(1008, "Unauthorized");
        return;
      }
      authed = true;
      spectators.add(socket);
      socket.send(JSON.stringify({ type: "spectate_ok" }));
      // Send initial snapshot immediately
      socket.send(JSON.stringify(makeSnapshot(world)));
      log("spectator.connect");
      return;
    }

    // Admin actions (authed dev only)
    if (msg.type === "admin_kick") {
      const targetId = String(msg.targetId ?? "");
      const sock = playerSockets.get(targetId);
      if (sock) { send(sock, { type: "error", message: "Kicked by admin." }); sock.close(1008, "Kicked"); }
      socket.send(JSON.stringify({ type: "admin_result", ok: true, action: "kick", targetId }));
      log("admin.kick", { targetId });
    } else if (msg.type === "admin_broadcast") {
      const broadcastText = String(msg.text ?? "").trim().slice(0, 200);
      if (broadcastText) {
        const now = Date.now();
        broadcast({ type: "chat_message", message: { id: `admin_${now}`, playerId: "admin", name: "[SERVER]", color: "#d4a843", text: broadcastText, scope: "global", ts: now } });
        log("admin.broadcast", { text: broadcastText });
      }
      socket.send(JSON.stringify({ type: "admin_result", ok: true, action: "broadcast" }));
    } else if (msg.type === "admin_ban") {
      const uid = String(msg.uid ?? "").trim();
      const ip = String(msg.ip ?? "").trim();
      if (uid) bannedUids.add(uid);
      if (ip) bannedIps.add(ip);
      for (const [playerId, sock] of playerSockets) {
        const state = socketStates.get(sock);
        if ((uid && playerUids.get(playerId) === uid) || (ip && state?.ip === ip)) {
          send(sock, { type: "error", message: "Banned." }); sock.close(1008, "Banned");
        }
      }
      log("admin.ban", { uid: uid || null, ip: ip || null });
      socket.send(JSON.stringify({ type: "admin_result", ok: true, action: "ban" }));
    } else if (msg.type === "admin_ban_player") {
      // Ban by playerId — server looks up the UID internally
      const targetId = String(msg.targetId ?? "").trim();
      const uid = playerUids.get(targetId);
      const sock = playerSockets.get(targetId);
      if (uid) bannedUids.add(uid);
      if (sock) {
        send(sock, { type: "error", message: "Banned." });
        sock.close(1008, "Banned");
      }
      log("admin.ban", { targetId, uid: uid ?? null });
      socket.send(JSON.stringify({ type: "admin_result", ok: true, action: "ban", targetId, uid: uid ?? null }));
    }
  });

  socket.on("close", () => {
    spectators.delete(socket);
    if (authed) log("spectator.disconnect");
  });
});

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
      const ip = socketStates.get(socket)?.ip ?? "";
      const uid = typeof message.uid === "string" && message.uid.length > 0 && message.uid.length < 200
        ? message.uid
        : undefined;
      if (bannedIps.has(ip) || (uid && bannedUids.has(uid))) {
        send(socket, { type: "error", message: "You are banned from this server." });
        socket.close(1008, "Banned");
        return;
      }
      const id = `human_${randomUUID()}`;
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
      playerSockets.set(player.id, socket);
      if (uid) playerUids.set(player.id, uid);
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
      if (now - last < 1500) return;
      lastEmoteAt.set(playerId, now);
      world.events.push({ type: "emote", playerId, emoteId: message.emoteId });
      broadcast({ type: "event", event: { type: "emote", playerId, emoteId: message.emoteId } });
    } else if (message.type === "chat") {
      const text = String(message.text ?? "").trim().slice(0, 120);
      if (!text) return;
      const now = Date.now();
      const lastChat = lastChatAt.get(playerId) ?? 0;
      if (now - lastChat < 500) return; // 500ms chat cooldown
      lastChatAt.set(playerId, now);
      const player = world.players.get(playerId);
      if (!player) return;
      const scope: import("../shared/types.js").ChatScope = message.scope === "party" ? "party" : "global";
      const chatMsg = {
        id: `${playerId}_${now}`,
        playerId,
        name: player.name,
        color: player.color,
        text,
        scope,
        ts: now,
        isDev: player.isDev ?? false
      };
      const envelope: ServerMessage = { type: "chat_message", message: chatMsg };
      if (scope === "global") {
        broadcast(envelope);
      } else {
        const code = playerToParty.get(playerId);
        if (code) broadcastToParty(code, envelope);
      }
    } else if (message.type === "whisper") {
      const text = String(message.text ?? "").trim().slice(0, 120);
      if (!text) return;
      const now = Date.now();
      const lastChat = lastChatAt.get(playerId) ?? 0;
      if (now - lastChat < 500) return;
      lastChatAt.set(playerId, now);
      const player = world.players.get(playerId);
      const target = world.players.get(message.targetId);
      if (!player || !target || target.bot) return;
      const whisperMsg = {
        id: `${playerId}_${now}`,
        playerId,
        name: player.name,
        color: player.color,
        text,
        scope: "global" as const,
        ts: now
      };
      sendToPlayer(message.targetId, { type: "chat_message", message: { ...whisperMsg, scope: "global", text: `[whisper] ${text}` } });
      send(socket, { type: "chat_message", message: { ...whisperMsg, text: `[→ ${target.name}] ${text}` } });
    } else if (message.type === "party_create") {
      leaveParty(playerId); // leave any current party first
      const code = generatePartyCode();
      parties.set(code, [playerId]);
      playerToParty.set(playerId, code);
      const player = world.players.get(playerId);
      if (player) player.partyId = code;
      send(socket, buildPartyState(code));
      log("party.create", { playerId, code });
    } else if (message.type === "party_join") {
      const code = String(message.code ?? "").trim().toUpperCase().slice(0, 8);
      const members = parties.get(code);
      if (!members) {
        send(socket, { type: "error", message: "Party not found" });
        return;
      }
      if (members.length >= 4) {
        send(socket, { type: "error", message: "Party is full" });
        return;
      }
      if (members.includes(playerId)) return;
      leaveParty(playerId);
      members.push(playerId);
      playerToParty.set(playerId, code);
      const player = world.players.get(playerId);
      if (player) player.partyId = code;
      broadcastToParty(code, buildPartyState(code));
      log("party.join", { playerId, code });
    } else if (message.type === "party_leave") {
      leaveParty(playerId);
    } else if (message.type === "party_invite") {
      const code = playerToParty.get(playerId);
      if (!code) return;
      const target = world.players.get(message.targetId);
      if (!target || target.bot) return;
      const player = world.players.get(playerId);
      sendToPlayer(message.targetId, {
        type: "party_invited",
        fromId: playerId,
        fromName: player?.name ?? "?",
        fromColor: player?.color ?? "#888",
        code
      });
    } else if (message.type === "party_kick") {
      const code = playerToParty.get(playerId);
      if (!code) return;
      const members = parties.get(code);
      if (!members || members[0] !== playerId) return; // only leader can kick
      if (message.targetId === playerId) return; // can't kick yourself
      leaveParty(message.targetId);
    }
  });

  socket.on("close", () => {
    const playerId = sockets.get(socket);
    if (playerId) {
      leaveParty(playerId);
      removePlayer(world, playerId);
      lastEmoteAt.delete(playerId);
      lastChatAt.delete(playerId);
      playerSockets.delete(playerId);
      playerUids.delete(playerId);
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
  // Push party score updates so member panels stay live
  const seen = new Set<string>();
  for (const [playerId, code] of playerToParty) {
    if (seen.has(code)) continue;
    seen.add(code);
    broadcastToParty(code, buildPartyState(code));
    void playerId; // suppress unused-var
  }
  // Send to spectators
  const spectatorSnap = JSON.stringify(makeSnapshot(world));
  for (const ws of spectators) {
    if (ws.readyState === ws.OPEN) ws.send(spectatorSnap);
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
  for (const socket of wssSpectate.clients) {
    socket.close(1001, "Server shutting down");
  }
  wssSpectate.close();

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

import { useCallback, useEffect, useRef, useState } from "react";
import { loadAuthUser } from "../lib/auth";
import type { ClientInput, EmoteId, GameEvent, ServerMessage, ServerSnapshot } from "../../../shared/types";

type ConnectionStatus = "connecting" | "online" | "reconnecting" | "offline";

export type RecentEvent = { event: GameEvent; at: number };
const RECENT_EVENT_MAX = 16;
const RECENT_EVENT_TTL_MS = 4500;

const RECONNECT_BASE_MS = 500;
const RECONNECT_MAX_MS = 10000;
const RECONNECT_MAX_ATTEMPTS = 12;

export function useGameClient(
  enabled: boolean,
  profile: { name: string; skinId: string; ropeAccessoryId?: string; hatId?: string }
) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [playerId, setPlayerId] = useState<string>();
  const [snapshot, setSnapshot] = useState<ServerSnapshot>();
  const [latency, setLatency] = useState(0);
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([]);
  const socketRef = useRef<WebSocket | undefined>(undefined);
  const seqRef = useRef(0);
  const lastInputRef = useRef<ClientInput>({ heading: 0, boosting: false });
  const pingRef = useRef(new Map<number, number>());

  useEffect(() => {
    if (!enabled) return;

    let reconnectTimer: number | undefined;
    let attempt = 0;
    let closed = false;

    const scheduleReconnect = () => {
      if (closed) return;
      attempt += 1;
      if (attempt > RECONNECT_MAX_ATTEMPTS) {
        setStatus("offline");
        return;
      }
      setStatus("reconnecting");
      const baseDelay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * 2 ** Math.min(attempt - 1, 6));
      const jitter = Math.random() * 250;
      reconnectTimer = window.setTimeout(connect, baseDelay + jitter);
    };

    const connect = () => {
      if (closed) return;
      setStatus((current) => (current === "online" ? "reconnecting" : current));

      let socket: WebSocket;
      try {
        socket = new WebSocket(makeWsUrl());
      } catch {
        scheduleReconnect();
        return;
      }
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        attempt = 0;
        const authUser = loadAuthUser();
        socket.send(JSON.stringify({
          type: "join",
          name: profile.name,
          skinId: profile.skinId,
          ropeAccessoryId: profile.ropeAccessoryId,
          hatId: profile.hatId,
          uid: authUser?.id
        }));
        setStatus("online");
      });

      socket.addEventListener("message", (event) => {
        let message: ServerMessage;
        try {
          message = JSON.parse(event.data) as ServerMessage;
        } catch {
          return;
        }
        if (message.type === "welcome") {
          setPlayerId(message.id);
          setSnapshot(message.snapshot);
        } else if (message.type === "snapshot") {
          setSnapshot(message);
        } else if (message.type === "event") {
          const at = performance.now();
          setRecentEvents((prev) => {
            const next = [...prev, { event: message.event, at }];
            const cutoff = at - RECENT_EVENT_TTL_MS;
            return next.filter((e) => e.at >= cutoff).slice(-RECENT_EVENT_MAX);
          });
        } else if (message.type === "pong") {
          const sent = pingRef.current.get(message.nonce);
          if (sent) {
            setLatency(Math.round(performance.now() - sent));
            pingRef.current.delete(message.nonce);
          }
        }
      });

      socket.addEventListener("close", () => {
        if (closed) return;
        socketRef.current = undefined;
        scheduleReconnect();
      });

      socket.addEventListener("error", () => {
        // close event will follow; let scheduleReconnect there handle the retry
      });
    };

    connect();

    const pingTimer = window.setInterval(() => {
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      const nonce = Date.now();
      pingRef.current.set(nonce, performance.now());
      // Drop stale pings to keep the map bounded
      if (pingRef.current.size > 32) {
        const oldest = pingRef.current.keys().next().value;
        if (typeof oldest === "number") pingRef.current.delete(oldest);
      }
      socket.send(JSON.stringify({ type: "ping", nonce }));
    }, 1600);

    const onOnline = () => {
      // browser came back online — reset attempts and try immediately
      if (closed) return;
      attempt = 0;
      if (reconnectTimer) {
        window.clearTimeout(reconnectTimer);
        reconnectTimer = undefined;
      }
      const socket = socketRef.current;
      if (!socket || socket.readyState === WebSocket.CLOSED || socket.readyState === WebSocket.CLOSING) {
        connect();
      }
    };
    window.addEventListener("online", onOnline);

    return () => {
      closed = true;
      window.clearInterval(pingTimer);
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      window.removeEventListener("online", onOnline);
      const socket = socketRef.current;
      if (socket) {
        // Replace listeners to avoid triggering reconnect on cleanup-induced close
        socket.onclose = null;
        socket.onerror = null;
        socket.onmessage = null;
        socket.onopen = null;
        try { socket.close(); } catch { /* ignore */ }
      }
      socketRef.current = undefined;
    };
  }, [enabled, profile.name, profile.skinId, profile.ropeAccessoryId, profile.hatId]);

  const sendInput = useCallback((input: ClientInput) => {
    lastInputRef.current = input;
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: "input", input, seq: seqRef.current++ }));
  }, []);

  const respawn = useCallback(() => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: "respawn" }));
  }, []);

  const sendEmote = useCallback((emoteId: EmoteId) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: "emote", emoteId }));
  }, []);

  return {
    status,
    playerId,
    snapshot,
    latency,
    lastInput: lastInputRef.current,
    recentEvents,
    sendInput,
    respawn,
    sendEmote
  };
}

function makeWsUrl(): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
}

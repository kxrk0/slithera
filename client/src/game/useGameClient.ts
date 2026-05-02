import { useCallback, useEffect, useRef, useState } from "react";
import type { ClientInput, ServerMessage, ServerSnapshot } from "../../../shared/types";

type ConnectionStatus = "connecting" | "online" | "reconnecting" | "offline";

export function useGameClient(enabled: boolean, profile: { name: string; skinId: string }) {
  const [status, setStatus] = useState<ConnectionStatus>("connecting");
  const [playerId, setPlayerId] = useState<string>();
  const [snapshot, setSnapshot] = useState<ServerSnapshot>();
  const [latency, setLatency] = useState(0);
  const socketRef = useRef<WebSocket | undefined>(undefined);
  const seqRef = useRef(0);
  const lastInputRef = useRef<ClientInput>({ heading: 0, boosting: false });
  const pingRef = useRef(new Map<number, number>());

  useEffect(() => {
    if (!enabled) return;

    let reconnectTimer: number | undefined;
    let closed = false;

    const connect = () => {
      setStatus((current) => (current === "connecting" ? "connecting" : "reconnecting"));
      const socket = new WebSocket(makeWsUrl());
      socketRef.current = socket;

      socket.addEventListener("open", () => {
        socket.send(JSON.stringify({ type: "join", name: profile.name, skinId: profile.skinId }));
        setStatus("online");
      });

      socket.addEventListener("message", (event) => {
        const message = JSON.parse(event.data) as ServerMessage;
        if (message.type === "welcome") {
          setPlayerId(message.id);
          setSnapshot(message.snapshot);
        } else if (message.type === "snapshot") {
          setSnapshot(message);
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
        setStatus("reconnecting");
        reconnectTimer = window.setTimeout(connect, 900);
      });

      socket.addEventListener("error", () => {
        setStatus("offline");
      });
    };

    connect();

    const pingTimer = window.setInterval(() => {
      const socket = socketRef.current;
      if (!socket || socket.readyState !== WebSocket.OPEN) return;
      const nonce = Date.now();
      pingRef.current.set(nonce, performance.now());
      socket.send(JSON.stringify({ type: "ping", nonce }));
    }, 1600);

    return () => {
      closed = true;
      window.clearInterval(pingTimer);
      if (reconnectTimer) window.clearTimeout(reconnectTimer);
      socketRef.current?.close();
    };
  }, [enabled, profile.name, profile.skinId]);

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

  return {
    status,
    playerId,
    snapshot,
    latency,
    lastInput: lastInputRef.current,
    sendInput,
    respawn
  };
}

function makeWsUrl(): string {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${protocol}//${window.location.host}/ws`;
}

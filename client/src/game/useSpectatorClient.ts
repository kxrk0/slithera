import { useCallback, useEffect, useRef, useState } from "react";
import type { ServerSnapshot } from "../../../shared/types";

type AdminResult = { ok: boolean; action: string; error?: string };
type SpectatorHook = {
  connected: boolean;
  snapshot: ServerSnapshot | null;
  kick: (playerId: string) => void;
  ban: (opts: { uid?: string; ip?: string }) => void;
  banPlayer: (targetId: string) => void;
  broadcast: (text: string) => void;
  lastResult: AdminResult | null;
};

export function useSpectatorClient(uid: string | undefined): SpectatorHook {
  const [connected, setConnected] = useState(false);
  const [snapshot, setSnapshot] = useState<ServerSnapshot | null>(null);
  const [lastResult, setLastResult] = useState<AdminResult | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!uid) return;
    let ws: WebSocket;
    let dead = false;

    const connect = () => {
      if (dead) return;
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      ws = new WebSocket(`${protocol}//${window.location.host}/ws-spectate`);
      wsRef.current = ws;

      ws.onopen = () => {
        ws.send(JSON.stringify({ type: "spectate_auth", uid }));
      };
      ws.onmessage = (e) => {
        const msg = JSON.parse(e.data as string) as Record<string, unknown>;
        if (msg.type === "spectate_ok") setConnected(true);
        else if (msg.type === "snapshot") setSnapshot(msg as unknown as ServerSnapshot);
        else if (msg.type === "admin_result") setLastResult(msg as unknown as AdminResult);
        else if (msg.type === "error") { ws.close(); }
      };
      ws.onclose = () => {
        setConnected(false);
        if (!dead) setTimeout(connect, 3000);
      };
    };

    connect();
    return () => {
      dead = true;
      wsRef.current?.close();
    };
  }, [uid]);

  const sendMsg = useCallback((msg: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(msg));
    }
  }, []);

  const kick = useCallback((playerId: string) => sendMsg({ type: "admin_kick", targetId: playerId }), [sendMsg]);
  const ban = useCallback((opts: { uid?: string; ip?: string }) => sendMsg({ type: "admin_ban", ...opts }), [sendMsg]);
  const banPlayer = useCallback((targetId: string) => sendMsg({ type: "admin_ban_player", targetId }), [sendMsg]);
  const broadcast = useCallback((text: string) => sendMsg({ type: "admin_broadcast", text }), [sendMsg]);

  return { connected, snapshot, kick, ban, banPlayer, broadcast, lastResult };
}

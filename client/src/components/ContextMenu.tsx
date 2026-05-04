import { useEffect, useRef } from "react";
import { MessageSquare, Shield, UserX } from "lucide-react";

export type ContextTarget = {
  playerId: string;
  playerName: string;
  playerColor: string;
  x: number;
  y: number;
};

type ContextMenuProps = {
  target: ContextTarget | null;
  canInvite: boolean;
  onInvite: (playerId: string) => void;
  onWhisper: (playerId: string, name: string) => void;
  onBlock: (playerId: string) => void;
  onClose: () => void;
};

export function ContextMenu({ target, canInvite, onInvite, onWhisper, onBlock, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!target) return;
    const handler = (e: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, [target, onClose]);

  if (!target) return null;

  // Clamp position so menu doesn't overflow
  const menuW = 172;
  const menuH = 124;
  const left = Math.min(target.x, window.innerWidth - menuW - 8);
  const top = Math.min(target.y, window.innerHeight - menuH - 8);

  return (
    <div
      ref={menuRef}
      className="wg-context-menu"
      style={{ left, top }}
      role="menu"
      aria-label={`Actions for ${target.playerName}`}
    >
      <div className="wg-context-menu-header">
        <span className="wg-context-dot" style={{ background: target.playerColor }} />
        <span className="wg-context-name">{target.playerName}</span>
      </div>
      <div className="wg-context-menu-items">
        <button
          className="wg-context-item"
          type="button"
          role="menuitem"
          onClick={() => { onWhisper(target.playerId, target.playerName); onClose(); }}
        >
          <MessageSquare size={12} />
          Whisper
        </button>
        {canInvite ? (
          <button
            className="wg-context-item"
            type="button"
            role="menuitem"
            onClick={() => { onInvite(target.playerId); onClose(); }}
          >
            <Shield size={12} />
            Invite to Party
          </button>
        ) : null}
        <button
          className="wg-context-item danger"
          type="button"
          role="menuitem"
          onClick={() => { onBlock(target.playerId); onClose(); }}
        >
          <UserX size={12} />
          Block
        </button>
      </div>
    </div>
  );
}

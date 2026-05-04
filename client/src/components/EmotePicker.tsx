import { useEffect, useState } from "react";
import type { EmoteId } from "../../../shared/types";

type EmotePickerProps = {
  onSend: (emoteId: EmoteId) => void;
};

export const EMOTES: { id: EmoteId; glyph: string; label: string; key: string }[] = [
  { id: "wave",  glyph: "👋", label: "Wave",  key: "1" },
  { id: "laugh", glyph: "😂", label: "Laugh", key: "2" },
  { id: "skull", glyph: "💀", label: "Skull", key: "3" },
  { id: "fire",  glyph: "🔥", label: "Fire",  key: "4" },
  { id: "heart", glyph: "❤️", label: "Heart", key: "5" },
  { id: "shock", glyph: "😱", label: "Shock", key: "6" }
];

export function EmotePicker({ onSend }: EmotePickerProps) {
  const [open, setOpen] = useState(false);
  const [cooldownEnd, setCooldownEnd] = useState(0);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // Ignore when typing in inputs
      const tag = (event.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (event.key === "f" || event.key === "F") {
        event.preventDefault();
        setOpen((value) => !value);
        return;
      }
      if (event.key === "Escape" && open) setOpen(false);
      if (open && /^[1-6]$/.test(event.key)) {
        const found = EMOTES.find((e) => e.key === event.key);
        if (found) emit(found.id);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const emit = (id: EmoteId) => {
    const now = Date.now();
    if (now < cooldownEnd) return;
    onSend(id);
    setCooldownEnd(now + 1500);
    setOpen(false);
  };

  if (!open) return null;
  const remaining = Math.max(0, cooldownEnd - Date.now());

  return (
    <div className="wg-emote-picker" role="menu" aria-label="Emotes">
      <div className="wg-emote-picker-head">
        <span className="eyebrow">EMOTE · F to close</span>
        {remaining > 0 ? <span className="cooldown">{Math.ceil(remaining / 100) / 10}s</span> : null}
      </div>
      <div className="wg-emote-grid">
        {EMOTES.map((emote) => (
          <button
            key={emote.id}
            type="button"
            className="wg-emote-btn"
            onClick={() => emit(emote.id)}
            disabled={remaining > 0}
            aria-label={emote.label}
          >
            <span className="glyph">{emote.glyph}</span>
            <span className="key">{emote.key}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

import { useState } from "react";
import { ROPE_ACCESSORIES } from "../../../../shared/constants";
import { SnakePreview3D } from "./SnakePreview3D";
import { WardrobeModal } from "./WardrobeModal";

type CharmPickerProps = {
  open: boolean;
  onClose: () => void;
  skinId: string;
  hatId: string;
  ropeAccessoryId: string;
  onChange: (id: string) => void;
};

const ROPE_EMOJI: Record<string, string> = {
  none: "—",
  skull: "☠️",
  star: "⭐",
  diamond: "💎",
  bolt: "⚡",
  fire: "🔥",
  eye: "👁️",
  heart: "❤️"
};

const RARITY: Record<string, string> = {
  none: "—",
  skull: "RARE",
  star: "CMN",
  diamond: "EPIC",
  bolt: "CMN",
  fire: "CMN",
  eye: "RARE",
  heart: "CMN"
};

export function CharmPicker({ open, onClose, skinId, hatId, ropeAccessoryId, onChange }: CharmPickerProps) {
  const [draft, setDraft] = useState(ropeAccessoryId);
  const selected = ROPE_ACCESSORIES.find((r) => r.id === draft) ?? ROPE_ACCESSORIES[0];
  const handleEquip = () => {
    onChange(draft);
    onClose();
  };
  const handleCancel = () => {
    setDraft(ropeAccessoryId);
    onClose();
  };
  const meta = selected.id === "none" ? "—" : RARITY[selected.id] ?? "CMN";
  return (
    <WardrobeModal
      open={open}
      onClose={handleCancel}
      preview={
        <SnakePreview3D
          skinId={skinId}
          hatId={hatId}
          label="· · · CURRENT CHARM · · ·"
          name={selected.name}
          meta={meta}
        />
      }
      side={
        <div className="wg-modal-side">
          <div className="wg-modal-eyebrow">CHAPTER · III</div>
          <div>
            <div className="wg-modal-title">Tie a <span className="accent">charm</span></div>
            <div className="wg-modal-subtitle">A charm sways from a thread behind your head — a small braggart on a string.</div>
          </div>
          <div className="wg-skin-grid" role="radiogroup" aria-label="Charm options">
            {ROPE_ACCESSORIES.map((acc) => {
              const rare = RARITY[acc.id] ?? "CMN";
              return (
                <button
                  key={acc.id}
                  type="button"
                  role="radio"
                  aria-checked={acc.id === draft}
                  aria-label={acc.name}
                  className={acc.id === draft ? "wg-skin-card selected" : "wg-skin-card"}
                  onClick={() => setDraft(acc.id)}
                >
                  <div className="wg-skin-rare" style={rare === "EPIC" ? { color: "var(--wg-ember)" } : rare === "RARE" ? { color: "var(--wg-gold)" } : undefined}>
                    {rare}
                  </div>
                  <div
                    className="wg-skin-swatch"
                    style={{
                      background: acc.id === draft ? "rgba(240,181,64,0.12)" : "rgba(245,233,211,0.05)",
                      boxShadow: acc.id === draft ? "0 0 18px rgba(240,181,64,0.4)" : "none"
                    }}
                  >
                    {ROPE_EMOJI[acc.id]}
                  </div>
                  <div className="wg-skin-name">{acc.name}</div>
                </button>
              );
            })}
          </div>
          <div className="wg-equip-row">
            <button className="wg-cancel-btn" type="button" onClick={handleCancel}>Cancel</button>
            <button className="wg-equip-btn" type="button" onClick={handleEquip}>Wear &nbsp;<span style={{ fontStyle: "normal" }}>→</span></button>
          </div>
        </div>
      }
    />
  );
}

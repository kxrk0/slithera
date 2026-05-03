import { useState } from "react";
import { HAT_OPTIONS } from "../../../../shared/constants";
import { SnakePreview3D } from "./SnakePreview3D";
import { WardrobeModal } from "./WardrobeModal";

type HatPickerProps = {
  open: boolean;
  onClose: () => void;
  skinId: string;
  hatId: string;
  onChange: (hatId: string) => void;
};

const RARITY_COLOR: Record<string, string> = {
  myth: "var(--wg-ember)",
  rare: "var(--wg-gold)",
  common: "",
  locked: "",
  "": ""
};

const RARITY_LABEL: Record<string, string> = {
  myth: "MYTH",
  rare: "RARE",
  common: "CMN",
  locked: "—",
  "": "—"
};

export function HatPicker({ open, onClose, skinId, hatId, onChange }: HatPickerProps) {
  const [draft, setDraft] = useState(hatId);
  const selected = HAT_OPTIONS.find((h) => h.id === draft) ?? HAT_OPTIONS[0];
  const handleEquip = () => {
    onChange(draft);
    onClose();
  };
  const handleCancel = () => {
    setDraft(hatId);
    onClose();
  };
  const meta = selected.id === "none" ? "—" : selected.rarity.toUpperCase();
  return (
    <WardrobeModal
      open={open}
      onClose={handleCancel}
      preview={
        <SnakePreview3D
          skinId={skinId}
          hatId={draft}
          label="· · · CURRENT SELECTION · · ·"
          name={selected.name}
          meta={meta}
        />
      }
      side={
        <div className="wg-modal-side">
          <div className="wg-modal-eyebrow">CHAPTER · II</div>
          <div>
            <div className="wg-modal-title">Crown the <span className="accent">head</span></div>
            <div className="wg-modal-subtitle">A hat does nothing for your speed — it does everything for the silence afterwards.</div>
          </div>
          <div className="wg-skin-grid" role="radiogroup" aria-label="Hat options">
            {HAT_OPTIONS.map((hat) => {
              const isLocked = hat.rarity === "locked";
              return (
                <button
                  key={hat.id}
                  type="button"
                  role="radio"
                  aria-checked={hat.id === draft}
                  aria-label={hat.name}
                  aria-disabled={isLocked}
                  className={
                    hat.id === draft
                      ? "wg-skin-card selected"
                      : isLocked
                        ? "wg-skin-card locked"
                        : "wg-skin-card"
                  }
                  onClick={() => { if (!isLocked) setDraft(hat.id); }}
                >
                  {isLocked ? <div className="wg-skin-lock">🔒</div> : <div className="wg-skin-rare" style={{ color: RARITY_COLOR[hat.rarity] }}>{RARITY_LABEL[hat.rarity]}</div>}
                  <div
                    className="wg-skin-swatch"
                    style={{
                      background: hat.id === draft ? "rgba(240,181,64,0.12)" : "rgba(245,233,211,0.05)",
                      boxShadow: hat.id === draft ? "0 0 18px rgba(240,181,64,0.4)" : "none"
                    }}
                  >
                    {hat.mark}
                  </div>
                  <div className="wg-skin-name">{hat.name}</div>
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

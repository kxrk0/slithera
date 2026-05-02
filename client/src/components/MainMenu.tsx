import type { CSSProperties } from "react";
import { Crown, Palette, Play, Radio, User, Zap } from "lucide-react";
import { ROPE_ACCESSORIES, SNAKE_SKINS } from "../../../shared/constants";

type MainMenuProps = {
  name: string;
  skinId: string;
  hatId: string;
  ropeAccessoryId: string;
  onNameChange: (name: string) => void;
  onSkinChange: (skinId: string) => void;
  onHatChange: (hatId: string) => void;
  onRopeAccessoryChange: (id: string) => void;
  onStart: () => void;
};

const HAT_OPTIONS = [
  { id: "none",   name: "None",  mark: "—" },
  { id: "crown",  name: "Crown", mark: "👑" },
  { id: "halo",   name: "Halo",  mark: "○" },
  { id: "visor",  name: "Visor", mark: "◧" }
] as const;

const ROPE_EMOJI: Record<string, string> = {
  none:    "—",
  skull:   "☠️",
  star:    "⭐",
  diamond: "💎",
  bolt:    "⚡",
  fire:    "🔥",
  eye:     "👁️",
  heart:   "❤️"
};

const PREVIEW_SEGMENTS = Array.from({ length: 10 }, (_, index) => index);

export function MainMenu({ name, skinId, hatId, ropeAccessoryId, onNameChange, onSkinChange, onHatChange, onRopeAccessoryChange, onStart }: MainMenuProps) {
  const selectedSkin = SNAKE_SKINS.find((skin) => skin.id === skinId) ?? SNAKE_SKINS[0];
  const selectedHat = HAT_OPTIONS.find((hat) => hat.id === hatId) ?? HAT_OPTIONS[0];
  const selectedRope = ROPE_ACCESSORIES.find((acc) => acc.id === ropeAccessoryId) ?? ROPE_ACCESSORIES[0];
  const previewStyle = {
    "--skin-color": selectedSkin.color,
    "--skin-accent": selectedSkin.accent,
    "--skin-shadow": selectedSkin.shadow
  } as CSSProperties;

  return (
    <section className="main-menu" aria-label="Slithera main menu">
      <div className="menu-backdrop" />
      <div className="menu-panel" style={previewStyle}>
        <div className="menu-topbar">
          <div className="menu-brand">
            <h1>SLITHERA</h1>
            <span>Arena Loadout</span>
          </div>
          <div className="menu-online">
            <Radio size={16} />
            <span>Live Arena</span>
          </div>
        </div>

        <div className="menu-grid">
          <section className="menu-profile" aria-label="Player profile">
            <label className="name-field">
              <span>
                <User size={17} />
                Player Name
              </span>
              <input maxLength={16} value={name} onChange={(event) => onNameChange(event.target.value)} aria-label="Player name" />
            </label>

            <div className="menu-loadout-summary">
              <span>{selectedSkin.name}</span>
              <b>
                {selectedHat.id !== "none" ? selectedHat.name : "No hat"}
                {selectedRope.id !== "none" ? ` · ${selectedRope.name}` : ""}
              </b>
            </div>

            <button className="menu-start" type="button" onClick={onStart}>
              <Play size={24} fill="currentColor" />
              <span>Enter Arena</span>
              <Zap size={22} fill="currentColor" />
            </button>
          </section>

          <section className="menu-preview" aria-label="Snake preview">
            <div className="preview-stage">
              <div className="preview-snake">
                {PREVIEW_SEGMENTS.map((index) => (
                  <i key={index} />
                ))}
                <b>
                  <span />
                  <span />
                </b>
              </div>
              {selectedHat.id !== "none" ? <em>{selectedHat.mark}</em> : null}
              {selectedRope.id !== "none" ? (
                <div className="preview-rope-item" aria-hidden="true">
                  {ROPE_EMOJI[selectedRope.id]}
                </div>
              ) : null}
            </div>
          </section>

          <section className="menu-cosmetics" aria-label="Cosmetic loadout">
            <div className="cosmetic-header">
              <Palette size={18} />
              <span>Snake Skin</span>
            </div>
            <div className="skin-options">
              {SNAKE_SKINS.map((skin) => (
                <button
                  className={skin.id === skinId ? "skin-card selected" : "skin-card"}
                  key={skin.id}
                  type="button"
                  onClick={() => onSkinChange(skin.id)}
                  aria-label={skin.name}
                >
                  <i style={{ background: skin.color, boxShadow: `0 0 18px ${skin.color}` }} />
                  <b>{skin.name}</b>
                </button>
              ))}
            </div>

            <div className="cosmetic-header">
              <Crown size={18} fill="currentColor" />
              <span>Hat</span>
            </div>
            <div className="hat-options">
              {HAT_OPTIONS.map((hat) => (
                <button
                  className={hat.id === hatId ? "hat-card selected" : "hat-card"}
                  key={hat.id}
                  type="button"
                  onClick={() => onHatChange(hat.id)}
                  aria-label={hat.name}
                >
                  <span>{hat.mark}</span>
                  <b>{hat.name}</b>
                </button>
              ))}
            </div>

            <div className="cosmetic-header">
              <span>🪢 Rope Item</span>
              <span className="cosmetic-badge-new">NEW</span>
            </div>
            <div className="rope-options">
              {ROPE_ACCESSORIES.map((acc) => (
                <button
                  className={acc.id === ropeAccessoryId ? "rope-card selected" : "rope-card"}
                  key={acc.id}
                  type="button"
                  onClick={() => onRopeAccessoryChange(acc.id)}
                  aria-label={acc.name}
                >
                  <span>{ROPE_EMOJI[acc.id]}</span>
                  <b>{acc.name}</b>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

import type { CSSProperties } from "react";
import { Crown, Lock, Palette, Play, Radio, Sparkles, User, Wand2, Zap } from "lucide-react";
import { SNAKE_SKINS } from "../../../shared/constants";

type MainMenuProps = {
  name: string;
  skinId: string;
  hatId: string;
  onNameChange: (name: string) => void;
  onSkinChange: (skinId: string) => void;
  onHatChange: (hatId: string) => void;
  onStart: () => void;
};

const HAT_OPTIONS = [
  { id: "none", name: "None", mark: "OFF" },
  { id: "crown", name: "Crown", mark: "I" },
  { id: "halo", name: "Halo", mark: "O" },
  { id: "visor", name: "Visor", mark: "V" }
] as const;

const PREVIEW_SEGMENTS = Array.from({ length: 10 }, (_, index) => index);

export function MainMenu({ name, skinId, hatId, onNameChange, onSkinChange, onHatChange, onStart }: MainMenuProps) {
  const selectedSkin = SNAKE_SKINS.find((skin) => skin.id === skinId) ?? SNAKE_SKINS[0];
  const selectedHat = HAT_OPTIONS.find((hat) => hat.id === hatId) ?? HAT_OPTIONS[0];
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
              <b>{selectedHat.name}</b>
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
              <span>Hat Locker</span>
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

            <div className="future-slots" aria-label="Future cosmetic slots">
              <span>
                <Wand2 size={15} />
                Trail FX
                <Lock size={14} />
              </span>
              <span>
                <Sparkles size={15} />
                Nameplate
                <Lock size={14} />
              </span>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}

import { useState } from "react";
import { SNAKE_SKINS } from "../../../../shared/constants";
import { useAuth } from "../../lib/auth";
import { canUseSkin, isExclusiveSkin } from "../../lib/exclusiveSkins";
import { findMarketItemByRef, isFreeSkin } from "../../lib/marketCatalog";
import { useInventoryItems } from "../../lib/useEconomy";
import { SnakePreview3D } from "./SnakePreview3D";
import { WardrobeShell as WardrobeModal } from "./WardrobeShell";

type SkinPickerProps = {
  open: boolean;
  onClose: () => void;
  skinId: string;
  hatId: string;
  onChange: (skinId: string) => void;
};

const SKIN_RARITY: Record<string, string> = {
  "cyan-core": "CMN",
  "embercoil": "CMN",
  "venom-lime": "CMN",
  "void-violet": "EPIC",
  "solar-gold": "RARE",
  "rainbow": "MYTH",
  "tide": "RARE",
  "coal": "EPIC",
  "lotus": "EXCL"
};

export function SkinPicker({ open, onClose, skinId, hatId, onChange }: SkinPickerProps) {
  const { user } = useAuth();
  const owned = useInventoryItems();
  const [draft, setDraft] = useState(skinId);
  const selected = SNAKE_SKINS.find((s) => s.id === draft) ?? SNAKE_SKINS[0];
  const visibleSkins = SNAKE_SKINS.filter((s) => !isExclusiveSkin(s.id) || canUseSkin(s.id, user?.id));

  const isLocked = (id: string): boolean => {
    if (isFreeSkin(id)) return false;
    if (isExclusiveSkin(id)) return !canUseSkin(id, user?.id);
    const item = findMarketItemByRef("skin", id);
    if (!item) return false;
    return !owned.includes(item.id);
  };

  const handleEquip = () => {
    if (isLocked(draft)) return;
    onChange(draft);
    onClose();
  };
  const handleCancel = () => {
    setDraft(skinId);
    onClose();
  };
  return (
    <WardrobeModal
      open={open}
      onClose={handleCancel}
      preview={
        <SnakePreview3D
          skinId={draft}
          hatId={hatId}
          label="· · · CURRENT SELECTION · · ·"
          name={selected.name}
          meta={SKIN_RARITY[selected.id] ?? "CMN"}
        />
      }
      side={
        <div className="wg-modal-side">
          <div className="wg-modal-eyebrow">CHAPTER · I</div>
          <div>
            <div className="wg-modal-title">Choose your <span className="accent">silhouette</span></div>
            <div className="wg-modal-subtitle">A skin is a vessel — that decides whether they remember you tomorrow.</div>
          </div>
          <div className="wg-skin-grid" role="radiogroup" aria-label="Skin options">
            {visibleSkins.map((skin) => {
              const rare = SKIN_RARITY[skin.id] ?? "CMN";
              const locked = isLocked(skin.id);
              return (
                <button
                  key={skin.id}
                  type="button"
                  role="radio"
                  aria-checked={skin.id === draft}
                  aria-label={skin.name}
                  aria-disabled={locked}
                  className={
                    skin.id === draft
                      ? "wg-skin-card selected"
                      : locked
                        ? "wg-skin-card locked"
                        : "wg-skin-card"
                  }
                  onClick={() => { if (!locked) setDraft(skin.id); }}
                >
                  {locked ? (
                    <div className="wg-skin-lock">🔒</div>
                  ) : (
                    <div className="wg-skin-rare" style={rare === "EXCL" ? { color: "#f472b6" } : rare === "EPIC" ? { color: "var(--wg-ember)" } : rare === "RARE" ? { color: "var(--wg-gold)" } : undefined}>{rare}</div>
                  )}
                  <div
                    className="wg-skin-swatch has-glow"
                    style={{ background: `linear-gradient(135deg, ${skin.color}, ${skin.shadow})`, color: skin.color }}
                  />
                  <div className="wg-skin-name">{skin.name}</div>
                </button>
              );
            })}
          </div>
          <div className="wg-equip-row">
            <button className="wg-cancel-btn" type="button" onClick={handleCancel}>Cancel</button>
            <button
              className="wg-equip-btn"
              type="button"
              onClick={handleEquip}
              disabled={isLocked(draft)}
            >
              {isLocked(draft) ? "Locked" : <>Wear &nbsp;<span style={{ fontStyle: "normal" }}>→</span></>}
            </button>
          </div>
        </div>
      }
    />
  );
}

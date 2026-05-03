import { HAT_OPTIONS, ROPE_ACCESSORIES, SNAKE_SKINS } from "../../../../shared/constants";
import { MiniSnakePreview } from "./MiniSnakePreview";

type LoadoutPanelProps = {
  skinId: string;
  hatId: string;
  ropeAccessoryId: string;
  onOpenSkin: () => void;
  onOpenHat: () => void;
  onOpenCharm: () => void;
};

export function LoadoutPanel({ skinId, hatId, ropeAccessoryId, onOpenSkin, onOpenHat, onOpenCharm }: LoadoutPanelProps) {
  const skin = SNAKE_SKINS.find((s) => s.id === skinId) ?? SNAKE_SKINS[0];
  const hat = HAT_OPTIONS.find((h) => h.id === hatId) ?? HAT_OPTIONS[0];
  const rope = ROPE_ACCESSORIES.find((r) => r.id === ropeAccessoryId) ?? ROPE_ACCESSORIES[0];

  return (
    <section className="wg-panel" aria-label="Loadout">
      <div className="wg-panel-header">
        <div className="wg-panel-title">Loadout</div>
        <div className="wg-panel-meta">III SLOTS</div>
      </div>
      <MiniSnakePreview skinId={skinId} hatId={hatId} />
      <div className="wg-loadout-summary">
        <button type="button" className="wg-loadout-row" onClick={onOpenSkin}>
          <span className="lbl">Skin</span>
          <span className="val">
            <span className="swatch" style={{ background: skin.color, boxShadow: `0 0 8px ${skin.color}99` }} />
            {skin.name}
            <span className="arrow">▸</span>
          </span>
        </button>
        <button type="button" className="wg-loadout-row" onClick={onOpenHat}>
          <span className="lbl">Hat</span>
          <span className="val">
            {hat.id !== "none" ? <span>{hat.mark}</span> : null}
            {hat.name}
            <span className="arrow">▸</span>
          </span>
        </button>
        <button type="button" className="wg-loadout-row" onClick={onOpenCharm}>
          <span className="lbl">Charm</span>
          <span className="val">
            {rope.id !== "none" ? <span>{ropeMarkOf(rope.id)}</span> : null}
            {rope.name}
            <span className="arrow">▸</span>
          </span>
        </button>
      </div>
      <button type="button" className="wg-loadout-edit-btn" onClick={onOpenSkin}>▸ Open Wardrobe</button>
    </section>
  );
}

function ropeMarkOf(id: string): string {
  switch (id) {
    case "skull":   return "☠️";
    case "star":    return "⭐";
    case "diamond": return "💎";
    case "bolt":    return "⚡";
    case "fire":    return "🔥";
    case "eye":     return "👁️";
    case "heart":   return "❤️";
    default:        return "";
  }
}

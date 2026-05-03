import type { CSSProperties } from "react";
import { HAT_OPTIONS, SNAKE_SKINS } from "../../../../shared/constants";

type MiniSnakePreviewProps = {
  skinId: string;
  hatId: string;
};

export function MiniSnakePreview({ skinId, hatId }: MiniSnakePreviewProps) {
  const skin = SNAKE_SKINS.find((s) => s.id === skinId) ?? SNAKE_SKINS[0];
  const hat = HAT_OPTIONS.find((h) => h.id === hatId) ?? HAT_OPTIONS[0];
  const isRainbow = skin.id === "rainbow";

  const beadStyleAt = (index: number): CSSProperties => {
    if (isRainbow) {
      const hue = (index * 36) % 360;
      const c = `hsl(${hue}, 80%, 60%)`;
      return {
        background: c,
        boxShadow: `0 0 14px ${c}90, inset -3px -4px 0 rgba(0,0,0,0.18)`
      };
    }
    return {
      background: skin.color,
      boxShadow: `0 0 14px ${skin.color}90, inset -3px -4px 0 rgba(0,0,0,0.18)`
    };
  };

  return (
    <div className="wg-mini-stage" aria-label={`${skin.name} preview`}>
      <div className={isRainbow ? "wg-mini-snake wg-mini-snake--rainbow" : "wg-mini-snake"}>
        <i className="wg-mini-head" style={beadStyleAt(0)}>
          {hat.id !== "none" ? <span className="wg-mini-hat">{hat.mark}</span> : null}
        </i>
        <i style={beadStyleAt(1)} />
        <i style={beadStyleAt(2)} />
        <i style={beadStyleAt(3)} />
        <i style={beadStyleAt(4)} />
        <i style={beadStyleAt(5)} />
        <i style={beadStyleAt(6)} />
      </div>
    </div>
  );
}

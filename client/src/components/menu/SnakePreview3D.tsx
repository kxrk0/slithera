import type { CSSProperties } from "react";
import { HAT_OPTIONS, SNAKE_SKINS } from "../../../../shared/constants";

type SnakePreview3DProps = {
  skinId: string;
  hatId: string;
  label: string;
  name: string;
  meta: string;
};

export function SnakePreview3D({ skinId, hatId, label, name, meta }: SnakePreview3DProps) {
  const skin = SNAKE_SKINS.find((s) => s.id === skinId) ?? SNAKE_SKINS[0];
  const hat = HAT_OPTIONS.find((h) => h.id === hatId) ?? HAT_OPTIONS[0];
  const isRainbow = skin.id === "rainbow";

  const beadStyle = (index: number): CSSProperties => {
    if (isRainbow) {
      const hue = (index * 32) % 360;
      const c = `hsl(${hue}, 78%, 60%)`;
      const a = `hsl(${hue}, 90%, 80%)`;
      const s = `hsl(${hue}, 78%, 32%)`;
      return {
        background: `radial-gradient(circle at 30% 30%, ${a} 0%, ${c} 40%, ${s} 100%)`,
        boxShadow: `0 0 24px ${c}AA, inset -6px -8px 0 rgba(0,0,0,0.18)`
      };
    }
    return {
      background: `radial-gradient(circle at 30% 30%, ${skin.accent} 0%, ${skin.color} 40%, ${skin.shadow} 100%)`,
      boxShadow: `0 0 24px ${skin.color}99, inset -6px -8px 0 rgba(0,0,0,0.18)`
    };
  };

  return (
    <div className={isRainbow ? "wg-3d-stage wg-3d-stage--rainbow" : "wg-3d-stage"} aria-label={`${name} 3D preview`}>
      <div className="wg-3d-floor" />
      <div className="wg-3d-arena">
        <div className="wg-3d-cam">
          <div className="wg-3d-bead-pos b12"><div className="wg-3d-bead" style={beadStyle(11)} /></div>
          <div className="wg-3d-bead-pos b11"><div className="wg-3d-bead" style={beadStyle(10)} /></div>
          <div className="wg-3d-bead-pos b10"><div className="wg-3d-bead" style={beadStyle(9)} /></div>
          <div className="wg-3d-bead-pos b9"><div className="wg-3d-bead" style={beadStyle(8)} /></div>
          <div className="wg-3d-bead-pos b8"><div className="wg-3d-bead" style={beadStyle(7)} /></div>
          <div className="wg-3d-bead-pos b7"><div className="wg-3d-bead" style={beadStyle(6)} /></div>
          <div className="wg-3d-bead-pos b6"><div className="wg-3d-bead" style={beadStyle(5)} /></div>
          <div className="wg-3d-bead-pos b5"><div className="wg-3d-bead" style={beadStyle(4)} /></div>
          <div className="wg-3d-bead-pos b4"><div className="wg-3d-bead" style={beadStyle(3)} /></div>
          <div className="wg-3d-bead-pos b3"><div className="wg-3d-bead" style={beadStyle(2)} /></div>
          <div className="wg-3d-bead-pos b2"><div className="wg-3d-bead" style={beadStyle(1)} /></div>
          <div className="wg-3d-bead-pos b1">
            <div className="wg-3d-bead head" style={beadStyle(0)}>
              {hat.id !== "none" ? <div className="wg-3d-hat">{hat.mark}</div> : null}
            </div>
          </div>
        </div>
      </div>
      <div className="wg-3d-name">
        <div className="label">{label}</div>
        <div className="name">{name}</div>
        <div className="meta">{meta}</div>
      </div>
    </div>
  );
}

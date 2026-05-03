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
  const beadStyle = {
    background: `radial-gradient(circle at 30% 30%, ${skin.accent} 0%, ${skin.color} 40%, ${skin.shadow} 100%)`,
    boxShadow: `0 0 24px ${skin.color}99, inset -6px -8px 0 rgba(0,0,0,0.18)`
  };
  return (
    <div className="wg-3d-stage" aria-label={`${name} 3D preview`}>
      <div className="wg-3d-floor" />
      <div className="wg-3d-arena">
        <div className="wg-3d-cam">
          <div className="wg-3d-bead-pos b12"><div className="wg-3d-bead" style={beadStyle} /></div>
          <div className="wg-3d-bead-pos b11"><div className="wg-3d-bead" style={beadStyle} /></div>
          <div className="wg-3d-bead-pos b10"><div className="wg-3d-bead" style={beadStyle} /></div>
          <div className="wg-3d-bead-pos b9"><div className="wg-3d-bead" style={beadStyle} /></div>
          <div className="wg-3d-bead-pos b8"><div className="wg-3d-bead" style={beadStyle} /></div>
          <div className="wg-3d-bead-pos b7"><div className="wg-3d-bead" style={beadStyle} /></div>
          <div className="wg-3d-bead-pos b6"><div className="wg-3d-bead" style={beadStyle} /></div>
          <div className="wg-3d-bead-pos b5"><div className="wg-3d-bead" style={beadStyle} /></div>
          <div className="wg-3d-bead-pos b4"><div className="wg-3d-bead" style={beadStyle} /></div>
          <div className="wg-3d-bead-pos b3"><div className="wg-3d-bead" style={beadStyle} /></div>
          <div className="wg-3d-bead-pos b2"><div className="wg-3d-bead" style={beadStyle} /></div>
          <div className="wg-3d-bead-pos b1">
            <div className="wg-3d-bead head" style={beadStyle}>
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

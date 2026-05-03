import { HAT_OPTIONS, SNAKE_SKINS } from "../../../../shared/constants";

type MiniSnakePreviewProps = {
  skinId: string;
  hatId: string;
};

export function MiniSnakePreview({ skinId, hatId }: MiniSnakePreviewProps) {
  const skin = SNAKE_SKINS.find((s) => s.id === skinId) ?? SNAKE_SKINS[0];
  const hat = HAT_OPTIONS.find((h) => h.id === hatId) ?? HAT_OPTIONS[0];
  const beadStyle = {
    background: skin.color,
    boxShadow: `0 0 14px ${skin.color}90, inset -3px -4px 0 rgba(0,0,0,0.18)`
  };
  return (
    <div className="wg-mini-stage" aria-label={`${skin.name} preview`}>
      <div className="wg-mini-snake">
        <i className="wg-mini-head" style={beadStyle}>
          {hat.id !== "none" ? <span className="wg-mini-hat">{hat.mark}</span> : null}
        </i>
        <i style={beadStyle} />
        <i style={beadStyle} />
        <i style={beadStyle} />
        <i style={beadStyle} />
        <i style={beadStyle} />
        <i style={beadStyle} />
      </div>
    </div>
  );
}

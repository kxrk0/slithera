import { validateName } from "../../../../shared/names";
import { useLocale } from "../../lib/i18n";

type CenterPanelProps = {
  name: string;
  onNameChange: (name: string) => void;
  onStart: () => void;
  onSettings: () => void;
  onStats: () => void;
  onHowToPlay: () => void;
  latencyMs?: number;
};

export function CenterPanel({ name, onNameChange, onStart, onSettings, onStats, onHowToPlay, latencyMs }: CenterPanelProps) {
  const { t } = useLocale();
  const ping = typeof latencyMs === "number" && latencyMs > 0 ? `${latencyMs}ms` : "—";
  const trimmed = name.trim();
  const validation = validateName(name);
  const canStart = validation.ok;
  const VALIDATION_MESSAGE: Record<string, string> = {
    empty: t("name.empty"),
    "too-short": t("name.tooShort"),
    "too-long": t("name.tooLong"),
    profanity: t("name.profanity")
  };
  const errorMessage = validation.ok ? "" : VALIDATION_MESSAGE[validation.reason] ?? "";
  return (
    <section className="wg-center-panel" aria-label="Arena entry">
      <div className="wg-brand-block">
        <div className="wg-brand-eyebrow">Multiplayer · Persistent · 2026</div>
        <h1 className="wg-logo">Slither<span className="amp">&amp;</span>a</h1>
        <div className="wg-brand-tagline">Pour. Coil. Devour. — A cozy carnage for refined serpents.</div>
      </div>
      <div className="wg-divider"><span className="dot" /></div>
      <div className="wg-region-row">
        <div className="wg-region-chip active"><span className="ping" />EU-Frankfurt · {ping}</div>
        <div className="wg-region-chip">US-East · 92ms</div>
        <div className="wg-region-chip">Asia · 180ms</div>
      </div>
      <label className={`wg-name-input-wrap${!canStart && trimmed.length > 0 ? " invalid" : ""}`}>
        <span className="wg-name-input-icon" aria-hidden="true">◈</span>
        <input
          className="wg-name-input"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter" && canStart) onStart(); }}
          maxLength={16}
          placeholder={t("menu.choosePlaceholder")}
          aria-label="Player name"
          aria-invalid={!canStart && trimmed.length > 0}
          autoFocus
        />
        <span className="wg-name-meta">{name.length}/16</span>
      </label>
      {errorMessage && trimmed.length > 0 ? (
        <div className="wg-name-error" role="alert">{errorMessage}</div>
      ) : null}
      <button
        type="button"
        className={canStart ? "wg-play-btn" : "wg-play-btn disabled"}
        onClick={() => { if (canStart) onStart(); }}
        disabled={!canStart}
      >
        <div>
          <small>{canStart ? t("menu.beginArena").toUpperCase() : t("menu.enterName").toUpperCase()}</small>
          <span>{canStart && validation.ok ? t("menu.enterAs", { name: validation.value }) : t("menu.awaiting")}</span>
        </div>
        <span className="arrow-circle">→</span>
      </button>
      <div className="wg-secondary-row">
        <button type="button" className="wg-secondary-btn" onClick={onSettings}>
          <span className="icon">⚙</span><span>{t("menu.settings")}</span>
        </button>
        <button type="button" className="wg-secondary-btn" onClick={onStats}>
          <span className="icon">🏵</span><span>{t("menu.achievements")}</span>
        </button>
        <button type="button" className="wg-secondary-btn" onClick={onHowToPlay}>
          <span className="icon">❔</span><span>{t("menu.howToPlay")}</span>
        </button>
      </div>
    </section>
  );
}

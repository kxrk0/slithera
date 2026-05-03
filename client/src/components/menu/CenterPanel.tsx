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
  const ping = typeof latencyMs === "number" && latencyMs > 0 ? `${latencyMs}ms` : "—";
  const trimmed = name.trim();
  const canStart = trimmed.length > 0;
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
      <label className="wg-name-input-wrap">
        <span className="wg-name-input-icon" aria-hidden="true">◈</span>
        <input
          className="wg-name-input"
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          onKeyDown={(event) => { if (event.key === "Enter" && canStart) onStart(); }}
          maxLength={16}
          placeholder="Choose your name…"
          aria-label="Player name"
          autoFocus
        />
        <span className="wg-name-meta">{name.length}/16</span>
      </label>
      <button
        type="button"
        className={canStart ? "wg-play-btn" : "wg-play-btn disabled"}
        onClick={() => { if (canStart) onStart(); }}
        disabled={!canStart}
      >
        <div>
          <small>{canStart ? "BEGIN THE ARENA" : "ENTER A NAME TO BEGIN"}</small>
          <span>{canStart ? `Enter as ${trimmed}` : "Awaiting your sigil"}</span>
        </div>
        <span className="arrow-circle">→</span>
      </button>
      <div className="wg-secondary-row">
        <button type="button" className="wg-secondary-btn" onClick={onSettings}>
          <span className="icon">⚙</span><span>Settings</span>
        </button>
        <button type="button" className="wg-secondary-btn" onClick={onStats}>
          <span className="icon">📊</span><span>Stats</span>
        </button>
        <button type="button" className="wg-secondary-btn" onClick={onHowToPlay}>
          <span className="icon">❔</span><span>How to Play</span>
        </button>
      </div>
    </section>
  );
}

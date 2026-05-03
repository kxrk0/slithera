import { Crown, Expand, RotateCcw, Settings, Zap } from "lucide-react";
import { WORLD_HEIGHT, WORLD_WIDTH } from "../../../shared/constants";
import type { PlayerState, ServerSnapshot } from "../../../shared/types";

type GameHudProps = {
  status: string;
  latency: number;
  player?: PlayerState;
  playerId?: string;
  snapshot?: ServerSnapshot;
  paused: boolean;
  perf: { fps: number; renderer: string };
  onPause: () => void;
  onPlay: () => void;
  onRespawn: () => void;
  onMainMenu: () => void;
  onBoost: (boosting: boolean) => void;
};

export function GameHud({
  status,
  latency,
  player,
  playerId,
  snapshot,
  perf,
  onRespawn,
  onMainMenu,
  onBoost
}: GameHudProps) {
  const online = snapshot?.players.filter((item) => !item.bot).length ?? 0;
  const active = snapshot?.players.filter((item) => item.alive).length ?? 0;
  const leaderboard = snapshot?.leaderboard ?? [];
  const score = player?.score ?? 0;
  const killerName = useKillerName(player, snapshot);

  return (
    <div className="wg-hud" aria-live="polite">
      {/* Top-left: settings + arena status */}
      <section className="wg-hud-topleft">
        <button className="wg-hud-settings" type="button" aria-label="Settings">
          <Settings size={16} />
        </button>
        <div className="wg-hud-arena">
          <span className={`wg-hud-status-dot ${status}`} />
          <div>
            <strong>Arena</strong>
            <span>{Math.max(active, online)} online · {latency || "--"}ms</span>
          </div>
        </div>
      </section>

      {/* Top-center: brand */}
      <section className="wg-hud-brand" aria-label="Slithera">
        <h1>Slither<span className="amp">&amp;</span>a</h1>
      </section>

      {/* Top-right: leaderboard */}
      <section className="wg-hud-leaderboard" aria-label="Leaderboard">
        <header>
          <Crown size={14} fill="currentColor" />
          <span>The Hall</span>
        </header>
        <ol>
          {leaderboard.slice(0, 8).map((entry, index) => (
            <li className={entry.id === playerId ? "you" : ""} key={entry.id}>
              <span className="rank">{toRoman(index + 1)}</span>
              <span className="dot" style={{ background: entry.color }} />
              <span className="name">{entry.name}</span>
              <span className="points">{formatScore(entry.score)}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Bottom-left: score */}
      <section className="wg-hud-score">
        <span className="lbl">Score</span>
        <strong>{formatScore(score)}</strong>
      </section>

      {/* Bottom-right: minimap + perf */}
      <section className="wg-hud-perf" aria-label="Performance">
        <strong>{perf.fps || "--"}</strong>
        <span>FPS · {perf.renderer.toUpperCase()}</span>
      </section>

      <section className="wg-hud-minimap" aria-label="Minimap">
        <div className="wg-hud-minimap-grid">
          {snapshot?.food.slice(0, 26).map((food) => (
            <i
              key={food.id}
              style={{
                left: `${(food.x / WORLD_WIDTH) * 100}%`,
                top: `${(food.y / WORLD_HEIGHT) * 100}%`,
                background: food.color
              }}
            />
          ))}
          {snapshot?.players.map((item) => {
            const head = item.segments[0];
            if (!head || !item.alive) return null;
            return (
              <b
                className={item.id === playerId ? "me" : ""}
                key={item.id}
                style={{
                  left: `${(head.x / WORLD_WIDTH) * 100}%`,
                  top: `${(head.y / WORLD_HEIGHT) * 100}%`,
                  borderColor: item.color
                }}
              />
            );
          })}
        </div>
      </section>

      {/* Death overlay */}
      {player && !player.alive ? (
        <section className="wg-hud-death" role="alert">
          <div className="wg-hud-death-eyebrow">· · · ELIMINATED · · ·</div>
          <strong className="wg-hud-death-title">
            {killerName ? <>by <em>{killerName}</em></> : <>Your light trail fractured.</>}
          </strong>
          <span className="wg-hud-death-meta">Score · {formatScore(score)}</span>
          <div className="wg-hud-death-actions">
            <button className="wg-hud-btn-secondary" type="button" onClick={onMainMenu}>Main Menu</button>
            <button className="wg-hud-btn-primary" type="button" onClick={onRespawn}>
              <RotateCcw size={14} />
              <span>Respawn</span>
            </button>
          </div>
        </section>
      ) : null}

      {/* Touch boost button (mobile only) */}
      <section className="wg-hud-touch" aria-label="Touch controls">
        <button
          className="wg-hud-boost"
          type="button"
          aria-label="Boost"
          onPointerDown={() => onBoost(true)}
          onPointerUp={() => onBoost(false)}
          onPointerCancel={() => onBoost(false)}
        >
          <Zap size={26} fill="currentColor" />
        </button>
      </section>

      <button className="wg-hud-fullscreen" type="button" aria-label="Fullscreen" onClick={toggleFullscreen}>
        <Expand size={14} />
      </button>
    </div>
  );
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
  } else {
    void document.documentElement.requestFullscreen();
  }
}

function formatScore(value: number): string {
  return Math.floor(value).toLocaleString("en-US");
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
function toRoman(n: number): string {
  return ROMAN[Math.max(0, Math.min(ROMAN.length - 1, n - 1))];
}

function useKillerName(player: PlayerState | undefined, snapshot: ServerSnapshot | undefined): string | null {
  // Match the most recent death event for this player to find killer name.
  // Server includes events on snapshot? No — events go via type:"event" channel. As a graceful fallback,
  // we don't have direct killer access. Skip the killer lookup unless we can derive it.
  return null;
}

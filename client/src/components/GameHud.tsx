import { Crown, Expand, Pause, Play, RotateCcw, Settings, Zap } from "lucide-react";
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
  onPlay: () => void;
  onPause: () => void;
  onRespawn: () => void;
  onBoost: (boosting: boolean) => void;
};

export function GameHud({
  status,
  latency,
  player,
  playerId,
  snapshot,
  paused,
  perf,
  onPlay,
  onPause,
  onRespawn,
  onBoost
}: GameHudProps) {
  const online = snapshot?.players.filter((item) => !item.bot).length ?? 0;
  const active = snapshot?.players.filter((item) => item.alive).length ?? 0;
  const leaderboard = snapshot?.leaderboard ?? [];
  const score = player?.score ?? 0;

  return (
    <div className="hud" aria-live="polite">
      <section className="top-left controls" aria-label="Game controls">
        <button className="glass-button primary" onClick={onPlay} type="button" aria-label="Play">
          <Play size={22} fill="currentColor" />
          <span>Play</span>
        </button>
        <button className="glass-button" onClick={onPause} type="button" aria-label={paused ? "Resume" : "Pause"}>
          <Pause size={22} fill="currentColor" />
          <span>{paused ? "Resume" : "Pause"}</span>
        </button>
        <button className="glass-button icon-only" type="button" aria-label="Settings">
          <Settings size={23} />
        </button>
      </section>

      <section className="arena-status">
        <div className={`status-dot ${status}`} />
        <div>
          <strong>Arena</strong>
          <span>
            {Math.max(active, online)} online · {latency || "--"}ms
          </span>
        </div>
      </section>

      <section className="brand-plate" aria-label="Slithera">
        <h1>SLITHERA</h1>
      </section>

      <section className="perf panel" aria-label="Performance monitor">
        <strong>{perf.fps || "--"} FPS</strong>
        <span>{perf.renderer.toUpperCase()}</span>
      </section>

      <section className="leaderboard panel" aria-label="Leaderboard">
        <header>
          <Crown size={20} fill="currentColor" />
          <span>Leaderboard</span>
        </header>
        <ol>
          {leaderboard.map((entry, index) => (
            <li className={entry.id === playerId ? "you" : ""} key={entry.id}>
              <span className="rank">{index + 1}</span>
              <span className="name" style={{ color: entry.color }}>
                {entry.name}
              </span>
              <span className="points">{formatScore(entry.score)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="score panel">
        <span>Score</span>
        <strong>{formatScore(score)}</strong>
      </section>

      {player && !player.alive ? (
        <section className="death panel" role="alert">
          <strong>Eliminated</strong>
          <span>Your light trail fractured.</span>
          <button className="glass-button primary" type="button" onClick={onRespawn}>
            <RotateCcw size={18} />
            <span>Respawn</span>
          </button>
        </section>
      ) : null}

      <section className="touch-controls" aria-label="Touch controls">
        <button
          className="touch-button boost-touch"
          type="button"
          aria-label="Boost"
          onPointerDown={() => onBoost(true)}
          onPointerUp={() => onBoost(false)}
          onPointerCancel={() => onBoost(false)}
        >
          <Zap size={34} fill="currentColor" />
        </button>
        <div className="touch-button stick-touch" aria-hidden="true">
          <span />
        </div>
      </section>

      <section className="minimap" aria-label="Minimap">
        <div className="minimap-grid">
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

      <button className="fullscreen-button" type="button" aria-label="Fullscreen" onClick={toggleFullscreen}>
        <Expand size={19} />
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

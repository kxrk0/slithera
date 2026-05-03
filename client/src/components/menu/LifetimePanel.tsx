import { deriveTier, type StoredStats } from "../../lib/stats";

type LifetimePanelProps = {
  stats: StoredStats;
};

function formatPlayed(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}`;
  return `${m}m`;
}

function toRoman(n: number): string {
  const r = ["I", "II", "III", "IV", "V", "VI", "VII"];
  return r[Math.max(0, Math.min(r.length - 1, n))];
}

export function LifetimePanel({ stats }: LifetimePanelProps) {
  const tier = deriveTier(stats);
  return (
    <section className="wg-panel" aria-label="Lifetime stats">
      <div className="wg-panel-header">
        <div className="wg-panel-title">Lifetime</div>
        <div className="wg-panel-meta">{stats.gamesPlayed} GAMES</div>
      </div>
      <div className="wg-stats-grid">
        <div className="wg-stat-block">
          <div className="wg-stat-num">{stats.bestScore.toLocaleString()}</div>
          <div className="wg-stat-label">Best Score</div>
        </div>
        <div className="wg-stat-block">
          <div className="wg-stat-num cream">{stats.totalKills}</div>
          <div className="wg-stat-label">Total Kills</div>
        </div>
        <div className="wg-stat-block">
          <div className="wg-stat-num amber">{formatPlayed(stats.totalPlayedSec)}</div>
          <div className="wg-stat-label">Played</div>
        </div>
        <div className="wg-stat-block">
          <div className="wg-stat-num ember">{stats.winStreak}</div>
          <div className="wg-stat-label">Win Streak</div>
        </div>
      </div>
      <div className="wg-tier-badge">
        <div className="wg-tier-icon">{toRoman(tier.index)}</div>
        <div className="wg-tier-info">
          <div className="wg-tier-name">{tier.name}</div>
          <div className="wg-tier-progress"><i style={{ width: `${Math.round(tier.progress * 100)}%` }} /></div>
        </div>
        <div className="wg-tier-num">{Math.min(tier.points, tier.nextThreshold)}/{tier.nextThreshold}</div>
      </div>
    </section>
  );
}

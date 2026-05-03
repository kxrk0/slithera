import type { LeaderboardEntry } from "../../../../shared/types";
import { useAuth } from "../../lib/auth";
import { formatCountdown, type DailyChallenge } from "../../lib/daily";
import { ProfileCard } from "./ProfileCard";

type ArenaHallPanelProps = {
  leaderboard: LeaderboardEntry[];
  online: number;
  daily: DailyChallenge;
  countdownSec: number;
  playerName?: string;
  onOpenMarket: () => void;
  onOpenQuests: () => void;
  onOpenSocial: () => void;
  onOpenProfile: () => void;
};

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export function ArenaHallPanel({
  leaderboard, online, daily, countdownSec, playerName,
  onOpenMarket, onOpenQuests, onOpenSocial, onOpenProfile
}: ArenaHallPanelProps) {
  const slice = leaderboard.slice(0, 5);
  const { isSignedIn } = useAuth();
  const progressPct = Math.max(0, Math.min(100, Math.round((daily.progress / Math.max(1, daily.target)) * 100)));

  return (
    <div className="wg-right-stack">
      <section className="wg-panel" aria-label="Arena hall">
        <div className="wg-panel-header">
          <div className="wg-panel-title">The Hall</div>
          <div className="wg-panel-meta">LIVE · {online} ON</div>
        </div>
        <div className="wg-lb-list" aria-label="Leaderboard">
          {slice.map((entry, i) => (
            <div
              key={entry.id}
              className={[
                "wg-lb-row",
                i === 0 ? "top1" : i === 1 ? "top2" : i === 2 ? "top3" : "",
                entry.you ? "you" : ""
              ].filter(Boolean).join(" ")}
            >
              <span className="wg-lb-rank">{ROMAN[i]}</span>
              <span className="wg-lb-name">
                <span className="wg-lb-color" style={{ color: entry.color, background: entry.color }} />
                {entry.name}{entry.you ? " (You)" : ""}
              </span>
              <span className="wg-lb-score">{entry.score.toLocaleString()}</span>
            </div>
          ))}
          {slice.length === 0 ? (
            <div className="wg-lb-row" style={{ color: "var(--wg-cream-mute)", fontStyle: "italic" }}>
              <span />
              <span>The arena awaits…</span>
              <span />
            </div>
          ) : null}
        </div>

        {isSignedIn ? (
          <div className="wg-daily">
            <div className="wg-daily-header">
              <div className="wg-daily-name">{daily.name}</div>
              <div className="wg-daily-time">{formatCountdown(countdownSec)}</div>
            </div>
            <div className="wg-daily-desc">{daily.desc}</div>
            <div className="wg-daily-bar"><i style={{ width: `${progressPct}%` }} /></div>
            <div className="wg-daily-meta">
              <span className="progress">{daily.progress} / {daily.target}</span>
              <span className="reward">+{daily.reward} XP</span>
            </div>
          </div>
        ) : null}
      </section>

      <ProfileCard
        playerName={playerName}
        onOpenMarket={onOpenMarket}
        onOpenQuests={onOpenQuests}
        onOpenSocial={onOpenSocial}
        onOpenProfile={onOpenProfile}
      />
    </div>
  );
}

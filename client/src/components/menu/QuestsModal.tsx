import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import { addCoins } from "../../lib/coins";
import { loadDaily, formatCountdown, secondsUntilMidnight } from "../../lib/daily";
import { addXp } from "../../lib/xp";
import { WardrobeModal } from "./WardrobeModal";

type QuestsModalProps = { open: boolean; onClose: () => void };

type WeeklyQuest = {
  id: string;
  name: string;
  desc: string;
  xp: number;
  coins: number;
  progress: number;
  target: number;
};

const WEEKLY: WeeklyQuest[] = [
  { id: "wkly.eat-200", name: "The Long Feast", desc: "Devour 200 morsels across all matches.", xp: 600, coins: 800, progress: 84, target: 200 },
  { id: "wkly.kill-15", name: "The Hunter", desc: "Defeat 15 rival snakes.", xp: 800, coins: 600, progress: 5, target: 15 },
  { id: "wkly.length-150", name: "Reach for the Sky", desc: "Reach length 150 in a single run.", xp: 500, coins: 700, progress: 0, target: 150 },
  { id: "wkly.boost-20", name: "Velocity Cult", desc: "Win 20 boosts in succession without dying.", xp: 400, coins: 500, progress: 11, target: 20 }
];

export function QuestsModal({ open, onClose }: QuestsModalProps) {
  const { isSignedIn } = useAuth();
  const daily = loadDaily();
  const [countdown, setCountdown] = useState(() => secondsUntilMidnight());
  const [claimed, setClaimed] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setCountdown(secondsUntilMidnight()), 1000);
    return () => window.clearInterval(id);
  }, [open]);

  const claim = (questId: string, xp: number, coins: number) => {
    if (claimed.has(questId)) return;
    addXp(xp);
    addCoins(coins);
    setClaimed((prev) => new Set(prev).add(questId));
  };

  const dailyPct = Math.max(0, Math.min(100, Math.round((daily.progress / Math.max(1, daily.target)) * 100)));

  return (
    <WardrobeModal
      open={open}
      onClose={onClose}
      preview={
        <div className="wg-quests-hero">
          <div className="wg-quests-hero-eyebrow">· · · QUESTS · · ·</div>
          <div className="wg-quests-hero-title">Tribute &amp; <span className="accent">Renown</span></div>
          <div className="wg-quests-hero-meta">Daily and weekly. XP + coins on completion.</div>
          {!isSignedIn ? (
            <div className="wg-quests-locked">Sign in to take quests.</div>
          ) : null}
        </div>
      }
      side={
        <div className="wg-modal-side">
          <div className="wg-modal-eyebrow">CHAPTER · V</div>
          <div>
            <div className="wg-modal-title">Daily &amp; <span className="accent">weekly</span></div>
            <div className="wg-modal-subtitle">Refresh nightly at midnight (local).</div>
          </div>

          <div className="wg-quests-list">
            <div className={`wg-quest-card daily${isSignedIn ? "" : " locked"}`}>
              <div className="wg-quest-row-head">
                <div>
                  <div className="wg-quest-name">{daily.name}</div>
                  <div className="wg-quest-desc">{daily.desc}</div>
                </div>
                <div className="wg-quest-time">{formatCountdown(countdown)}</div>
              </div>
              <div className="wg-quest-bar"><i style={{ width: `${dailyPct}%` }} /></div>
              <div className="wg-quest-meta">
                <span>{daily.progress} / {daily.target}</span>
                <span className="reward">+{daily.reward} XP</span>
              </div>
            </div>

            {WEEKLY.map((q) => {
              const pct = Math.max(0, Math.min(100, Math.round((q.progress / q.target) * 100)));
              const ready = q.progress >= q.target;
              return (
                <div key={q.id} className={`wg-quest-card${isSignedIn ? "" : " locked"}`}>
                  <div className="wg-quest-row-head">
                    <div>
                      <div className="wg-quest-name">{q.name}</div>
                      <div className="wg-quest-desc">{q.desc}</div>
                    </div>
                    {ready && isSignedIn ? (
                      <button
                        className={claimed.has(q.id) ? "wg-quest-claim claimed" : "wg-quest-claim"}
                        type="button"
                        onClick={() => claim(q.id, q.xp, q.coins)}
                        disabled={claimed.has(q.id)}
                      >
                        {claimed.has(q.id) ? "Claimed" : "Claim"}
                      </button>
                    ) : (
                      <div className="wg-quest-rewards">
                        <span>+{q.xp} XP</span>
                        <span className="coin">◉ {q.coins}</span>
                      </div>
                    )}
                  </div>
                  <div className="wg-quest-bar"><i style={{ width: `${pct}%` }} /></div>
                  <div className="wg-quest-meta">
                    <span>{q.progress} / {q.target}</span>
                    <span className="reward">+{q.xp} XP · ◉ {q.coins}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      }
    />
  );
}

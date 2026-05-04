import { useEffect, useState } from "react";
import { loadAuthUser, useAuth } from "../../lib/auth";
import { addCoins } from "../../lib/coins";
import { claimDaily, loadDaily, formatCountdown, secondsUntilMidnight } from "../../lib/daily";
import { getQuestProgressFor, loadQuestProgress, WEEKLY_QUESTS } from "../../lib/quests";
import { addXp } from "../../lib/xp";
import { WardrobeShell as WardrobeModal } from "./WardrobeShell";

type QuestsModalProps = { open: boolean; onClose: () => void };

function claimKey(): string | null {
  const user = loadAuthUser();
  return user ? `slithera-quest-claims:${user.id}` : null;
}

function loadClaims(): Set<string> {
  const key = claimKey();
  if (!key) return new Set();
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return new Set();
    const arr = JSON.parse(raw) as string[];
    return new Set(Array.isArray(arr) ? arr : []);
  } catch { return new Set(); }
}

function saveClaims(claims: Set<string>): void {
  const key = claimKey();
  if (!key) return;
  try {
    window.localStorage.setItem(key, JSON.stringify([...claims]));
  } catch { /* ignore */ }
}

export function QuestsModal({ open, onClose }: QuestsModalProps) {
  const { isSignedIn, user } = useAuth();
  const [countdown, setCountdown] = useState(() => secondsUntilMidnight());
  const [claimed, setClaimed] = useState<Set<string>>(() => loadClaims());
  const [progressTick, setProgressTick] = useState(0);

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setCountdown(secondsUntilMidnight()), 1000);
    return () => window.clearInterval(id);
  }, [open]);

  useEffect(() => {
    setClaimed(loadClaims());
  }, [user?.id]);

  useEffect(() => {
    const refresh = () => setProgressTick((t) => t + 1);
    window.addEventListener("slithera-quest-progress-change", refresh);
    window.addEventListener("slithera-daily-change", refresh);
    window.addEventListener("slithera-auth-change", refresh);
    return () => {
      window.removeEventListener("slithera-quest-progress-change", refresh);
      window.removeEventListener("slithera-daily-change", refresh);
      window.removeEventListener("slithera-auth-change", refresh);
    };
  }, []);

  // Re-read on each render so claim grants/refresh always show the latest snapshot
  void progressTick;
  const daily = loadDaily();
  const progressSnapshot = loadQuestProgress();

  const claim = (questId: string, xp: number, coins: number) => {
    if (!isSignedIn || claimed.has(questId)) return;
    addXp(xp);
    addCoins(coins);
    const next = new Set(claimed).add(questId);
    saveClaims(next);
    setClaimed(next);
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
          ) : (
            <div className="wg-quests-hero-meta" style={{ marginTop: 18, opacity: 0.7 }}>
              Week of {progressSnapshot.weekStart}
            </div>
          )}
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
                {daily.progress >= daily.target && isSignedIn && !daily.claimed ? (
                  <button
                    className="wg-quest-claim"
                    type="button"
                    onClick={() => { claimDaily(); }}
                  >
                    Claim
                  </button>
                ) : daily.claimed ? (
                  <button className="wg-quest-claim claimed" type="button" disabled>Claimed</button>
                ) : (
                  <div className="wg-quest-time">{formatCountdown(countdown)}</div>
                )}
              </div>
              <div className="wg-quest-bar"><i style={{ width: `${dailyPct}%` }} /></div>
              <div className="wg-quest-meta">
                <span>{daily.progress} / {daily.target}</span>
                <span className="reward">+{daily.reward} XP · ◉ {Math.floor(daily.reward * 0.6)}</span>
              </div>
            </div>

            {WEEKLY_QUESTS.map((q) => {
              const current = getQuestProgressFor(q);
              const pct = Math.max(0, Math.min(100, Math.round((current / q.target) * 100)));
              const ready = current >= q.target;
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
                    <span>{current.toLocaleString()} / {q.target.toLocaleString()}</span>
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

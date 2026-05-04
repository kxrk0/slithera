import { useEffect, useState } from "react";
import { ACHIEVEMENTS, loadAchievements } from "../../lib/achievements";
import { useAuth } from "../../lib/auth";
import { useStats } from "../../lib/useEconomy";
import { WardrobeModal } from "./WardrobeModal";

type AchievementsModalProps = { open: boolean; onClose: () => void };

export function AchievementsModal({ open, onClose }: AchievementsModalProps) {
  const { user } = useAuth();
  const stats = useStats();
  const [unlocked, setUnlocked] = useState<Set<string>>(() => loadAchievements());

  useEffect(() => {
    setUnlocked(loadAchievements());
  }, [user?.id]);

  useEffect(() => {
    const refresh = () => setUnlocked(loadAchievements());
    window.addEventListener("slithera-achievements-change", refresh);
    window.addEventListener("slithera-auth-change", refresh);
    return () => {
      window.removeEventListener("slithera-achievements-change", refresh);
      window.removeEventListener("slithera-auth-change", refresh);
    };
  }, []);

  const total = ACHIEVEMENTS.length;
  const earned = unlocked.size;
  const pct = Math.round((earned / total) * 100);

  return (
    <WardrobeModal
      open={open}
      onClose={onClose}
      preview={
        <div className="wg-achievements-hero">
          <div className="wg-achievements-hero-eyebrow">· · · ACHIEVEMENTS · · ·</div>
          <div className="wg-achievements-hero-title">Marks of <span className="accent">Renown</span></div>
          <div className="wg-achievements-hero-meta">Permanent. Earned once, kept forever.</div>
          <div className="wg-achievements-progress-card">
            <div className="wg-achievements-progress-num">
              <strong>{earned}</strong>
              <span>/ {total}</span>
            </div>
            <div className="wg-achievements-progress-bar">
              <i style={{ width: `${pct}%` }} />
            </div>
            <div className="wg-achievements-progress-pct">{pct}% complete</div>
          </div>
        </div>
      }
      side={
        <div className="wg-modal-side">
          <div className="wg-modal-eyebrow">CHAPTER · VIII</div>
          <div>
            <div className="wg-modal-title">Earn your <span className="accent">marks</span></div>
            <div className="wg-modal-subtitle">Each mark grants XP and coins on first earn.</div>
          </div>
          <div className="wg-achievements-grid">
            {ACHIEVEMENTS.map((def) => {
              const isUnlocked = unlocked.has(def.id);
              const progress = computeProgress(def.id, stats);
              return (
                <div key={def.id} className={`wg-achievement-card${isUnlocked ? " unlocked" : ""}`}>
                  <div className="wg-achievement-card-glyph">{def.glyph}</div>
                  <div className="wg-achievement-card-body">
                    <div className="wg-achievement-card-name">{def.name}</div>
                    <div className="wg-achievement-card-desc">{def.desc}</div>
                    {!isUnlocked && progress ? (
                      <div className="wg-achievement-card-bar">
                        <i style={{ width: `${progress.pct}%` }} />
                        <span>{progress.label}</span>
                      </div>
                    ) : null}
                    <div className="wg-achievement-card-rewards">
                      {isUnlocked ? "EARNED" : `+${def.xp} XP · ◉ ${def.coins}`}
                    </div>
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

type ProgressInfo = { pct: number; label: string };

function computeProgress(id: string, stats: ReturnType<typeof useStats>): ProgressInfo | null {
  switch (id) {
    case "first-life":  return clampProgress(stats.gamesPlayed,    1);
    case "first-blood": return clampProgress(stats.totalKills,     1);
    case "length-50":   return clampProgress(stats.bestLength,    50);
    case "length-100":  return clampProgress(stats.bestLength,   100);
    case "length-200":  return clampProgress(stats.bestLength,   200);
    case "kills-10":    return clampProgress(stats.totalKills,   10);
    case "kills-50":    return clampProgress(stats.totalKills,   50);
    case "feast-100":   return clampProgress(stats.totalFoodEaten, 100);
    case "veteran-10":  return clampProgress(stats.gamesPlayed,  10);
    case "veteran-50":  return clampProgress(stats.gamesPlayed,  50);
    default: return null;
  }
}

function clampProgress(current: number, target: number): ProgressInfo {
  const safe = Math.max(0, current);
  const pct = Math.min(100, Math.round((safe / target) * 100));
  return { pct, label: `${safe.toLocaleString()} / ${target.toLocaleString()}` };
}

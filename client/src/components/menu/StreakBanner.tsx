import { useEffect, useState } from "react";
import { claimStreak, getClaimable, loadStreak, MILESTONES } from "../../lib/streak";
import { useAuth } from "../../lib/auth";
import { useLocale } from "../../lib/i18n";

export function StreakBanner() {
  const { isSignedIn, user } = useAuth();
  const { t } = useLocale();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const refresh = () => setTick((t) => t + 1);
    window.addEventListener("slithera-streak-change", refresh);
    window.addEventListener("slithera-auth-change", refresh);
    return () => {
      window.removeEventListener("slithera-streak-change", refresh);
      window.removeEventListener("slithera-auth-change", refresh);
    };
  }, []);

  // Force re-evaluation on mount + auth change
  void tick;
  void user?.id;

  if (!isSignedIn) return null;

  const state = loadStreak();
  const claim = getClaimable();
  const days = claim.available ? claim.newStreak : state.currentStreak;
  const nextMilestone = MILESTONES.find((m) => m.day > days);

  return (
    <div className={`wg-streak-banner${claim.available ? " glowing" : ""}`} role="region" aria-label="Daily streak">
      <div className="wg-streak-row">
        <div className="wg-streak-flame" aria-hidden="true">🔥</div>
        <div className="wg-streak-num">
          <strong>{days}</strong>
          <span>{days === 1 ? t("streak.days") : t("streak.daysPlural")}</span>
        </div>
        {claim.available ? (
          <button
            className="wg-streak-claim"
            type="button"
            onClick={() => { claimStreak(); }}
          >
            <span>{t("common.claim")}</span>
            <small>+{claim.reward.coins} ◉ · +{claim.reward.xp} XP</small>
          </button>
        ) : (
          <div className="wg-streak-claimed">
            <span>{t("streak.todayClaimed")}</span>
            {nextMilestone ? (
              <small>{t("streak.nextAt", { day: nextMilestone.day })}</small>
            ) : (
              <small>{t("streak.maxTier")}</small>
            )}
          </div>
        )}
      </div>
      <div className="wg-streak-track" aria-hidden="true">
        {[1, 2, 3, 4, 5, 6, 7].map((d) => {
          const isReached = d <= days;
          const isMilestone = MILESTONES.some((m) => m.milestone && m.day === d);
          return (
            <i
              key={d}
              className={`wg-streak-pip${isReached ? " on" : ""}${isMilestone ? " milestone" : ""}`}
              data-day={d}
            />
          );
        })}
      </div>
    </div>
  );
}

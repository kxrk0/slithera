import { useEffect, useState } from "react";
import type { AchievementDef } from "../lib/achievements";

type Toast = AchievementDef & { key: number };

export function AchievementToasts() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let counter = 0;
    const onUnlock = (event: Event) => {
      const ev = event as CustomEvent<AchievementDef>;
      const def = ev.detail;
      if (!def) return;
      counter += 1;
      const key = counter;
      setToasts((prev) => [...prev, { ...def, key }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.key !== key));
      }, 4200);
    };
    window.addEventListener("slithera-achievement-unlocked", onUnlock as EventListener);
    return () => window.removeEventListener("slithera-achievement-unlocked", onUnlock as EventListener);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="wg-achievement-toasts" aria-live="polite">
      {toasts.map((toast) => (
        <div className="wg-achievement-toast" key={toast.key}>
          <div className="wg-achievement-glyph" aria-hidden="true">{toast.glyph}</div>
          <div className="wg-achievement-body">
            <div className="wg-achievement-eyebrow">UNLOCKED</div>
            <div className="wg-achievement-name">{toast.name}</div>
            <div className="wg-achievement-rewards">+{toast.xp} XP · ◉ {toast.coins}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

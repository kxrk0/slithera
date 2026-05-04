import { useEffect, useRef, useState } from "react";

type Phase = "idle" | "updating" | "done";

type UpdateOverlayProps = {
  status: string;
};

// Show overlay when connection is lost for > GRACE_MS, hide when back online.
const GRACE_MS = 3500;

export function UpdateOverlay({ status }: UpdateOverlayProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const timerRef = useRef<number | undefined>(undefined);
  const wasDisconnectedRef = useRef(false);

  useEffect(() => {
    const disconnected = status === "reconnecting" || status === "offline";

    if (disconnected) {
      wasDisconnectedRef.current = true;
      if (!timerRef.current) {
        timerRef.current = window.setTimeout(() => {
          setPhase("updating");
        }, GRACE_MS);
      }
    } else {
      // Back online
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = undefined;
      }
      if (wasDisconnectedRef.current && phase === "updating") {
        setPhase("done");
      } else if (!disconnected && phase === "idle") {
        // Normal initial connect — stay idle
        wasDisconnectedRef.current = false;
      }
    }
  }, [status, phase]);

  if (phase === "idle") return null;

  return (
    <div className="wg-update-overlay">
      <div className="wg-update-card">
        {phase === "updating" ? (
          <>
            <div className="wg-update-spinner">
              <div className="wg-update-ring" />
              <div className="wg-update-ring delay-1" />
            </div>
            <div className="wg-update-eyebrow">· · · SERVER · · ·</div>
            <h2 className="wg-update-title">Update in Progress</h2>
            <p className="wg-update-desc">The server is restarting with new changes. Hang tight — this usually takes under a minute.</p>
            <div className="wg-update-dots">
              <span /><span /><span />
            </div>
          </>
        ) : (
          <>
            <div className="wg-update-check">
              <svg viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                <path d="M12 20.5L17.5 26L28 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="wg-check-path" />
              </svg>
            </div>
            <div className="wg-update-eyebrow">· · · COMPLETE · · ·</div>
            <h2 className="wg-update-title">Update Completed</h2>
            <p className="wg-update-desc">Server is back online with the latest version.</p>
            <button
              className="wg-update-refresh-btn"
              type="button"
              onClick={() => window.location.reload()}
            >
              Refresh Now
            </button>
          </>
        )}
      </div>
    </div>
  );
}

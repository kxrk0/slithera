import { useEffect, useRef, useState } from "react";

type TouchControlsProps = {
  onAim: (heading: number, active: boolean) => void;
  onBoost: (boosting: boolean) => void;
};

const STICK_RADIUS = 60;
const STICK_DEAD_ZONE = 8;

// Detect if the device looks touch-primary (no fine pointer = mobile/tablet)
function shouldShow(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(pointer: coarse)").matches) return true;
  // Touch + small screen as a backup
  return "ontouchstart" in window && window.innerWidth < 900;
}

export function TouchControls({ onAim, onBoost }: TouchControlsProps) {
  const [show, setShow] = useState(() => shouldShow());
  const [knob, setKnob] = useState({ x: 0, y: 0 });
  const [boostActive, setBoostActive] = useState(false);
  const stickRef = useRef<HTMLDivElement>(null);
  const stickPointerId = useRef<number | null>(null);
  const stickCenter = useRef<{ x: number; y: number } | null>(null);
  const boostPointerId = useRef<number | null>(null);

  useEffect(() => {
    const update = () => setShow(shouldShow());
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!show) return null;

  const handleStickStart = (event: React.PointerEvent<HTMLDivElement>) => {
    event.preventDefault();
    const rect = stickRef.current?.getBoundingClientRect();
    if (!rect) return;
    stickCenter.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    stickPointerId.current = event.pointerId;
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
    handleStickMove(event);
  };

  const handleStickMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (stickPointerId.current !== event.pointerId) return;
    const center = stickCenter.current;
    if (!center) return;
    const dx = event.clientX - center.x;
    const dy = event.clientY - center.y;
    const distance = Math.hypot(dx, dy);
    if (distance < STICK_DEAD_ZONE) {
      setKnob({ x: 0, y: 0 });
      onAim(0, false);
      return;
    }
    const clamped = Math.min(distance, STICK_RADIUS);
    const angle = Math.atan2(dy, dx);
    const kx = Math.cos(angle) * clamped;
    const ky = Math.sin(angle) * clamped;
    setKnob({ x: kx, y: ky });
    onAim(angle, true);
  };

  const handleStickEnd = (event: React.PointerEvent<HTMLDivElement>) => {
    if (stickPointerId.current !== event.pointerId) return;
    stickPointerId.current = null;
    stickCenter.current = null;
    setKnob({ x: 0, y: 0 });
    onAim(0, false);
  };

  const handleBoostDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    boostPointerId.current = event.pointerId;
    setBoostActive(true);
    onBoost(true);
  };

  const handleBoostUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (boostPointerId.current !== event.pointerId) return;
    boostPointerId.current = null;
    setBoostActive(false);
    onBoost(false);
  };

  return (
    <>
      <div
        className="wg-touch-zone wg-touch-stick"
        ref={stickRef}
        onPointerDown={handleStickStart}
        onPointerMove={handleStickMove}
        onPointerUp={handleStickEnd}
        onPointerCancel={handleStickEnd}
      >
        <i style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
      </div>
      <button
        type="button"
        className={`wg-touch-zone wg-touch-boost${boostActive ? " active" : ""}`}
        aria-label="Boost"
        onPointerDown={handleBoostDown}
        onPointerUp={handleBoostUp}
        onPointerCancel={handleBoostUp}
      >
        Boost
      </button>
    </>
  );
}

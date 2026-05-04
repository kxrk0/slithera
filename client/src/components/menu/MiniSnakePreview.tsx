import { useEffect, useRef } from "react";
import { HAT_OPTIONS, SNAKE_SKINS } from "../../../../shared/constants";

type MiniSnakePreviewProps = {
  skinId: string;
  hatId: string;
};

// Internal canvas resolution; CSS stretches it to fill the loadout stage.
const CW = 320;
const CH = 92;
const HEAD_X = 220;
const TAIL_X = 50;
const BASELINE_Y = 50;
const SEGMENTS = 11;
const BODY_R = 10;
const HEAD_R = 12;

type PathNode = { x: number; y: number; r: number };
type Skin = typeof SNAKE_SKINS[number];

export function MiniSnakePreview({ skinId, hatId }: MiniSnakePreviewProps) {
  const skin = SNAKE_SKINS.find((s) => s.id === skinId) ?? SNAKE_SKINS[0];
  const hat = HAT_OPTIONS.find((h) => h.id === hatId) ?? HAT_OPTIONS[0];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isRainbow = skin.id === "rainbow";
  const isLotus = skin.id === "lotus";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const hatMark = hat.id !== "none" ? hat.mark : null;

    let raf = 0;
    let alive = true;
    const tick = (now: number) => {
      if (!alive) return;
      ctx.clearRect(0, 0, CW, CH);
      drawMiniSnake(ctx, now, skin, isRainbow, isLotus, hatMark);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => { alive = false; cancelAnimationFrame(raf); };
  }, [skin.id, isRainbow, isLotus, skin.color, skin.accent, skin.shadow, hat.id, hat.mark]);

  return (
    <div className="wg-mini-stage" aria-label={`${skin.name} preview`}>
      <canvas ref={canvasRef} width={CW} height={CH} className="wg-mini-canvas" />
    </div>
  );
}

function buildPath(now: number): PathNode[] {
  const path: PathNode[] = [];
  const taperStart = SEGMENTS - 5;
  for (let i = 0; i < SEGMENTS; i += 1) {
    const t = i / (SEGMENTS - 1);
    const x = HEAD_X - t * (HEAD_X - TAIL_X);
    // Subtle vertical wave traveling head→tail
    const wave = Math.sin(i * 0.6 - now * 0.0024) * 4 + Math.sin(i * 0.3 + now * 0.001) * 2;
    const y = BASELINE_Y + wave;
    let r = BODY_R;
    if (i >= taperStart) {
      const tt = (i - taperStart) / Math.max(1, SEGMENTS - 1 - taperStart);
      r = BODY_R * (1 - tt * tt * 0.78);
    }
    path.push({ x, y, r });
  }
  return path;
}

function lotusHueAt(i: number, t: number): { hue: number; sat: number; light: number } {
  const phase = (t + i * 0.18) % 1;
  const w1 = Math.sin(phase * Math.PI * 2);
  const w2 = Math.sin(phase * Math.PI * 2 * 1.618 + 0.5);
  const hue = ((290 + w1 * 45 + w2 * 18) % 360 + 360) % 360;
  const sat = 82 + w2 * 12;
  const light = 55 + w1 * 14 + w2 * 8;
  return { hue, sat, light };
}

function drawMiniSnake(
  ctx: CanvasRenderingContext2D,
  now: number,
  skin: Skin,
  isRainbow: boolean,
  isLotus: boolean,
  hatMark: string | null
): void {
  const path = buildPath(now);
  const N = path.length;
  const lotusT = now * 0.00035;

  // ----- Body fill: per-segment color strokes (head→tail) -----
  for (let i = 0; i < N - 1; i += 1) {
    const a = path[i];
    const b = path[i + 1];
    let color: string = skin.color;
    if (isRainbow) {
      const hue = ((i * 32) + (now * 0.0006) * 360) % 360;
      color = `hsl(${hue}, 80%, 60%)`;
    } else if (isLotus) {
      const c = lotusHueAt(i, lotusT);
      color = `hsl(${c.hue}, ${c.sat}%, ${c.light}%)`;
    }
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = a.r + b.r;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  // ----- Lotus shimmer: single polyline -----
  if (isLotus) {
    const mid = lotusHueAt(Math.floor(N / 2), lotusT);
    const edgeHue = (mid.hue + 70) % 360;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < N; i += 1) ctx.lineTo(path[i].x, path[i].y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = BODY_R * 0.9;
    ctx.strokeStyle = `hsla(${edgeHue}, 90%, 82%, 0.32)`;
    ctx.stroke();
  }

  // ----- Specular streak (single dot, mini scale) -----
  const streakT = (now * 0.001) % 1;
  const streakIdx = Math.floor(streakT * N);
  for (let k = 0; k < 3; k += 1) {
    const idx = streakIdx + k;
    if (idx < 1 || idx >= N) continue;
    const node = path[idx];
    const fade = 1 - k / 3;
    ctx.fillStyle = `rgba(255, 255, 255, ${0.18 * fade})`;
    ctx.beginPath();
    ctx.arc(node.x - node.r * 0.18, node.y - node.r * 0.32, node.r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  // ----- HEAD -----
  const head = path[0];
  const headColor = isLotus
    ? (() => { const c = lotusHueAt(0, lotusT); return `hsl(${c.hue}, ${c.sat}%, ${c.light}%)`; })()
    : isRainbow
      ? `hsl(${((now * 0.0006) * 360) % 360}, 80%, 60%)`
      : skin.color;

  if (isLotus) {
    drawLotusFlower(ctx, head.x, head.y, HEAD_R, lotusT);
  }

  // Head base: shadow + main fill + forward "snout" bulge
  const fwdX = 1; // facing right
  ctx.fillStyle = skin.shadow;
  ctx.beginPath();
  ctx.arc(head.x + fwdX * HEAD_R * 0.55, head.y, HEAD_R * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(head.x, head.y, HEAD_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = headColor;
  ctx.beginPath();
  ctx.arc(head.x + fwdX * HEAD_R * 0.55, head.y, HEAD_R * 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(head.x, head.y, HEAD_R * 0.92, 0, Math.PI * 2);
  ctx.fill();

  // Lotus stigma jewel
  if (isLotus) {
    const c = lotusHueAt(0, lotusT);
    drawLotusStigma(ctx, head.x, head.y, HEAD_R, c.hue, lotusT);
  }

  // Mouth: thin closed line at the snout tip
  const mouthCx = head.x + fwdX * HEAD_R * (isLotus ? 1.05 : 1.0);
  ctx.strokeStyle = "rgba(18, 9, 10, 0.65)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(mouthCx, head.y + HEAD_R * 0.32);
  ctx.lineTo(mouthCx, head.y - HEAD_R * 0.32);
  ctx.stroke();

  // Hat: emoji above the head
  if (hatMark) {
    ctx.save();
    ctx.font = "18px system-ui, 'Apple Color Emoji', 'Segoe UI Emoji', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    ctx.shadowColor = "rgba(0, 0, 0, 0.5)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    ctx.fillStyle = "#ffffff";
    ctx.fillText(hatMark, head.x, head.y - HEAD_R * 0.95);
    ctx.restore();
  }

  // Eyes: multi-layer (sclera + iris + pupil + sparkle), scaled to mini head
  const eyeForward = HEAD_R * 0.4;
  const eyeSide = HEAD_R * 0.32;
  const scleraR = HEAD_R * 0.28;
  const irisR = HEAD_R * 0.20;
  const pupilR = HEAD_R * 0.12;
  for (const side of [-1, 1] as const) {
    const ex = head.x + fwdX * eyeForward;
    const ey = head.y + side * eyeSide;
    ctx.fillStyle = "#fff4d9";
    ctx.beginPath();
    ctx.arc(ex, ey, scleraR, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(18, 9, 10, 0.55)";
    ctx.lineWidth = 0.6;
    ctx.stroke();
    ctx.fillStyle = "#1d2030";
    ctx.beginPath();
    ctx.arc(ex + fwdX * 0.8, ey, irisR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000000";
    ctx.beginPath();
    ctx.arc(ex + fwdX * 1.4, ey, pupilR, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(ex + fwdX * 1.0, ey - 0.8, pupilR * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawLotusFlower(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, lotusT: number): void {
  const spinOuter = (lotusT * 0.38) % (Math.PI * 2);
  const spinInner = (lotusT * 0.55) % (Math.PI * 2);
  const hue0 = ((290 + Math.sin(lotusT * Math.PI * 2) * 45) % 360 + 360) % 360;

  const drawPetal = (angle: number, len: number, wid: number, color: string, alpha: number) => {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const rr = wid * Math.sin(t * Math.PI) * (1 - t * 0.25);
      const d = len * t;
      i === 0 ? ctx.moveTo(d, rr) : ctx.lineTo(d, rr);
    }
    for (let i = steps; i >= 0; i--) {
      const t = i / steps;
      const rr = wid * Math.sin(t * Math.PI) * (1 - t * 0.25);
      const d = len * t;
      ctx.lineTo(d, -rr);
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  };

  for (let p = 0; p < 8; p++) {
    const angle = (p / 8) * Math.PI * 2 + spinOuter;
    const ph = ((hue0 + p * 22) % 360 + 360) % 360;
    const pl = 58 + Math.sin(lotusT * Math.PI * 2 + p * 0.85) * 12;
    drawPetal(angle, r * 1.9, r * 0.62, `hsl(${ph}, 82%, ${pl}%)`, 0.85);
  }
  for (let p = 0; p < 8; p++) {
    const angle = (p / 8) * Math.PI * 2 + spinInner + Math.PI / 8;
    const ph = ((hue0 + p * 22 + 45) % 360 + 360) % 360;
    const pl = 65 + Math.sin(lotusT * Math.PI * 2 + p * 0.9) * 10;
    drawPetal(angle, r * 1.28, r * 0.42, `hsl(${ph}, 85%, ${pl}%)`, 0.94);
  }
}

function drawLotusStigma(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, hue0: number, lotusT: number): void {
  const spinStamen = (lotusT * 0.72) % (Math.PI * 2);
  for (let s = 0; s < 6; s++) {
    const sa = (s / 6) * Math.PI * 2 + spinStamen;
    const sh = ((hue0 + s * 30) % 360 + 360) % 360;
    ctx.fillStyle = `hsl(${sh}, 95%, 84%)`;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(sa) * r * 0.62, cy + Math.sin(sa) * r * 0.62, r * 0.13, 0, Math.PI * 2);
    ctx.fill();
  }
  const layers: Array<[number, string]> = [
    [r * 0.44, `hsl(${(hue0 + 30) % 360}, 80%, 42%)`],
    [r * 0.30, `hsl(${(hue0 + 60) % 360}, 90%, 75%)`],
    [r * 0.17, "#fce7f3"],
    [r * 0.09, "#ffffff"]
  ];
  for (const [rr, color] of layers) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, rr, 0, Math.PI * 2);
    ctx.fill();
  }
}

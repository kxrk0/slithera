import { useEffect, useRef } from "react";
import { SNAKE_SKINS, type Rarity } from "../../../../../shared/constants";
import { ItemIcon } from "./ItemIcon";

export type MarketCategory = "skin" | "hat" | "charm" | "trail";

export interface SnakePreviewProps {
  itemId: string;
  category: MarketCategory;
  rarity: Rarity;
  height?: number;       // CSS height in px (default 60)
  bodySkinId?: string;   // override body skin for wardrobe (shows your own skin)
}

// ── Internal canvas constants ─────────────────────────────────────────────────
const CW = 288;          // internal canvas width
const CH = 80;           // internal canvas height
const HEAD_X = 236;      // head x in canvas space
const TAIL_X = 52;       // tail x in canvas space
const HEAD_R = 11;
const BODY_R = 9;
const SEG_N  = 8;

// Y baseline per category (snake center line)
const BASELINE: Record<MarketCategory, number> = {
  skin:  42,   // centered
  trail: 42,   // centered
  hat:   52,   // lower → hat icon fits above
  charm: 22,   // upper → charm hangs in lower half
};

type PathNode = { x: number; y: number; r: number };
type SkinDef  = typeof SNAKE_SKINS[number];

const TRAIL_COLORS: Record<string, [string, string, string]> = {
  "trail.sparkle":         ["#ffffff", "#fffde7", "#f8f0ff"],
  "trail.shadow-trail":    ["#7c3aed", "#4c1d95", "#a78bfa"],
  "trail.fire-trail":      ["#ff6000", "#ff9500", "#ffd000"],
  "trail.ice-trail":       ["#7dd8e8", "#c8f3fc", "#4ab9d3"],
  "trail.rainbow-trail":   ["#ff6b9a", "#ffd700", "#7ee8fa"],
  "trail.sakura-trail":    ["#ffb7c5", "#fce7f3", "#ff92a6"],
  "trail.void-trail":      ["#818cf8", "#4338ca", "#c084fc"],
  "trail.gold-trail":      ["#ffd24d", "#f59e0b", "#fff8de"],
  "trail.lightning-trail": ["#facc15", "#fef08a", "#a3e635"],
  "trail.aurora-trail":    ["#00e5ff", "#e040fb", "#69ffb4"],
};

// ── Component ─────────────────────────────────────────────────────────────────

export function SnakePreview({ itemId, category, rarity, height = 60, bodySkinId }: SnakePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Resolve snake body skin
  const skinLookup = category === "skin" ? itemId.slice(5) : (bodySkinId ?? null);
  const skinData   = skinLookup ? SNAKE_SKINS.find(s => s.id === skinLookup) : null;

  const isRainbow = skinData?.id === "rainbow";
  const isLotus   = skinData?.id === "lotus";
  const baselineY = BASELINE[category];
  const trailPal  = TRAIL_COLORS[itemId] ?? (["#ffffff", "#aaaaff", "#8888ff"] as [string, string, string]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId = 0;
    let alive = true;
    let visible = false;

    // Only draw when element is in viewport (perf: market grid can have 60+ canvases)
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.01 });
    io.observe(canvas);

    const tick = (now: number) => {
      if (!alive) return;
      if (visible) {
        ctx.clearRect(0, 0, CW, CH);
        drawFrame(ctx, now, skinData, isRainbow, isLotus, category, baselineY, trailPal);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      alive = false;
      io.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [skinData?.id, isRainbow, isLotus, category, baselineY, trailPal.join()]);

  // CSS scale: map internal canvas coords → CSS pixels
  const sc = height / CH;

  // ── Hat overlay: above head ───────────────────────────────────────────────
  const hatSz   = Math.round(height * 0.40);
  const hatLeft = `calc(${(HEAD_X / CW * 100).toFixed(1)}% - ${Math.round(hatSz / 2)}px)`;
  const hatTop  = Math.round(baselineY * sc - HEAD_R * sc - hatSz);

  // ── Charm overlay: below neck, connected by rope drawn on canvas ──────────
  const neckX   = HEAD_X - (HEAD_X - TAIL_X) / (SEG_N - 1);
  const ropeLen = 18;   // internal canvas units
  const ropeEndY = baselineY + BODY_R + ropeLen;
  const charmSz  = Math.round(height * 0.32);
  const charmLeft = `calc(${((neckX + 6) / CW * 100).toFixed(1)}% - ${Math.round(charmSz / 2)}px)`;
  const charmTop  = Math.round(ropeEndY * sc);

  const showHat   = category === "hat"   && !itemId.endsWith(".none");
  const showCharm = category === "charm" && !itemId.endsWith(".none");

  return (
    <div style={{ position: "relative", width: "100%", height, flexShrink: 0, overflow: "visible" }}>
      <canvas
        ref={canvasRef}
        width={CW}
        height={CH}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", pointerEvents: "none" }}
      />

      {/* Hat SVG icon floats above head */}
      {showHat && (
        <div style={{ position: "absolute", left: hatLeft, top: Math.max(0, hatTop), pointerEvents: "none", zIndex: 3 }}>
          <ItemIcon itemId={itemId} rarity={rarity} size={hatSz} />
        </div>
      )}

      {/* Charm SVG icon dangles from rope endpoint */}
      {showCharm && (
        <div style={{ position: "absolute", left: charmLeft, top: charmTop, pointerEvents: "none", zIndex: 3 }}>
          <ItemIcon itemId={itemId} rarity={rarity} size={charmSz} />
        </div>
      )}
    </div>
  );
}

// ── Canvas drawing ────────────────────────────────────────────────────────────

function buildPath(now: number, baselineY: number): PathNode[] {
  const path: PathNode[] = [];
  const taperStart = SEG_N - 4;
  for (let i = 0; i < SEG_N; i++) {
    const t = i / (SEG_N - 1);
    const x = HEAD_X - t * (HEAD_X - TAIL_X);
    const wave = Math.sin(i * 0.6 - now * 0.0024) * 5 + Math.sin(i * 0.3 + now * 0.001) * 2.5;
    const y = baselineY + wave;
    let r = BODY_R;
    if (i >= taperStart) {
      const tt = (i - taperStart) / Math.max(1, SEG_N - 1 - taperStart);
      r = BODY_R * (1 - tt * tt * 0.76);
    }
    path.push({ x, y, r });
  }
  return path;
}

function lotusHue(i: number, t: number) {
  const phase = (t + i * 0.18) % 1;
  const w1 = Math.sin(phase * Math.PI * 2);
  const w2 = Math.sin(phase * Math.PI * 2 * 1.618 + 0.5);
  return {
    hue:   ((290 + w1 * 45 + w2 * 18) % 360 + 360) % 360,
    sat:   82 + w2 * 12,
    light: 55 + w1 * 14 + w2 * 8,
  };
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  now: number,
  skin: SkinDef | null | undefined,
  isRainbow: boolean,
  isLotus: boolean,
  category: MarketCategory,
  baselineY: number,
  trailPal: [string, string, string],
): void {
  const path   = buildPath(now, baselineY);
  const N      = path.length;
  const lt     = now * 0.00035;
  const body   = skin?.color  ?? "#1c2838";
  const shadow = skin?.shadow ?? "#0e1926";

  // ── Trail orbs behind tail ──────────────────────────────────────
  if (category === "trail") {
    const tail = path[N - 1], prev = path[N - 2];
    const dx = tail.x - prev.x, dy = tail.y - prev.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = dx / len, ny = dy / len;
    [0.9, 1.6, 2.4, 3.4].forEach((t, i) => {
      ctx.beginPath();
      ctx.arc(tail.x + nx * t * 20, tail.y + ny * t * 20, tail.r * Math.max(0.14, 0.86 - i * 0.22), 0, Math.PI * 2);
      ctx.fillStyle = trailPal[i % 3];
      ctx.globalAlpha = 0.78 - i * 0.17;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
  }

  // ── Body strokes ────────────────────────────────────────────────
  for (let i = 0; i < N - 1; i++) {
    const a = path[i], b = path[i + 1];
    let color = body;
    if (isRainbow) {
      color = `hsl(${((i * 32) + (now * 0.0006) * 360) % 360}, 80%, 60%)`;
    } else if (isLotus) {
      const c = lotusHue(i, lt);
      color = `hsl(${c.hue},${c.sat}%,${c.light}%)`;
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

  // ── Lotus shimmer overlay ───────────────────────────────────────
  if (isLotus) {
    const mid = lotusHue(Math.floor(N / 2), lt);
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (let i = 1; i < N; i++) ctx.lineTo(path[i].x, path[i].y);
    ctx.lineWidth = BODY_R * 0.9;
    ctx.strokeStyle = `hsla(${(mid.hue + 70) % 360},90%,82%,0.32)`;
    ctx.stroke();
  }

  // ── Specular streak ─────────────────────────────────────────────
  const si = Math.floor(((now * 0.001) % 1) * N);
  for (let k = 0; k < 3; k++) {
    const idx = si + k;
    if (idx < 1 || idx >= N) continue;
    const nd = path[idx];
    ctx.fillStyle = `rgba(255,255,255,${0.18 * (1 - k / 3)})`;
    ctx.beginPath();
    ctx.arc(nd.x - nd.r * 0.18, nd.y - nd.r * 0.32, nd.r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  // ── Charm rope (drawn on canvas so it scales with snake) ────────
  if (category === "charm") {
    const neck = path[1];
    ctx.strokeStyle = "#8a7060";
    ctx.lineWidth = 1.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(neck.x, neck.y + BODY_R);
    ctx.lineTo(neck.x + 6, neck.y + BODY_R + 18);
    ctx.stroke();
  }

  // ── Head ────────────────────────────────────────────────────────
  const hd = path[0];
  const headColor = isRainbow
    ? `hsl(${((now * 0.0006) * 360) % 360},80%,60%)`
    : isLotus
      ? (() => { const c = lotusHue(0, lt); return `hsl(${c.hue},${c.sat}%,${c.light}%)`; })()
      : body;

  ctx.fillStyle = shadow;
  ctx.beginPath();
  ctx.arc(hd.x + HEAD_R * 0.5, hd.y, HEAD_R * 0.70, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(hd.x, hd.y, HEAD_R, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = headColor;
  ctx.beginPath();
  ctx.arc(hd.x + HEAD_R * 0.5, hd.y, HEAD_R * 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(hd.x, hd.y, HEAD_R * 0.92, 0, Math.PI * 2);
  ctx.fill();

  // Mouth line at snout tip
  ctx.strokeStyle = "rgba(18,9,10,0.65)";
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(hd.x + HEAD_R, hd.y + HEAD_R * 0.32);
  ctx.lineTo(hd.x + HEAD_R, hd.y - HEAD_R * 0.32);
  ctx.stroke();

  // ── Eyes ────────────────────────────────────────────────────────
  const ef = HEAD_R * 0.40, es = HEAD_R * 0.34;
  const scR = HEAD_R * 0.26, irR = HEAD_R * 0.17, puR = HEAD_R * 0.10;
  for (const side of [-1, 1] as const) {
    const ex = hd.x + ef, ey = hd.y + side * es;
    ctx.fillStyle = "#fff4d9";
    ctx.beginPath(); ctx.arc(ex, ey, scR, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "rgba(18,9,10,0.5)"; ctx.lineWidth = 0.6; ctx.stroke();
    ctx.fillStyle = "#1d2030";
    ctx.beginPath(); ctx.arc(ex + 0.8, ey, irR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath(); ctx.arc(ex + 1.5, ey, puR, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(ex + 1.0, ey - 0.8, puR * 0.5, 0, Math.PI * 2); ctx.fill();
  }
}

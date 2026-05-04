import { SNAKE_SKINS, type Rarity } from "../../../../../shared/constants";
import { ItemIcon } from "./ItemIcon";

type MarketCategory = "skin" | "hat" | "charm" | "trail";

interface Props {
  itemId: string;
  category: MarketCategory;
  rarity: Rarity;
  size?: number;
}

// Trail particle colors per trail id
const TRAIL_PALETTE: Record<string, [string, string, string]> = {
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

// Standard S-curve: head top-right, tail bottom-left (skin, charm, trail)
const STD = [
  { x: 0.69, y: 0.22, r: 0.155 }, // head
  { x: 0.58, y: 0.37, r: 0.128 },
  { x: 0.46, y: 0.51, r: 0.124 },
  { x: 0.33, y: 0.65, r: 0.120 },
  { x: 0.22, y: 0.80, r: 0.108 }, // tail
];

// Hat layout: snake shifted down so hat icon fits above head
const HAT = [
  { x: 0.67, y: 0.40, r: 0.155 }, // head — lower to give hat room
  { x: 0.55, y: 0.54, r: 0.128 },
  { x: 0.41, y: 0.67, r: 0.122 },
  { x: 0.28, y: 0.82, r: 0.110 }, // tail
];

export function SnakePreview({ itemId, category, rarity, size = 72 }: Props) {
  // Resolve skin color data
  const skinRef = category === "skin" ? itemId.slice(5) : null;
  const skinData = skinRef ? SNAKE_SKINS.find(s => s.id === skinRef) : null;

  const bodyColor   = skinData?.color  ?? "#1c2838";
  const accentColor = skinData?.accent ?? "#2a3d56";
  const highColor   = skinData?.accent ?? "#3a5272";

  const rawSegs = category === "hat" ? HAT : STD;
  const segs = rawSegs.map(s => ({ x: s.x * size, y: s.y * size, r: s.r * size }));
  const head = segs[0];
  const tail = segs[segs.length - 1];
  const prevSeg = segs[segs.length - 2] ?? segs[0];

  // Per-item unique gradient IDs (prevent DOM collisions)
  const uid = itemId.replace(/[^a-z0-9]/g, "");
  const gBody = `spb-${uid}`;
  const gHead = `sph-${uid}`;

  // Hat overlay: center hat icon above the snake head
  const hatSz  = Math.round(size * 0.44);
  const hatLeft = head.x - hatSz / 2;
  const hatTop  = head.y - head.r - hatSz * 0.80;

  // Charm rope: hangs from underside of neck segment
  const neckSeg    = segs[1] ?? segs[0];
  const ropeAnchorX = neckSeg.x;
  const ropeAnchorY = neckSeg.y + neckSeg.r;
  const ropeEndX    = neckSeg.x + size * 0.04;
  const ropeEndY    = ropeAnchorY + size * 0.15;
  const charmSz    = Math.round(size * 0.36);
  const charmLeft  = ropeEndX - charmSz / 2;
  const charmTop   = ropeEndY;

  // Trail direction: extend past tail away from snake
  const tdx   = tail.x - prevSeg.x;
  const tdy   = tail.y - prevSeg.y;
  const tLen  = Math.sqrt(tdx * tdx + tdy * tdy) || 1;
  const tnx   = tdx / tLen;
  const tny   = tdy / tLen;
  const trailPalette = TRAIL_PALETTE[itemId] ?? ["#ffffff", "#aaaaff", "#8888ff"];
  const trailDists = [size * 0.07, size * 0.13, size * 0.20, size * 0.28];

  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" style={{ display: "block" }}>
        <defs>
          {/* Body gradient: dark→accent along snake direction */}
          <linearGradient id={gBody} x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={bodyColor}   stopOpacity="0.82"/>
            <stop offset="100%" stopColor={accentColor}  stopOpacity="0.96"/>
          </linearGradient>
          {/* Head: radial highlight */}
          <radialGradient id={gHead} cx="38%" cy="34%" r="64%">
            <stop offset="0%"   stopColor={highColor}/>
            <stop offset="100%" stopColor={bodyColor}  stopOpacity="0.92"/>
          </radialGradient>
        </defs>

        {/* ── Trail particles behind tail ──────────────────────────── */}
        {category === "trail" && trailDists.map((d, i) => (
          <circle
            key={i}
            cx={tail.x + tnx * d}
            cy={tail.y + tny * d}
            r={tail.r * Math.max(0.12, 0.88 - i * 0.22)}
            fill={trailPalette[i % 3]}
            opacity={0.78 - i * 0.17}
          />
        ))}

        {/* ── Body segments drawn tail-first so head is on top ──────── */}
        {[...segs].reverse().map((seg, ri) => {
          const isHead = ri === segs.length - 1;
          return (
            <circle
              key={ri}
              cx={seg.x} cy={seg.y} r={seg.r}
              fill={isHead ? `url(#${gHead})` : `url(#${gBody})`}
            />
          );
        })}

        {/* ── Head rim ────────────────────────────────────────────── */}
        <circle
          cx={head.x} cy={head.y} r={head.r}
          fill="none"
          stroke={accentColor}
          strokeWidth="1.2"
          opacity="0.55"
        />

        {/* ── Head inner highlight ─────────────────────────────────── */}
        <circle
          cx={head.x - head.r * 0.21}
          cy={head.y - head.r * 0.27}
          r={head.r * 0.30}
          fill="white"
          opacity="0.09"
        />

        {/* ── Eyes ─────────────────────────────────────────────────── */}
        <circle
          cx={head.x + head.r * 0.30}
          cy={head.y - head.r * 0.24}
          r={head.r * 0.24}
          fill="white"
        />
        <circle
          cx={head.x + head.r * 0.37}
          cy={head.y - head.r * 0.21}
          r={head.r * 0.13}
          fill="#06060a"
        />
        {/* Eye shine */}
        <circle
          cx={head.x + head.r * 0.28}
          cy={head.y - head.r * 0.28}
          r={head.r * 0.07}
          fill="white"
          opacity="0.82"
        />

        {/* ── Charm rope ───────────────────────────────────────────── */}
        {category === "charm" && (
          <line
            x1={ropeAnchorX} y1={ropeAnchorY}
            x2={ropeEndX}    y2={ropeEndY}
            stroke="#8a7060"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.88"
          />
        )}
      </svg>

      {/* ── Hat icon: rendered above snake head ─────────────────────── */}
      {category === "hat" && (
        <div
          style={{
            position: "absolute",
            left: Math.round(hatLeft),
            top:  Math.round(hatTop),
            pointerEvents: "none",
          }}
        >
          <ItemIcon itemId={itemId} rarity={rarity} size={hatSz}/>
        </div>
      )}

      {/* ── Charm icon: dangles below rope endpoint ──────────────────── */}
      {category === "charm" && (
        <div
          style={{
            position: "absolute",
            left: Math.round(charmLeft),
            top:  Math.round(charmTop),
            pointerEvents: "none",
          }}
        >
          <ItemIcon itemId={itemId} rarity={rarity} size={charmSz}/>
        </div>
      )}
    </div>
  );
}

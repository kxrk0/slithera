// Skin icons (stylized snake cross-section) + Trail icons
type S = { size: number };

// ── SKIN BASE ─────────────────────────────────────────────────────────────────
// Each skin renders as a stylized circular cross-section of the snake body

// ── MYTHIC SKINS ──────────────────────────────────────────────────────────────

export function RainbowSkinIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="rb-ring" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
          <stop offset="0%"   stopColor="#ff0000"/>
          <stop offset="17%"  stopColor="#ff8800"/>
          <stop offset="33%"  stopColor="#ffff00"/>
          <stop offset="50%"  stopColor="#00ff44"/>
          <stop offset="67%"  stopColor="#0088ff"/>
          <stop offset="83%"  stopColor="#8800ff"/>
          <stop offset="100%" stopColor="#ff0000"/>
        </linearGradient>
      </defs>
      {/* Rotating rainbow ring */}
      <circle cx="30" cy="30" r="24" fill="none" stroke="url(#rb-ring)" strokeWidth="8">
        <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="4s" repeatCount="indefinite"/>
      </circle>
      {/* Inner circle */}
      <circle cx="30" cy="30" r="14" fill="#1a0a2e"/>
      {/* Prismatic center */}
      <circle cx="30" cy="30" r="8" fill="url(#rb-ring)" opacity="0.6">
        <animateTransform attributeName="transform" type="rotate" from="360 30 30" to="0 30 30" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="24" cy="24" r="3.5" fill="white" opacity="0.35"/>
    </svg>
  );
}

export function LotusSkinIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="lot-center" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff0f8"/>
          <stop offset="100%" stopColor="#f472b6"/>
        </radialGradient>
      </defs>
      {/* 8 petals */}
      {[0,45,90,135,180,225,270,315].map(a => (
        <ellipse key={a} cx={30 + Math.cos((a-90)*Math.PI/180)*16} cy={30 + Math.sin((a-90)*Math.PI/180)*16}
          rx="8" ry="12" fill="#f472b6" opacity="0.7"
          transform={`rotate(${a} ${30 + Math.cos((a-90)*Math.PI/180)*16} ${30 + Math.sin((a-90)*Math.PI/180)*16})`}>
          <animate attributeName="opacity" values="0.7;0.4;0.7" dur={`${2+a/200}s`} repeatCount="indefinite"/>
        </ellipse>
      ))}
      {/* Center */}
      <circle cx="30" cy="30" r="12" fill="url(#lot-center)"/>
      <circle cx="26" cy="26" r="3.5" fill="white" opacity="0.4"/>
    </svg>
  );
}

export function AuroraSkinIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="aur-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#004d66"/>
          <stop offset="100%" stopColor="#001a26"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="26" fill="url(#aur-bg)"/>
      {/* Aurora bands */}
      <path d="M 6,24 Q 20,18 34,22 Q 48,26 54,20" stroke="#00e5ff" strokeWidth="3.5" fill="none" opacity="0.7" strokeLinecap="round">
        <animate attributeName="d" values="M 6,24 Q 20,18 34,22 Q 48,26 54,20;M 6,22 Q 20,28 34,20 Q 48,18 54,24;M 6,24 Q 20,18 34,22 Q 48,26 54,20" dur="4s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;0.4;0.7" dur="4s" repeatCount="indefinite"/>
      </path>
      <path d="M 6,32 Q 20,26 34,30 Q 48,34 54,28" stroke="#b040ff" strokeWidth="2.5" fill="none" opacity="0.6" strokeLinecap="round">
        <animate attributeName="d" values="M 6,32 Q 20,26 34,30 Q 48,34 54,28;M 6,30 Q 20,36 34,28 Q 48,26 54,32;M 6,32 Q 20,26 34,30 Q 48,34 54,28" dur="5s" repeatCount="indefinite"/>
      </path>
      <path d="M 6,40 Q 20,34 34,38 Q 48,42 54,36" stroke="#00ff88" strokeWidth="2" fill="none" opacity="0.5" strokeLinecap="round">
        <animate attributeName="d" values="M 6,40 Q 20,34 34,38 Q 48,42 54,36;M 6,38 Q 20,44 34,36 Q 48,34 54,40;M 6,40 Q 20,34 34,38 Q 48,42 54,36" dur="3.5s" repeatCount="indefinite"/>
      </path>
      <circle cx="26" cy="22" r="2.5" fill="white" opacity="0.3"/>
    </svg>
  );
}

// ── LEGENDARY SKINS ───────────────────────────────────────────────────────────

export function ObsidianSkinIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="obs-bg" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#2d2d3a"/>
          <stop offset="100%" stopColor="#0a0a12"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="26" fill="url(#obs-bg)"/>
      {/* Gold fissure veins */}
      <path d="M 20,14 Q 26,22 30,30 Q 34,38 40,46" stroke="#c9a227" strokeWidth="1.5" fill="none" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="3s" repeatCount="indefinite"/>
      </path>
      <path d="M 14,30 Q 22,28 30,30 Q 38,32 46,30" stroke="#c9a227" strokeWidth="1" fill="none" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="4s" repeatCount="indefinite"/>
      </path>
      <path d="M 24,18 Q 28,24 26,32 Q 24,38 28,44" stroke="#f0c840" strokeWidth="0.8" fill="none" opacity="0.5"/>
      <circle cx="30" cy="30" r="26" fill="none" stroke="#c9a227" strokeWidth="1" opacity="0.4"/>
      <circle cx="22" cy="22" r="3" fill="white" opacity="0.12"/>
    </svg>
  );
}

export function LavaSkinIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="lava-bg" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#ff8844"/>
          <stop offset="60%" stopColor="#dd3300"/>
          <stop offset="100%" stopColor="#5a0a00"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="26" fill="url(#lava-bg)"/>
      {/* Lava flow cracks */}
      <path d="M 18,16 Q 24,24 22,32 Q 20,40 26,48" stroke="#ffaa44" strokeWidth="2" fill="none" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite"/>
      </path>
      <path d="M 34,14 Q 38,22 36,30 Q 34,40 40,48" stroke="#ff6622" strokeWidth="1.5" fill="none" opacity="0.5"/>
      {/* Glowing hot spots */}
      <circle cx="24" cy="28" r="5" fill="#ffcc44" opacity="0.4">
        <animate attributeName="r" values="4;7;4" dur="1.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.4;0.7;0.4" dur="1.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="38" cy="36" r="3" fill="#ffaa00" opacity="0.5">
        <animate attributeName="r" values="2;5;2" dur="2.2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="22" cy="22" r="3" fill="white" opacity="0.2"/>
    </svg>
  );
}

export function InfernoSkinIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="inf-bg" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#cc2200"/>
          <stop offset="60%" stopColor="#660000"/>
          <stop offset="100%" stopColor="#1a0000"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="26" fill="url(#inf-bg)"/>
      {/* Ember particles */}
      {[[20,38],[30,42],[38,36],[24,44],[36,44]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="1.5" fill="#ff6600" opacity="0.7">
          <animateTransform attributeName="transform" type="translate" values={`0,0;${(i%2?1:-1)*3},-${6+i*2};0,0`} dur={`${1.5+i*0.3}s`} repeatCount="indefinite"/>
          <animate attributeName="opacity" values="0.7;0;0.7" dur={`${1.5+i*0.3}s`} repeatCount="indefinite"/>
        </circle>
      ))}
      <circle cx="30" cy="30" r="26" fill="none" stroke="#cc2200" strokeWidth="1" opacity="0.5"/>
      <circle cx="22" cy="22" r="3" fill="white" opacity="0.15"/>
    </svg>
  );
}

// ── EPIC SKINS ────────────────────────────────────────────────────────────────

export function TideSkinIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="tide-bg" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#40c8b8"/>
          <stop offset="100%" stopColor="#0a4f4b"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="26" fill="url(#tide-bg)"/>
      {/* Wave pattern */}
      <path d="M 6,30 Q 14,24 22,30 Q 30,36 38,30 Q 46,24 54,30" stroke="#aef5ee" strokeWidth="2" fill="none" opacity="0.6">
        <animateTransform attributeName="transform" type="translate" values="0,0;-16,0;0,0" dur="3s" repeatCount="indefinite"/>
      </path>
      <path d="M 6,36 Q 14,30 22,36 Q 30,42 38,36 Q 46,30 54,36" stroke="#aef5ee" strokeWidth="1.5" fill="none" opacity="0.4">
        <animateTransform attributeName="transform" type="translate" values="0,0;16,0;0,0" dur="4s" repeatCount="indefinite"/>
      </path>
      <circle cx="22" cy="22" r="3.5" fill="white" opacity="0.3"/>
    </svg>
  );
}

export function CoalSkinIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="coal-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#3a3a3f"/>
          <stop offset="100%" stopColor="#0e0e10"/>
        </radialGradient>
        <radialGradient id="coal-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff4444"/>
          <stop offset="100%" stopColor="#880000"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="26" fill="url(#coal-bg)"/>
      {/* Red core pulse */}
      <circle cx="30" cy="30" r="10" fill="url(#coal-core)" opacity="0.7">
        <animate attributeName="r" values="8;13;8" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite"/>
      </circle>
      {/* Coal cracks */}
      <path d="M 20,20 L 30,30 M 40,18 L 30,30 M 22,40 L 30,30" stroke="#ff2200" strokeWidth="0.8" opacity="0.4"/>
      <circle cx="22" cy="22" r="3" fill="white" opacity="0.1"/>
    </svg>
  );
}

export function MidnightSkinIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="mid-bg" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#1a1a4e"/>
          <stop offset="100%" stopColor="#09091f"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="26" fill="url(#mid-bg)"/>
      {/* Stars */}
      {[[16,18],[24,12],[38,16],[44,26],[36,38],[20,40],[28,48],[12,32],[46,36]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r={i%3===0?2:1.2} fill="#6d9fff" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.2;0.7" dur={`${1.5+i*0.4}s`} repeatCount="indefinite"/>
        </circle>
      ))}
      <circle cx="22" cy="22" r="3" fill="white" opacity="0.2"/>
    </svg>
  );
}

export function ChromeSkinIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="chr-bg" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#e0e8f0"/>
          <stop offset="50%" stopColor="#b0b8c4"/>
          <stop offset="100%" stopColor="#4a5060"/>
        </radialGradient>
        <linearGradient id="chr-sweep" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="white" stopOpacity="0"/>
          <stop offset="50%" stopColor="white" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <circle cx="30" cy="30" r="26" fill="url(#chr-bg)"/>
      {/* Metallic reflection sweep */}
      <ellipse cx="20" cy="20" rx="14" ry="8" fill="url(#chr-sweep)" transform="rotate(-30 20 20)">
        <animate attributeName="opacity" values="0;1;0" dur="3s" repeatCount="indefinite"/>
        <animateTransform attributeName="transform" type="translate" values="-20,-20;20,20;-20,-20" dur="3s" repeatCount="indefinite" additive="sum"/>
      </ellipse>
      <circle cx="30" cy="30" r="26" fill="none" stroke="white" strokeWidth="0.8" opacity="0.3"/>
      <circle cx="20" cy="20" r="5" fill="white" opacity="0.25"/>
    </svg>
  );
}

export function GlacialSkinIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="gla-bg" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#d4f5fc"/>
          <stop offset="50%" stopColor="#7dd8e8"/>
          <stop offset="100%" stopColor="#1e6a7a"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="26" fill="url(#gla-bg)"/>
      {/* Frost crystal lines */}
      {[0,60,120,180,240,300].map(a => (
        <line key={a} x1="30" y1="30"
          x2={30 + Math.cos(a*Math.PI/180)*20}
          y2={30 + Math.sin(a*Math.PI/180)*20}
          stroke="white" strokeWidth="0.8" opacity="0.4"/>
      ))}
      <circle cx="30" cy="30" r="4" fill="white" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.2;0.6" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="20" cy="20" r="3.5" fill="white" opacity="0.35"/>
    </svg>
  );
}

// ── RARE SKINS ────────────────────────────────────────────────────────────────

export function VoidVioletSkinIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="vv-bg" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#c060ff"/>
          <stop offset="60%" stopColor="#6020cc"/>
          <stop offset="100%" stopColor="#1a0040"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="26" fill="url(#vv-bg)"/>
      {/* Electric edge arcs */}
      <circle cx="30" cy="30" r="22" fill="none" stroke="#e0a0ff" strokeWidth="1" strokeDasharray="4 6" opacity="0.5">
        <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="6s" repeatCount="indefinite"/>
      </circle>
      <circle cx="22" cy="22" r="3.5" fill="white" opacity="0.3"/>
    </svg>
  );
}

export function SolarGoldSkinIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="sg-bg" cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#fff3bd"/>
          <stop offset="50%" stopColor="#ffd24d"/>
          <stop offset="100%" stopColor="#6d4a05"/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="26" fill="url(#sg-bg)"/>
      {/* Solar flare rays */}
      {[0,45,90,135,180,225,270,315].map(a => (
        <line key={a} x1={30+Math.cos(a*Math.PI/180)*20} y1={30+Math.sin(a*Math.PI/180)*20}
              x2={30+Math.cos(a*Math.PI/180)*26} y2={30+Math.sin(a*Math.PI/180)*26}
              stroke="#ffe566" strokeWidth="1.5" opacity="0.6">
          <animate attributeName="opacity" values="0.6;0.2;0.6" dur={`${1.8+a/100}s`} repeatCount="indefinite"/>
        </line>
      ))}
      <circle cx="22" cy="22" r="3.5" fill="white" opacity="0.35"/>
    </svg>
  );
}

// Simple colored skin helper for remaining rare/uncommon skins
function SimpleSkin({ size, color, accent, highlight }: S & { color: string; accent: string; highlight?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id={`ss-${color.replace('#','')}`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor={accent}/>
          <stop offset="100%" stopColor={color}/>
        </radialGradient>
      </defs>
      <circle cx="30" cy="30" r="26" fill={`url(#ss-${color.replace('#','')})`}/>
      {highlight && <circle cx="30" cy="30" r="26" fill="none" stroke={highlight} strokeWidth="1" opacity="0.4"/>}
      <circle cx="22" cy="22" r="3.5" fill="white" opacity="0.28"/>
    </svg>
  );
}

export function ShadowSkinIcon({ size }: S) { return <SimpleSkin size={size} color="#2d2d3a" accent="#6a6a80" highlight="#9b59b6"/>; }
export function CrimsonSkinIcon({ size }: S) { return <SimpleSkin size={size} color="#7b0a1f" accent="#ff8096" highlight="#dc143c"/>; }
export function ArcticSkinIcon({ size }: S) { return <SimpleSkin size={size} color="#4a90b8" accent="#ffffff" highlight="#c8eeff"/>; }
export function SakuraSkinIcon({ size }: S) { return <SimpleSkin size={size} color="#c96089" accent="#fff0f3" highlight="#ffb7c5"/>; }
export function PoisonSkinIcon({ size }: S) { return <SimpleSkin size={size} color="#1a6600" accent="#b8ff8c" highlight="#39ff14"/>; }
export function CyanCoreSkinIcon({ size }: S) { return <SimpleSkin size={size} color="#075c76" accent="#b9f6ff" highlight="#22d8ff"/>; }
export function EmbercoilSkinIcon({ size }: S) { return <SimpleSkin size={size} color="#6b1b13" accent="#ffd2a8" highlight="#ff6a43"/>; }
export function VenomLimeSkinIcon({ size }: S) { return <SimpleSkin size={size} color="#33680d" accent="#f1ffd2" highlight="#a6ff3f"/>; }

// ── TRAIL ICONS ───────────────────────────────────────────────────────────────

export function SparkleTrailIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {[[8,30],[18,22],[28,30],[38,22],[48,28],[54,38]].map(([cx,cy],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={3+i*0.4} fill="#ffd700" opacity={0.3+i*0.12}>
            <animate attributeName="opacity" values={`${0.3+i*0.12};${0.7+i*0.04};${0.3+i*0.12}`} dur={`${1.2+i*0.2}s`} repeatCount="indefinite"/>
          </circle>
          {i > 2 && <line x1={cx-4} y1={cy} x2={cx+4} y2={cy} stroke="#fff" strokeWidth="0.5" opacity="0.4"/>}
          {i > 2 && <line x1={cx} y1={cy-4} x2={cx} y2={cy+4} stroke="#fff" strokeWidth="0.5" opacity="0.4"/>}
        </g>
      ))}
    </svg>
  );
}

export function ShadowTrailIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {[[10,32],[20,28],[30,32],[40,28],[50,32]].map(([cx,cy],i) => (
        <ellipse key={i} cx={cx} cy={cy} rx={4+i*1.2} ry={3+i*0.8} fill="#2a1a4a" opacity={0.2+i*0.15}>
          <animate attributeName="opacity" values={`${0.2+i*0.15};${0.05};${0.2+i*0.15}`} dur={`${2+i*0.4}s`} repeatCount="indefinite"/>
        </ellipse>
      ))}
    </svg>
  );
}

export function FireTrailIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="ftr-g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff4400" stopOpacity="0.1"/>
          <stop offset="100%" stopColor="#ffaa00"/>
        </linearGradient>
      </defs>
      <path d="M 6,30 Q 20,22 34,30 Q 48,38 56,26" stroke="url(#ftr-g)" strokeWidth="8" fill="none" strokeLinecap="round" opacity="0.6">
        <animate attributeName="d" values="M 6,30 Q 20,22 34,30 Q 48,38 56,26;M 6,32 Q 20,26 34,28 Q 48,34 56,28;M 6,30 Q 20,22 34,30 Q 48,38 56,26" dur="0.8s" repeatCount="indefinite"/>
      </path>
      <circle cx="54" cy="26" r="6" fill="#ff8800">
        <animate attributeName="r" values="5;8;5" dur="0.6s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

export function IceTrailIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {[[14,30],[24,24],[34,30],[44,24],[52,28]].map(([cx,cy],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={3+i*0.8} fill="#a8e6f8" opacity={0.2+i*0.15}/>
          {[0,60,120,180,240,300].map(a => (
            <line key={a} x1={cx} y1={cy}
              x2={cx + Math.cos(a*Math.PI/180)*(3+i*0.6)}
              y2={cy + Math.sin(a*Math.PI/180)*(3+i*0.6)}
              stroke="#d0f4ff" strokeWidth="0.8" opacity={0.3+i*0.1}/>
          ))}
        </g>
      ))}
    </svg>
  );
}

export function RainbowTrailIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {[
        { color:"#ff4444", offset: 0 },
        { color:"#ffaa00", offset: 4 },
        { color:"#ffff44", offset: 8 },
        { color:"#44ff88", offset: 12 },
        { color:"#4488ff", offset: 16 },
        { color:"#aa44ff", offset: 20 },
      ].map(({ color, offset }, i) => (
        <path key={i}
          d={`M 6,${38-offset} Q 30,${18-offset} 54,${34-offset}`}
          stroke={color} strokeWidth="2" fill="none" opacity={0.7-i*0.06} strokeLinecap="round"/>
      ))}
    </svg>
  );
}

export function SakuraTrailIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {[[12,38],[22,26],[32,34],[42,22],[52,30]].map(([cx,cy],i) => (
        <g key={i} transform={`rotate(${i*30} ${cx} ${cy})`}>
          {[0,72,144,216,288].map(a => (
            <ellipse key={a}
              cx={cx + Math.cos(a*Math.PI/180)*4}
              cy={cy + Math.sin(a*Math.PI/180)*4}
              rx="3.5" ry="2"
              fill="#ffb7c5" opacity={0.5+i*0.08}
              transform={`rotate(${a} ${cx + Math.cos(a*Math.PI/180)*4} ${cy + Math.sin(a*Math.PI/180)*4})`}/>
          ))}
          <circle cx={cx} cy={cy} r="1.5" fill="#fff0f3"/>
        </g>
      ))}
    </svg>
  );
}

export function VoidTrailIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {[[10,34],[20,28],[30,34],[40,26],[52,32]].map(([cx,cy],i) => (
        <g key={i}>
          <circle cx={cx} cy={cy} r={3+i*1.2} fill="#1a0040" opacity={0.4+i*0.1}/>
          <circle cx={cx} cy={cy} r={2+i} fill="none" stroke="#7c3aed" strokeWidth="0.8" opacity={0.3+i*0.1}>
            <animate attributeName="r" values={`${1+i};${3+i*1.2};${1+i}`} dur={`${2+i*0.3}s`} repeatCount="indefinite"/>
            <animate attributeName="opacity" values={`${0.3+i*0.1};0;${0.3+i*0.1}`} dur={`${2+i*0.3}s`} repeatCount="indefinite"/>
          </circle>
        </g>
      ))}
    </svg>
  );
}

export function GoldTrailIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="gtr-g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c8922a" stopOpacity="0"/>
          <stop offset="100%" stopColor="#ffe566"/>
        </linearGradient>
      </defs>
      <path d="M 6,30 Q 20,26 34,30 Q 44,34 54,28" stroke="url(#gtr-g)" strokeWidth="6" fill="none" strokeLinecap="round"/>
      {/* Shimmer particles */}
      {[[30,28],[38,26],[46,24],[52,22]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="2" fill="#ffe566" opacity={0.4+i*0.15}>
          <animate attributeName="opacity" values={`${0.4+i*0.15};0;${0.4+i*0.15}`} dur={`${1+i*0.2}s`} repeatCount="indefinite"/>
        </circle>
      ))}
    </svg>
  );
}

export function LightningTrailIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <path d="M 6,24 L 18,24 L 14,32 L 26,32 L 20,40 L 32,40 L 28,48 L 38,48 L 48,30 L 38,30 L 42,22 L 30,22 L 34,14 L 6,24 Z"
            fill="#ffd700" opacity="0.85" stroke="#ff8800" strokeWidth="0.5">
        <animate attributeName="opacity" values="0.85;0.4;0.85" dur="0.6s" repeatCount="indefinite"/>
      </path>
      {/* Electric glow */}
      <path d="M 6,24 L 18,24 L 14,32 L 26,32 L 20,40 L 32,40 L 28,48 L 38,48 L 48,30 L 38,30 L 42,22 L 30,22 L 34,14 Z"
            fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.3">
        <animate attributeName="opacity" values="0.3;0;0.3" dur="0.6s" repeatCount="indefinite"/>
      </path>
    </svg>
  );
}

export function AuroraTrailIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {[
        { color:"#00e5ff", y:20, amp:6 },
        { color:"#b040ff", y:28, amp:8 },
        { color:"#00ff88", y:36, amp:5 },
      ].map(({ color, y, amp }, i) => (
        <path key={i}
          d={`M 6,${y} Q 20,${y-amp} 34,${y} Q 48,${y+amp} 54,${y}`}
          stroke={color} strokeWidth="2.5" fill="none" opacity="0.7" strokeLinecap="round">
          <animate attributeName="d"
            values={`M 6,${y} Q 20,${y-amp} 34,${y} Q 48,${y+amp} 54,${y};M 6,${y} Q 20,${y+amp} 34,${y} Q 48,${y-amp} 54,${y};M 6,${y} Q 20,${y-amp} 34,${y} Q 48,${y+amp} 54,${y}`}
            dur={`${3+i}s`} repeatCount="indefinite"/>
        </path>
      ))}
    </svg>
  );
}

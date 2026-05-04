// Charm icons — procedural SVG, rarity-tiered quality
type S = { size: number };

// ── LEGENDARY ─────────────────────────────────────────────────────────────────

export function DragonCharmIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="drg-head" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2d8a1a"/>
          <stop offset="100%" stopColor="#0a3a08"/>
        </linearGradient>
        <radialGradient id="drg-eye" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ffee44"/>
          <stop offset="100%" stopColor="#cc7700"/>
        </radialGradient>
      </defs>
      {/* Dragon head profile facing right */}
      <path d="M 8,34 Q 8,20 18,16 Q 30,12 38,18 Q 48,22 50,34 Q 48,42 40,44 Q 32,48 24,44 Q 14,42 8,34 Z"
            fill="url(#drg-head)" stroke="#1a5a10" strokeWidth="0.7"/>
      {/* Snout */}
      <path d="M 40,28 Q 54,26 56,32 Q 56,38 48,38 Q 44,38 40,36 Z" fill="#1f6614" stroke="#1a5a10" strokeWidth="0.5"/>
      {/* Nostril */}
      <ellipse cx="52" cy="31" rx="1.5" ry="1" fill="#0a2a08" transform="rotate(-10 52 31)"/>
      {/* Horn */}
      <path d="M 22,16 Q 18,8 22,4 Q 26,8 24,16 Z" fill="#1a6010" stroke="#0a3a08" strokeWidth="0.5"/>
      <path d="M 30,14 Q 28,6 32,4 Q 34,8 32,14 Z" fill="#1a6010" stroke="#0a3a08" strokeWidth="0.5"/>
      {/* Eye */}
      <ellipse cx="26" cy="26" rx="5" ry="5" fill="url(#drg-eye)"/>
      <ellipse cx="26" cy="26" rx="1.5" ry="4" fill="#1a0a00"/>
      <circle cx="24.5" cy="24.5" r="1" fill="white" opacity="0.4"/>
      {/* Eye glow */}
      <ellipse cx="26" cy="26" rx="5" ry="5" fill="none" stroke="#ffaa00" strokeWidth="0.5" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2s" repeatCount="indefinite"/>
      </ellipse>
      {/* Scales texture */}
      {[[16,30],[20,36],[28,38],[36,34],[44,30]].map(([cx,cy],i) => (
        <path key={i} d={`M ${cx-3},${cy} Q ${cx},${cy-3} ${cx+3},${cy}`} stroke="#2d8a1a" strokeWidth="0.7" fill="none" opacity="0.5"/>
      ))}
      {/* Smoke wisps */}
      <path d="M 52,28 Q 56,22 54,18 Q 58,16 56,12" stroke="#aaaaaa" strokeWidth="1.2" fill="none" opacity="0.4" strokeLinecap="round">
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.5s" repeatCount="indefinite"/>
      </path>
    </svg>
  );
}

export function PhoenixCharmIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="phx-body" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ff4400"/>
          <stop offset="50%" stopColor="#ff8800"/>
          <stop offset="100%" stopColor="#ffcc00"/>
        </linearGradient>
        <linearGradient id="phx-wing" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ff5500"/>
          <stop offset="100%" stopColor="#ffdd00" stopOpacity="0.3"/>
        </linearGradient>
        <filter id="phx-glow">
          <feGaussianBlur stdDeviation="1.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Flame tail */}
      <path d="M 30,42 Q 18,50 14,58 Q 22,54 30,50 Q 38,54 46,58 Q 42,50 30,42 Z"
            fill="url(#phx-body)" opacity="0.8" filter="url(#phx-glow)">
        <animate attributeName="opacity" values="0.8;0.4;0.8" dur="1.2s" repeatCount="indefinite"/>
      </path>
      {/* Left wing */}
      <path d="M 30,28 Q 14,20 6,10 Q 12,16 16,24 Q 10,20 8,28 Q 16,24 30,34 Z"
            fill="url(#phx-wing)"/>
      {/* Right wing */}
      <path d="M 30,28 Q 46,20 54,10 Q 48,16 44,24 Q 50,20 52,28 Q 44,24 30,34 Z"
            fill="url(#phx-wing)"/>
      {/* Body */}
      <ellipse cx="30" cy="30" rx="8" ry="12" fill="url(#phx-body)"/>
      {/* Head */}
      <circle cx="30" cy="18" r="6" fill="#ffcc00"/>
      {/* Beak */}
      <path d="M 30,15 L 34,18 L 30,21 Z" fill="#ff8800"/>
      {/* Eye */}
      <circle cx="28" cy="17" r="1.5" fill="#1a0800"/>
      <circle cx="27.5" cy="16.5" r="0.5" fill="white" opacity="0.6"/>
      {/* Crest feathers */}
      <path d="M 28,12 Q 26,6 28,2 Q 30,6 28,12" fill="#ffaa00" opacity="0.9"/>
      <path d="M 30,11 Q 30,5 32,2 Q 32,6 30,11" fill="#ff8800" opacity="0.8"/>
      {/* Body glow */}
      <ellipse cx="30" cy="30" rx="8" ry="12" fill="none" stroke="#ffaa00" strokeWidth="0.8" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="1.8s" repeatCount="indefinite"/>
      </ellipse>
    </svg>
  );
}

export function VoidOrbIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="orb-main" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#4a0080"/>
          <stop offset="50%" stopColor="#1a0040"/>
          <stop offset="100%" stopColor="#050010"/>
        </radialGradient>
        <radialGradient id="orb-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#6600cc" stopOpacity="0.4"/>
          <stop offset="100%" stopColor="#6600cc" stopOpacity="0"/>
        </radialGradient>
        <filter id="orb-blur">
          <feGaussianBlur stdDeviation="2"/>
        </filter>
      </defs>
      {/* Outer glow */}
      <circle cx="30" cy="30" r="26" fill="url(#orb-glow)">
        <animate attributeName="r" values="24;28;24" dur="3s" repeatCount="indefinite"/>
      </circle>
      {/* Main sphere */}
      <circle cx="30" cy="30" r="22" fill="url(#orb-main)" stroke="#7c3aed" strokeWidth="0.8"/>
      {/* Swirling void energy — 3 arcs */}
      <path d="M 18,22 Q 34,14 40,28 Q 44,38 34,42 Q 22,46 16,36 Q 12,26 18,22 Z"
            fill="none" stroke="#9333ea" strokeWidth="1.2" opacity="0.6">
        <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="8s" repeatCount="indefinite"/>
      </path>
      <path d="M 24,14 Q 42,20 42,34 Q 42,46 28,46 Q 16,46 14,34 Q 12,22 24,14 Z"
            fill="none" stroke="#a855f7" strokeWidth="0.8" opacity="0.4">
        <animateTransform attributeName="transform" type="rotate" from="360 30 30" to="0 30 30" dur="6s" repeatCount="indefinite"/>
      </path>
      {/* Highlight */}
      <ellipse cx="22" cy="22" rx="6" ry="4" fill="white" opacity="0.12" transform="rotate(-30 22 22)"/>
      {/* Core */}
      <circle cx="30" cy="30" r="4" fill="#c084fc" opacity="0.7">
        <animate attributeName="r" values="3;5;3" dur="2.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2.5s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

// ── EPIC ──────────────────────────────────────────────────────────────────────

export function AtomIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="atm-nucleus" cx="40%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#ff8844"/>
          <stop offset="100%" stopColor="#cc3300"/>
        </radialGradient>
      </defs>
      {/* Orbital ring 1 (horizontal tilt) */}
      <ellipse cx="30" cy="30" rx="24" ry="8" fill="none" stroke="#c060ff" strokeWidth="1.2" opacity="0.7"/>
      {/* Orbital ring 2 (60° tilt) */}
      <ellipse cx="30" cy="30" rx="24" ry="8" fill="none" stroke="#c060ff" strokeWidth="1.2" opacity="0.7"
               transform="rotate(60 30 30)"/>
      {/* Orbital ring 3 (120° tilt) */}
      <ellipse cx="30" cy="30" rx="24" ry="8" fill="none" stroke="#c060ff" strokeWidth="1.2" opacity="0.7"
               transform="rotate(120 30 30)"/>
      {/* Electrons */}
      <circle cx="54" cy="30" r="3" fill="#e0aaff">
        <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="3s" repeatCount="indefinite"/>
      </circle>
      <circle cx="54" cy="30" r="3" fill="#e0aaff" transform="rotate(60 30 30)">
        <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="4s" repeatCount="indefinite"/>
      </circle>
      <circle cx="54" cy="30" r="3" fill="#e0aaff" transform="rotate(120 30 30)">
        <animateTransform attributeName="transform" type="rotate" from="360 30 30" to="0 30 30" dur="3.5s" repeatCount="indefinite"/>
      </circle>
      {/* Nucleus */}
      <circle cx="30" cy="30" r="7" fill="url(#atm-nucleus)"/>
      <circle cx="27" cy="27" r="2.5" fill="#ff4400" opacity="0.8"/>
      <circle cx="32" cy="29" r="2" fill="#aaaaaa" opacity="0.8"/>
      <circle cx="29" cy="33" r="2" fill="#ff4400" opacity="0.7"/>
    </svg>
  );
}

export function CrystalCharmIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="crs-main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c084fc"/>
          <stop offset="50%" stopColor="#7c3aed"/>
          <stop offset="100%" stopColor="#3b0764"/>
        </linearGradient>
        <linearGradient id="crs-face" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e9d5ff"/>
          <stop offset="100%" stopColor="#a855f7"/>
        </linearGradient>
      </defs>
      {/* Crystal body (hexagonal prism side view) */}
      {/* Left face */}
      <path d="M 20,14 L 8,30 L 20,46 L 20,14 Z" fill="url(#crs-main)" opacity="0.7"/>
      {/* Right face */}
      <path d="M 40,14 L 52,30 L 40,46 L 40,14 Z" fill="url(#crs-main)" opacity="0.5"/>
      {/* Front face */}
      <path d="M 20,14 L 40,14 L 40,46 L 20,46 Z" fill="url(#crs-face)"/>
      {/* Top facet */}
      <path d="M 20,14 L 30,6 L 40,14 Z" fill="#e9d5ff"/>
      {/* Bottom point */}
      <path d="M 20,46 L 30,54 L 40,46 Z" fill="#7c3aed"/>
      {/* Internal light line */}
      <line x1="22" y1="16" x2="30" y2="30" stroke="white" strokeWidth="1" opacity="0.4"/>
      <line x1="22" y1="44" x2="30" y2="30" stroke="white" strokeWidth="0.6" opacity="0.2"/>
      {/* Prismatic reflection */}
      <path d="M 24,20 L 28,26 L 24,32" stroke="#ff88ff" strokeWidth="0.8" fill="none" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2s" repeatCount="indefinite"/>
      </path>
      <path d="M 32,28 L 36,22" stroke="#88ffff" strokeWidth="0.8" fill="none" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="2.8s" repeatCount="indefinite"/>
      </path>
    </svg>
  );
}

export function CrownCharmIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="crch-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffe566"/>
          <stop offset="100%" stopColor="#b8860b"/>
        </linearGradient>
      </defs>
      <path d="M 10,44 L 10,28 L 18,36 L 30,16 L 42,36 L 50,28 L 50,44 Z"
            fill="url(#crch-g)" stroke="#c8922a" strokeWidth="0.7"/>
      <rect x="9" y="43" width="42" height="7" rx="2" fill="url(#crch-g)" stroke="#a07010" strokeWidth="0.5"/>
      {/* Gems */}
      <circle cx="30" cy="19" r="3" fill="#ff4444">
        <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="13" cy="32" r="2" fill="#4488ff"/>
      <circle cx="47" cy="32" r="2" fill="#4488ff"/>
    </svg>
  );
}

// ── RARE ──────────────────────────────────────────────────────────────────────

export function DiamondIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="dmd-main" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a8e6ff"/>
          <stop offset="50%" stopColor="#60c0ff"/>
          <stop offset="100%" stopColor="#1a6090"/>
        </linearGradient>
      </defs>
      {/* Diamond: top flat, sides, point */}
      {/* Top facet */}
      <polygon points="18,24 30,14 42,24" fill="#d0f0ff" opacity="0.9"/>
      {/* Left upper */}
      <polygon points="10,32 18,24 30,24" fill="url(#dmd-main)" opacity="0.9"/>
      {/* Right upper */}
      <polygon points="50,32 42,24 30,24" fill="#5aafef" opacity="0.8"/>
      {/* Left lower */}
      <polygon points="10,32 30,24 30,46" fill="#2a8ac0" opacity="0.9"/>
      {/* Right lower */}
      <polygon points="50,32 30,24 30,46" fill="#60c0ff" opacity="0.7"/>
      {/* Pavilion point */}
      <polygon points="10,32 50,32 30,52" fill="#1a6090"/>
      {/* Internal highlights */}
      <line x1="18" y1="24" x2="30" y2="32" stroke="white" strokeWidth="0.8" opacity="0.35"/>
      <line x1="30" y1="14" x2="30" y2="46" stroke="white" strokeWidth="0.5" opacity="0.2"/>
      {/* Prismatic gleam */}
      <line x1="20" y1="28" x2="30" y2="24" stroke="#88ffff" strokeWidth="1" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0;0.5" dur="2.5s" repeatCount="indefinite"/>
      </line>
    </svg>
  );
}

export function KeyIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="key-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe566"/>
          <stop offset="100%" stopColor="#c8922a"/>
        </linearGradient>
      </defs>
      {/* Key ring (bow) */}
      <circle cx="22" cy="22" r="12" fill="none" stroke="url(#key-gold)" strokeWidth="4.5"/>
      <circle cx="22" cy="22" r="6" fill="none" stroke="url(#key-gold)" strokeWidth="2"/>
      {/* Key shaft */}
      <rect x="30" y="20" width="24" height="4.5" rx="2" fill="url(#key-gold)"/>
      {/* Key teeth */}
      <rect x="42" y="24.5" width="4" height="6" rx="1" fill="url(#key-gold)"/>
      <rect x="50" y="24.5" width="3" height="4" rx="1" fill="url(#key-gold)"/>
      {/* Inner ring highlight */}
      <circle cx="22" cy="22" r="12" fill="none" stroke="white" strokeWidth="0.8" opacity="0.2"/>
      {/* Gleam */}
      <path d="M 16,14 Q 18,12 22,14" stroke="white" strokeWidth="1" opacity="0.3" fill="none">
        <animate attributeName="opacity" values="0.2;0.5;0.2" dur="3s" repeatCount="indefinite"/>
      </path>
    </svg>
  );
}

export function TridentIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="trd-metal" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7ec8e3"/>
          <stop offset="100%" stopColor="#2a6080"/>
        </linearGradient>
      </defs>
      {/* Handle */}
      <rect x="28" y="24" width="4" height="32" rx="2" fill="url(#trd-metal)"/>
      {/* Center prong */}
      <path d="M 28,24 L 30,6 L 32,24 Z" fill="#a0e0f8"/>
      {/* Left prong */}
      <path d="M 18,28 L 20,10 L 26,22 Q 22,24 18,28 Z" fill="url(#trd-metal)"/>
      {/* Right prong */}
      <path d="M 42,28 L 40,10 L 34,22 Q 38,24 42,28 Z" fill="url(#trd-metal)"/>
      {/* Cross bar */}
      <rect x="16" y="22" width="28" height="3" rx="1.5" fill="#2a6080"/>
      {/* Electric tips */}
      <circle cx="20" cy="11" r="2" fill="#88eeff" opacity="0.8">
        <animate attributeName="r" values="1.5;2.5;1.5" dur="1.2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="30" cy="7" r="2" fill="#88eeff" opacity="0.9">
        <animate attributeName="r" values="1.5;2.5;1.5" dur="0.9s" repeatCount="indefinite"/>
      </circle>
      <circle cx="40" cy="11" r="2" fill="#88eeff" opacity="0.8">
        <animate attributeName="r" values="1.5;2.5;1.5" dur="1.1s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

export function SwordIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="swd-blade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d0e8f8"/>
          <stop offset="50%" stopColor="#f8f8f8"/>
          <stop offset="100%" stopColor="#8098b0"/>
        </linearGradient>
      </defs>
      {/* Blade */}
      <path d="M 28,8 L 30,8 L 34,44 L 30,46 L 26,44 Z" fill="url(#swd-blade)"/>
      {/* Blade edge */}
      <path d="M 30,8 L 34,44" stroke="white" strokeWidth="0.5" opacity="0.4"/>
      {/* Tip */}
      <path d="M 26,44 L 30,54 L 34,44 Z" fill="#a0b8c8"/>
      {/* Cross-guard */}
      <rect x="16" y="42" width="28" height="4" rx="2" fill="#c8a030" stroke="#906018" strokeWidth="0.5"/>
      <ellipse cx="16" cy="44" rx="3" ry="2" fill="#c8a030"/>
      <ellipse cx="44" cy="44" rx="3" ry="2" fill="#c8a030"/>
      {/* Handle */}
      <rect x="26" y="46" width="8" height="12" rx="2" fill="#6b3a1f"/>
      {[0,1,2].map(i => (
        <line key={i} x1="26" y1={47.5+i*3} x2="34" y2={47.5+i*3} stroke="#3a1a0a" strokeWidth="0.7" opacity="0.5"/>
      ))}
      {/* Pommel */}
      <ellipse cx="30" cy="58" rx="5" ry="2.5" fill="#c8a030"/>
      {/* Blade gleam */}
      <path d="M 29,12 L 30,40" stroke="white" strokeWidth="0.8" opacity="0.25">
        <animate attributeName="opacity" values="0.1;0.4;0.1" dur="3s" repeatCount="indefinite"/>
      </path>
    </svg>
  );
}

export function InfinityIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="inf-flow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4a9eff"/>
          <stop offset="50%" stopColor="#c060ff"/>
          <stop offset="100%" stopColor="#4a9eff"/>
        </linearGradient>
      </defs>
      {/* Infinity symbol — figure-8 path */}
      <path d="M 30,30 Q 22,18 14,22 Q 6,26 6,30 Q 6,34 14,38 Q 22,42 30,30 Q 38,18 46,22 Q 54,26 54,30 Q 54,34 46,38 Q 38,42 30,30 Z"
            fill="none" stroke="url(#inf-flow)" strokeWidth="4" strokeLinecap="round"/>
      {/* Animated energy particle */}
      <circle r="3" fill="#88ccff" opacity="0.9">
        <animateMotion dur="3s" repeatCount="indefinite"
          path="M 30,30 Q 22,18 14,22 Q 6,26 6,30 Q 6,34 14,38 Q 22,42 30,30 Q 38,18 46,22 Q 54,26 54,30 Q 54,34 46,38 Q 38,42 30,30 Z"/>
        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="3s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

export function HourglassIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="hgl-sand" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f0c040"/>
          <stop offset="100%" stopColor="#c07820"/>
        </linearGradient>
      </defs>
      {/* Frame top */}
      <rect x="14" y="8" width="32" height="4" rx="2" fill="#5a4030"/>
      {/* Frame bottom */}
      <rect x="14" y="48" width="32" height="4" rx="2" fill="#5a4030"/>
      {/* Frame sides */}
      <line x1="16" y1="12" x2="30" y2="30" stroke="#5a4030" strokeWidth="2"/>
      <line x1="44" y1="12" x2="30" y2="30" stroke="#5a4030" strokeWidth="2"/>
      <line x1="16" y1="48" x2="30" y2="30" stroke="#5a4030" strokeWidth="2"/>
      <line x1="44" y1="48" x2="30" y2="30" stroke="#5a4030" strokeWidth="2"/>
      {/* Upper glass chamber */}
      <path d="M 16,12 L 30,30 L 44,12 Z" fill="#c0a830" opacity="0.3"/>
      {/* Sand in upper (decreasing) */}
      <path d="M 18,12 L 30,28 L 42,12 Z" fill="url(#hgl-sand)" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="2s" repeatCount="indefinite"/>
      </path>
      {/* Lower glass chamber */}
      <path d="M 16,48 L 30,30 L 44,48 Z" fill="#a08020" opacity="0.2"/>
      {/* Sand in lower (increasing) */}
      <path d="M 24,48 L 30,36 L 36,48 Z" fill="url(#hgl-sand)" opacity="0.9"/>
      {/* Falling sand particle */}
      <circle cx="30" cy="30" r="1.5" fill="#f0c040" opacity="0.8">
        <animate attributeName="cy" values="28;34;28" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="1.5s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

export function CompassIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="cmp-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#1a2a4a"/>
          <stop offset="100%" stopColor="#0a1428"/>
        </radialGradient>
      </defs>
      {/* Outer ring */}
      <circle cx="30" cy="30" r="24" fill="url(#cmp-bg)" stroke="#c8a030" strokeWidth="2"/>
      {/* Cardinal marks */}
      {[0,90,180,270].map(a => (
        <rect key={a} x="29" y="8" width="2" height="4" rx="1" fill="#c8a030" transform={`rotate(${a} 30 30)`}/>
      ))}
      {/* Rose points */}
      {[0,45,90,135,180,225,270,315].map(a => (
        <line key={a} x1="30" y1="14" x2="30" y2="18" stroke="#5a4820" strokeWidth="1"
              transform={`rotate(${a} 30 30)`}/>
      ))}
      {/* N label */}
      <text x="30" y="17" textAnchor="middle" fill="#ff4444" fontSize="5" fontWeight="bold" fontFamily="monospace">N</text>
      {/* Needle (red = N, white = S) */}
      <path d="M 30,30 L 26,18 L 30,22 L 34,18 Z" fill="#ff4444">
        <animateTransform attributeName="transform" type="rotate" values="0 30 30;8 30 30;-4 30 30;0 30 30" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>
      </path>
      <path d="M 30,30 L 26,42 L 30,38 L 34,42 Z" fill="#e0e0e0">
        <animateTransform attributeName="transform" type="rotate" values="0 30 30;8 30 30;-4 30 30;0 30 30" dur="4s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>
      </path>
      {/* Center pin */}
      <circle cx="30" cy="30" r="2.5" fill="#c8a030"/>
    </svg>
  );
}

export function SpiralIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="spl-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4a9eff"/>
          <stop offset="100%" stopColor="#c060ff"/>
        </linearGradient>
      </defs>
      {/* Nautilus-like spiral using nested arcs */}
      <path d="M 30,30 Q 30,14 38,14 Q 48,14 48,24 Q 48,36 36,40 Q 24,44 16,34 Q 8,24 14,14 Q 20,6 30,8"
            fill="none" stroke="url(#spl-g)" strokeWidth="3.5" strokeLinecap="round">
        <animate attributeName="strokeDasharray" values="0 200;200 0" dur="3s" repeatCount="indefinite"/>
      </path>
      <circle cx="30" cy="30" r="3" fill="#c060ff">
        <animate attributeName="r" values="2;4;2" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

export function RuneIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <filter id="run-glow">
          <feGaussianBlur stdDeviation="1.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Stone background */}
      <rect x="12" y="8" width="36" height="44" rx="3" fill="#2a2a3a" stroke="#4a4a6a" strokeWidth="1"/>
      {/* Algiz rune (protection/life) */}
      <line x1="30" y1="14" x2="30" y2="50" stroke="#8888ff" strokeWidth="2.5" filter="url(#run-glow)">
        <animate attributeName="opacity" values="1;0.5;1" dur="2.5s" repeatCount="indefinite"/>
      </line>
      <line x1="30" y1="26" x2="18" y2="38" stroke="#8888ff" strokeWidth="2.5" filter="url(#run-glow)">
        <animate attributeName="opacity" values="1;0.5;1" dur="2.5s" repeatCount="indefinite"/>
      </line>
      <line x1="30" y1="26" x2="42" y2="38" stroke="#8888ff" strokeWidth="2.5" filter="url(#run-glow)">
        <animate attributeName="opacity" values="1;0.5;1" dur="2.5s" repeatCount="indefinite"/>
      </line>
      {/* Corner notches (stone carving feel) */}
      <line x1="12" y1="14" x2="18" y2="14" stroke="#6060aa" strokeWidth="1" opacity="0.5"/>
      <line x1="42" y1="14" x2="48" y2="14" stroke="#6060aa" strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}

// ── UNCOMMON ──────────────────────────────────────────────────────────────────

export function SkullIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* Skull cranium */}
      <path d="M 14,38 Q 10,26 14,18 Q 18,8 30,8 Q 42,8 46,18 Q 50,26 46,38 Z"
            fill="#e8e0d0" stroke="#a09080" strokeWidth="0.8"/>
      {/* Cheekbones */}
      <path d="M 14,38 Q 16,44 22,46 L 38,46 Q 44,44 46,38" fill="#d8d0c0" stroke="#a09080" strokeWidth="0.5"/>
      {/* Jaw teeth area */}
      <rect x="20" y="44" width="20" height="5" rx="1" fill="#c8c0b0"/>
      {[22,26,30,34,38].map(x => (
        <rect key={x} x={x} y="44" width="2" height="5" fill="#b8b0a0" rx="0.5"/>
      ))}
      {/* Eye sockets */}
      <ellipse cx="22" cy="28" rx="6" ry="7" fill="#1a1a2a"/>
      <ellipse cx="38" cy="28" rx="6" ry="7" fill="#1a1a2a"/>
      {/* Eye socket glow */}
      <ellipse cx="22" cy="28" rx="4" ry="5" fill="#330066" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="38" cy="28" rx="4" ry="5" fill="#330066" opacity="0.6">
        <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2.3s" repeatCount="indefinite"/>
      </ellipse>
      {/* Nose cavity */}
      <path d="M 27,36 L 30,32 L 33,36 Q 30,38 27,36 Z" fill="#1a1a2a"/>
      {/* Skull crack */}
      <path d="M 30,10 Q 32,16 30,20 Q 28,24 30,28" stroke="#a09080" strokeWidth="0.8" fill="none" opacity="0.4"/>
    </svg>
  );
}

export function MoonIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="mon-g" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fffde7"/>
          <stop offset="100%" stopColor="#f0c820"/>
        </radialGradient>
      </defs>
      {/* Crescent moon */}
      <path d="M 38,10 Q 52,20 52,30 Q 52,42 38,50 Q 48,46 50,36 Q 54,22 38,10 Z" fill="url(#mon-g)"/>
      <circle cx="36" cy="30" r="18" fill="#120d20"/>
      {/* Stars around */}
      {[[12,14],[8,30],[14,46],[48,12],[52,46]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="1.5" fill="#fffde7" opacity="0.7">
          <animate attributeName="opacity" values="0.7;0.2;0.7" dur={`${1.5+i*0.4}s`} repeatCount="indefinite"/>
        </circle>
      ))}
    </svg>
  );
}

export function CubeIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* Isometric cube */}
      {/* Top face */}
      <path d="M 30,10 L 50,20 L 30,30 L 10,20 Z" fill="#88aaff"/>
      {/* Left face */}
      <path d="M 10,20 L 30,30 L 30,50 L 10,40 Z" fill="#4466cc"/>
      {/* Right face */}
      <path d="M 50,20 L 30,30 L 30,50 L 50,40 Z" fill="#6688ee"/>
      {/* Edges */}
      <path d="M 30,10 L 50,20 L 30,30 L 10,20 Z" fill="none" stroke="#aaccff" strokeWidth="0.8" opacity="0.6"/>
      <line x1="30" y1="30" x2="30" y2="50" stroke="#aaccff" strokeWidth="0.8" opacity="0.4"/>
      <line x1="10" y1="20" x2="10" y2="40" stroke="#aaccff" strokeWidth="0.8" opacity="0.4"/>
      <line x1="50" y1="20" x2="50" y2="40" stroke="#aaccff" strokeWidth="0.8" opacity="0.4"/>
    </svg>
  );
}

export function ShieldIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="shd-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a6090"/>
          <stop offset="100%" stopColor="#1a2840"/>
        </linearGradient>
      </defs>
      {/* Shield body */}
      <path d="M 10,12 L 50,12 L 50,36 Q 50,50 30,54 Q 10,50 10,36 Z" fill="url(#shd-g)" stroke="#6a80a8" strokeWidth="1"/>
      {/* Shield boss (center emblem) */}
      <circle cx="30" cy="32" r="8" fill="#6a80a8" stroke="#8aa0c0" strokeWidth="0.7"/>
      <circle cx="30" cy="32" r="4" fill="#8aa0c0"/>
      {/* Dividing cross */}
      <line x1="30" y1="14" x2="30" y2="54" stroke="#6a80a8" strokeWidth="1.5" opacity="0.5"/>
      <line x1="12" y1="30" x2="48" y2="30" stroke="#6a80a8" strokeWidth="1.5" opacity="0.5"/>
      {/* Border trim */}
      <path d="M 10,12 L 50,12 L 50,36 Q 50,50 30,54 Q 10,50 10,36 Z" fill="none" stroke="#8aa0c0" strokeWidth="0.5"/>
      <path d="M 12,14 L 48,14 L 48,36 Q 48,48 30,52 Q 12,48 12,36 Z" fill="none" stroke="#4a6090" strokeWidth="0.5" opacity="0.4"/>
    </svg>
  );
}

export function SnowflakeIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* 6 main arms */}
      {[0,60,120,180,240,300].map(a => (
        <g key={a} transform={`rotate(${a} 30 30)`}>
          <line x1="30" y1="8" x2="30" y2="52" stroke="#a8d8f8" strokeWidth="2"/>
          {/* Branch arms */}
          <line x1="30" y1="18" x2="22" y2="14" stroke="#a8d8f8" strokeWidth="1.2"/>
          <line x1="30" y1="18" x2="38" y2="14" stroke="#a8d8f8" strokeWidth="1.2"/>
          <line x1="30" y1="28" x2="20" y2="24" stroke="#a8d8f8" strokeWidth="1.2"/>
          <line x1="30" y1="28" x2="40" y2="24" stroke="#a8d8f8" strokeWidth="1.2"/>
        </g>
      ))}
      {/* Center */}
      <circle cx="30" cy="30" r="4" fill="#d0f0ff" stroke="#7ec8f0" strokeWidth="0.8"/>
      {/* Tip sparkles */}
      <circle cx="30" cy="9" r="1.8" fill="white" opacity="0.8">
        <animate attributeName="opacity" values="0.8;0.3;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

export function GearIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="ger-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8898a8"/>
          <stop offset="100%" stopColor="#4a5a68"/>
        </linearGradient>
      </defs>
      {/* Gear teeth (8 teeth) */}
      {[0,45,90,135,180,225,270,315].map(a => (
        <rect key={a} x="27" y="6" width="6" height="9" rx="1.5" fill="url(#ger-g)"
              transform={`rotate(${a} 30 30)`}/>
      ))}
      {/* Gear body */}
      <circle cx="30" cy="30" r="18" fill="url(#ger-g)" stroke="#6a7a88" strokeWidth="0.8"/>
      {/* Inner ring */}
      <circle cx="30" cy="30" r="10" fill="#2a3a48" stroke="#5a6a78" strokeWidth="1"/>
      {/* Hub */}
      <circle cx="30" cy="30" r="4" fill="#3a4a58"/>
      {/* Rotation animation */}
      <animateTransform attributeName="transform" type="rotate"
        from="0 30 30" to="360 30 30" dur="8s" repeatCount="indefinite"/>
    </svg>
  );
}

export function CrossIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="crs2-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#d0d8e8"/>
          <stop offset="100%" stopColor="#8090a8"/>
        </linearGradient>
      </defs>
      {/* Vertical beam */}
      <rect x="24" y="8" width="12" height="44" rx="3" fill="url(#crs2-g)"/>
      {/* Horizontal beam */}
      <rect x="10" y="20" width="40" height="12" rx="3" fill="url(#crs2-g)"/>
      {/* Highlight */}
      <rect x="26" y="10" width="4" height="40" rx="2" fill="white" opacity="0.15"/>
      <rect x="12" y="22" width="36" height="4" rx="2" fill="white" opacity="0.15"/>
    </svg>
  );
}

export function FeatherIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="fth-g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c8e8d0"/>
          <stop offset="100%" stopColor="#4a8a58"/>
        </linearGradient>
      </defs>
      {/* Quill shaft */}
      <line x1="14" y1="48" x2="46" y2="10" stroke="#8ab890" strokeWidth="1.5"/>
      {/* Feather body — left vanes */}
      {[0,1,2,3,4,5,6].map(i => (
        <path key={i}
          d={`M ${14+i*4.5},${48-i*5.5} Q ${14+i*4.5-8},${48-i*5.5-6} ${14+i*4.5+3},${48-i*5.5-8}`}
          stroke="url(#fth-g)" strokeWidth="1.5" fill="none" opacity={0.9-i*0.08}/>
      ))}
      {/* Right vanes */}
      {[0,1,2,3,4,5,6].map(i => (
        <path key={i}
          d={`M ${14+i*4.5},${48-i*5.5} Q ${14+i*4.5+8},${48-i*5.5-6} ${14+i*4.5+3},${48-i*5.5-8}`}
          stroke="url(#fth-g)" strokeWidth="1.5" fill="none" opacity={0.8-i*0.08}/>
      ))}
      {/* Quill tip glow */}
      <circle cx="46" cy="10" r="1.5" fill="#a0d8a8" opacity="0.7"/>
    </svg>
  );
}

export function CloverIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* Four leaves */}
      {[[30,18],[30,42],[18,30],[42,30]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="12" fill="#2d8a1a" opacity="0.85"/>
      ))}
      {/* Leaf highlights */}
      {[[26,14],[26,38],[14,26],[38,26]].map(([cx,cy],i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="4" ry="3" fill="#44b830" opacity="0.4"/>
      ))}
      {/* Center */}
      <circle cx="30" cy="30" r="5" fill="#1a6010"/>
      {/* Stem */}
      <path d="M 30,42 Q 28,50 26,54" stroke="#1a6010" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

export function AnchorIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="anc-g" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6080a0"/>
          <stop offset="100%" stopColor="#2a3a50"/>
        </linearGradient>
      </defs>
      {/* Ring at top */}
      <circle cx="30" cy="12" r="6" fill="none" stroke="url(#anc-g)" strokeWidth="3"/>
      {/* Vertical shaft */}
      <rect x="28.5" y="16" width="3" height="28" rx="1.5" fill="url(#anc-g)"/>
      {/* Crossbar */}
      <rect x="10" y="20" width="40" height="3.5" rx="1.75" fill="url(#anc-g)"/>
      {/* Flukes (curved arms) */}
      <path d="M 30,44 Q 14,44 12,52 Q 16,56 22,52 Q 22,46 30,44 Z" fill="url(#anc-g)"/>
      <path d="M 30,44 Q 46,44 48,52 Q 44,56 38,52 Q 38,46 30,44 Z" fill="url(#anc-g)"/>
      {/* Bottom ball */}
      <circle cx="30" cy="44" r="3" fill="url(#anc-g)"/>
      {/* Highlight */}
      <line x1="30" y1="18" x2="30" y2="42" stroke="white" strokeWidth="0.8" opacity="0.15"/>
    </svg>
  );
}

// ── COMMON ────────────────────────────────────────────────────────────────────

export function StarIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <polygon points="30,8 34,24 50,24 37,34 41,50 30,41 19,50 23,34 10,24 26,24"
               fill="#ffd700" stroke="#c8a000" strokeWidth="0.7"/>
      <polygon points="30,14 33,24 44,24 36,30 38,42 30,36 22,42 24,30 16,24 27,24"
               fill="#ffe566" opacity="0.6"/>
    </svg>
  );
}

export function BoltIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <polygon points="36,6 20,32 30,32 24,54 44,26 33,26" fill="#ffd700" stroke="#c8a000" strokeWidth="0.5"/>
      <polygon points="36,10 22,32 30,32 26,50 42,28 33,28" fill="#ffe566" opacity="0.5"/>
    </svg>
  );
}

export function FireCharmIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="fir-g" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ff4400"/>
          <stop offset="50%" stopColor="#ff8800"/>
          <stop offset="100%" stopColor="#ffee00" stopOpacity="0.3"/>
        </linearGradient>
      </defs>
      <path d="M 30,52 Q 14,44 14,30 Q 14,20 22,14 Q 18,22 24,26 Q 20,14 30,8 Q 28,18 34,22 Q 30,14 40,16 Q 46,20 46,30 Q 46,44 30,52 Z"
            fill="url(#fir-g)">
        <animate attributeName="opacity" values="1;0.7;1" dur="1.2s" repeatCount="indefinite"/>
      </path>
    </svg>
  );
}

export function EyeIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* Eye outline */}
      <path d="M 6,30 Q 18,14 30,14 Q 42,14 54,30 Q 42,46 30,46 Q 18,46 6,30 Z"
            fill="#1a0a2e" stroke="#8888cc" strokeWidth="1"/>
      {/* Iris */}
      <circle cx="30" cy="30" r="10" fill="#4466cc"/>
      <circle cx="30" cy="30" r="10" fill="#6688ee" opacity="0.5"/>
      {/* Pupil */}
      <ellipse cx="30" cy="30" rx="4" ry="8" fill="#0a0416"/>
      {/* Highlight */}
      <circle cx="26" cy="25" r="3" fill="white" opacity="0.35"/>
      <circle cx="34" cy="32" r="1.5" fill="white" opacity="0.2"/>
      {/* Subtle glow */}
      <circle cx="30" cy="30" r="10" fill="none" stroke="#8888ff" strokeWidth="0.8" opacity="0.4">
        <animate attributeName="opacity" values="0.4;0.1;0.4" dur="3s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

export function HeartIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="hrt-g" cx="40%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#ff88aa"/>
          <stop offset="100%" stopColor="#cc0044"/>
        </radialGradient>
      </defs>
      <path d="M 30,48 Q 10,36 10,22 Q 10,10 20,10 Q 26,10 30,18 Q 34,10 40,10 Q 50,10 50,22 Q 50,36 30,48 Z"
            fill="url(#hrt-g)" stroke="#aa0033" strokeWidth="0.5"/>
      {/* Highlight */}
      <path d="M 20,14 Q 22,10 28,14" stroke="white" strokeWidth="1.5" fill="none" opacity="0.3"/>
    </svg>
  );
}

export function ArrowIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* Arrow pointing right */}
      <path d="M 8,26 L 36,26 L 36,18 L 52,30 L 36,42 L 36,34 L 8,34 Z"
            fill="#4a9eff" stroke="#2a6acc" strokeWidth="0.7"/>
      <path d="M 10,28 L 36,28 L 36,22 L 48,30 L 36,38 L 36,32 L 10,32 Z"
            fill="#88bbff" opacity="0.4"/>
    </svg>
  );
}

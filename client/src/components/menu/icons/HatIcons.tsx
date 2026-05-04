// Hat icons — procedural SVG, rarity-tiered quality
// viewBox: 0 0 60 60 throughout

type S = { size: number };

// ── MYTHIC ────────────────────────────────────────────────────────────────────

export function DarkCrownIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="dci-aura" cx="50%" cy="60%" r="50%">
          <stop offset="0%" stopColor="#3b0764" stopOpacity="0.7"/>
          <stop offset="100%" stopColor="#0d0618" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="dci-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4c1d95"/>
          <stop offset="100%" stopColor="#12052a"/>
        </linearGradient>
        <filter id="dci-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="1.5" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Void aura */}
      <ellipse cx="30" cy="44" rx="22" ry="10" fill="url(#dci-aura)">
        <animate attributeName="ry" values="9;12;9" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;1;0.7" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      {/* Crown — 7 jagged spikes */}
      <path d="M 7,46 L 7,32 L 13,40 L 17,22 L 21,34 L 30,10 L 39,34 L 43,22 L 47,40 L 53,32 L 53,46 Z"
            fill="url(#dci-body)" stroke="#7c3aed" strokeWidth="0.8"/>
      {/* Band */}
      <rect x="6" y="44" width="48" height="8" rx="2" fill="#1e0533" stroke="#6d28d9" strokeWidth="0.7"/>
      {/* Center void gem */}
      <circle cx="30" cy="13" r="4" fill="#c084fc" filter="url(#dci-glow)">
        <animate attributeName="opacity" values="1;0.2;1" dur="1.6s" repeatCount="indefinite"/>
      </circle>
      {/* Side void gems */}
      <circle cx="17" cy="25" r="2.8" fill="#7c3aed" filter="url(#dci-glow)">
        <animate attributeName="opacity" values="0.9;0.1;0.9" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="43" cy="25" r="2.8" fill="#7c3aed" filter="url(#dci-glow)">
        <animate attributeName="opacity" values="0.9;0.1;0.9" dur="2.3s" repeatCount="indefinite"/>
      </circle>
      {/* Crackling arcs */}
      <polyline points="13,40 17,32 21,34" stroke="#c084fc" strokeWidth="0.7" fill="none" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0;0.7" dur="0.9s" repeatCount="indefinite"/>
      </polyline>
      <polyline points="47,40 43,32 39,34" stroke="#c084fc" strokeWidth="0.7" fill="none" opacity="0.7">
        <animate attributeName="opacity" values="0.7;0;0.7" dur="1.1s" repeatCount="indefinite"/>
      </polyline>
      <line x1="21" y1="34" x2="30" y2="26" stroke="#a855f7" strokeWidth="0.5" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0;0.5" dur="0.7s" repeatCount="indefinite"/>
      </line>
      <line x1="39" y1="34" x2="30" y2="26" stroke="#a855f7" strokeWidth="0.5" opacity="0.5">
        <animate attributeName="opacity" values="0.5;0;0.5" dur="0.8s" repeatCount="indefinite"/>
      </line>
    </svg>
  );
}

export function SantaIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="snt-pompom" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffffff"/>
          <stop offset="100%" stopColor="#d0d0d0"/>
        </radialGradient>
      </defs>
      {/* Hat cone */}
      <path d="M 20,48 L 30,10 L 40,48 Z" fill="#dc2626"/>
      <path d="M 20,48 Q 30,42 40,48" fill="#cc2020"/>
      {/* White brim */}
      <ellipse cx="30" cy="48" rx="14" ry="4.5" fill="white" opacity="0.95"/>
      {/* Pompom */}
      <circle cx="30" cy="10" r="5.5" fill="url(#snt-pompom)">
        <animate attributeName="r" values="5.5;6.5;5.5" dur="2s" repeatCount="indefinite"/>
      </circle>
      {/* Hat highlight */}
      <path d="M 26,42 Q 28,26 30,10" stroke="white" strokeWidth="1.5" opacity="0.2" fill="none"/>
      {/* Falling snowflakes */}
      <circle cx="14" cy="22" r="1.5" fill="white" opacity="0.8">
        <animateTransform attributeName="transform" type="translate" values="0,0;2,10;0,0" dur="2.2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="46" cy="28" r="1.2" fill="white" opacity="0.7">
        <animateTransform attributeName="transform" type="translate" values="0,0;-2,8;0,0" dur="1.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="10" cy="36" r="1" fill="white" opacity="0.6">
        <animateTransform attributeName="transform" type="translate" values="0,0;3,7;0,0" dur="2.6s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.6;0.1;0.6" dur="2.6s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

// ── LEGENDARY ─────────────────────────────────────────────────────────────────

export function CrownIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="crn-gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffe566"/>
          <stop offset="45%" stopColor="#f0b540"/>
          <stop offset="100%" stopColor="#92600a"/>
        </linearGradient>
        <radialGradient id="crn-ruby" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#ff8888"/>
          <stop offset="100%" stopColor="#7f0000"/>
        </radialGradient>
        <radialGradient id="crn-sapphire" cx="40%" cy="30%" r="60%">
          <stop offset="0%" stopColor="#88aaff"/>
          <stop offset="100%" stopColor="#00008b"/>
        </radialGradient>
      </defs>
      {/* Crown body */}
      <path d="M 8,46 L 8,28 L 17,38 L 23,20 L 30,12 L 37,20 L 43,38 L 52,28 L 52,46 Z"
            fill="url(#crn-gold)" stroke="#c8922a" strokeWidth="0.6"/>
      {/* Band */}
      <rect x="7" y="44" width="46" height="8" rx="2" fill="url(#crn-gold)" stroke="#a07010" strokeWidth="0.5"/>
      {/* Band gem line */}
      <rect x="10" y="46" width="40" height="2" rx="1" fill="white" opacity="0.12"/>
      {/* Center ruby */}
      <ellipse cx="30" cy="15" rx="4.5" ry="3.5" fill="url(#crn-ruby)">
        <animate attributeName="opacity" values="1;0.55;1" dur="2.4s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="28.5" cy="13.5" rx="1.5" ry="1" fill="white" opacity="0.35"/>
      {/* Side sapphires */}
      <ellipse cx="12" cy="32" rx="3" ry="2.2" fill="url(#crn-sapphire)">
        <animate attributeName="opacity" values="1;0.4;1" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      <ellipse cx="48" cy="32" rx="3" ry="2.2" fill="url(#crn-sapphire)">
        <animate attributeName="opacity" values="1;0.4;1" dur="2.7s" repeatCount="indefinite"/>
      </ellipse>
      {/* Gold sheen line */}
      <path d="M 10,44 L 50,44" stroke="white" strokeWidth="1" opacity="0.18"/>
    </svg>
  );
}

export function PharaohIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="pha-gold" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f0b540"/>
          <stop offset="50%" stopColor="#ffe066"/>
          <stop offset="100%" stopColor="#f0b540"/>
        </linearGradient>
      </defs>
      {/* Left lappet (hanging cloth) */}
      <path d="M 14,26 L 8,52 L 24,52 L 26,26 Z" fill="#1a5276"/>
      {/* Right lappet */}
      <path d="M 46,26 L 52,52 L 36,52 L 34,26 Z" fill="#1a5276"/>
      {/* Top dome */}
      <path d="M 14,26 Q 14,8 30,8 Q 46,8 46,26 Z" fill="#c9a227"/>
      {/* Gold stripes on lappets */}
      {[30,36,42,48].map((y, i) => (
        <g key={i}>
          <line x1="9" y1={y} x2="23" y2={y} stroke="url(#pha-gold)" strokeWidth="2"/>
          <line x1="37" y1={y} x2="51" y2={y} stroke="url(#pha-gold)" strokeWidth="2"/>
        </g>
      ))}
      {/* Front cloth piece */}
      <path d="M 26,26 L 34,26 L 32,48 L 28,48 Z" fill="#c9a227" opacity="0.9"/>
      {/* Gold trim on dome */}
      <path d="M 14,26 Q 14,8 30,8 Q 46,8 46,26" stroke="#ffe066" strokeWidth="1.5" fill="none"/>
      {/* Uraeus cobra head */}
      <ellipse cx="30" cy="13" rx="3" ry="4" fill="#e8a020"/>
      <path d="M 27,10 Q 30,6 33,10" fill="#c07010" stroke="none"/>
      {/* Cobra eye */}
      <circle cx="29" cy="12" r="0.8" fill="#1a0a00"/>
      {/* Gem on forehead */}
      <ellipse cx="30" cy="18" rx="2.5" ry="1.8" fill="#e74c3c">
        <animate attributeName="opacity" values="1;0.5;1" dur="3s" repeatCount="indefinite"/>
      </ellipse>
    </svg>
  );
}

export function SamuraiIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="sam-steel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9baab8"/>
          <stop offset="40%" stopColor="#dde6ef"/>
          <stop offset="100%" stopColor="#6a7f90"/>
        </linearGradient>
        <linearGradient id="sam-dark" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4a5568"/>
          <stop offset="100%" stopColor="#1a202c"/>
        </linearGradient>
      </defs>
      {/* Neck guard plates (shikoro) */}
      <path d="M 10,44 Q 30,50 50,44 L 52,52 Q 30,58 8,52 Z" fill="url(#sam-dark)" stroke="#4a5568" strokeWidth="0.5"/>
      <path d="M 12,40 Q 30,46 48,40 L 50,44 Q 30,50 10,44 Z" fill="url(#sam-steel)" opacity="0.7"/>
      {/* Helmet dome */}
      <path d="M 12,40 Q 12,14 30,12 Q 48,14 48,40 Z" fill="url(#sam-steel)"/>
      {/* Dome rivets */}
      {[[18,22],[30,14],[42,22],[18,32],[42,32]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="1.5" fill="#4a5568" stroke="#9baab8" strokeWidth="0.4"/>
      ))}
      {/* Brow guard */}
      <rect x="10" y="38" width="40" height="5" rx="2" fill="url(#sam-dark)" stroke="#718096" strokeWidth="0.5"/>
      {/* Kuwagata (antler) left */}
      <path d="M 16,26 Q 8,18 12,10 Q 16,6 18,14 Q 20,20 16,26" fill="#c9a227" stroke="#a07010" strokeWidth="0.5"/>
      {/* Kuwagata right */}
      <path d="M 44,26 Q 52,18 48,10 Q 44,6 42,14 Q 40,20 44,26" fill="#c9a227" stroke="#a07010" strokeWidth="0.5"/>
      {/* Steel gleam */}
      <path d="M 22,14 Q 28,12 34,14" stroke="white" strokeWidth="1.5" opacity="0.3" fill="none">
        <animate attributeName="opacity" values="0.1;0.4;0.1" dur="3s" repeatCount="indefinite"/>
      </path>
      {/* Eye slit suggestion */}
      <rect x="18" y="36" width="24" height="2" rx="1" fill="#0d1117" opacity="0.6"/>
    </svg>
  );
}

export function FireCrownIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="fcr-gold" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffd060"/>
          <stop offset="100%" stopColor="#8b5a00"/>
        </linearGradient>
        <linearGradient id="fcr-flame1" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ff6600"/>
          <stop offset="60%" stopColor="#ffaa00"/>
          <stop offset="100%" stopColor="#ffee88" stopOpacity="0"/>
        </linearGradient>
        <linearGradient id="fcr-flame2" x1="0%" y1="100%" x2="10%" y2="0%">
          <stop offset="0%" stopColor="#ff4400"/>
          <stop offset="100%" stopColor="#ffcc00" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {/* Flames above crown */}
      <path d="M 30,10 Q 26,4 28,0 Q 32,-2 32,4 Q 34,-4 36,2 Q 38,-2 36,6 Q 38,2 40,8 Q 36,6 30,10 Z"
            fill="url(#fcr-flame1)">
        <animateTransform attributeName="transform" type="scale" values="1 1;1.05 1.1;0.97 0.95;1 1"
          additive="sum" dur="0.8s" repeatCount="indefinite"
          calcMode="spline" keySplines="0.4 0 0.6 1;0.4 0 0.6 1;0.4 0 0.6 1"/>
      </path>
      <path d="M 22,22 Q 18,14 20,8 Q 24,6 22,14 Q 26,8 24,18 Q 22,14 22,22 Z"
            fill="url(#fcr-flame2)" opacity="0.8">
        <animateTransform attributeName="transform" type="scale" values="1 1;1.08 1.12;0.95 0.98;1 1"
          additive="sum" dur="1.1s" repeatCount="indefinite"/>
      </path>
      <path d="M 38,22 Q 42,14 40,8 Q 36,6 38,14 Q 34,8 36,18 Q 38,14 38,22 Z"
            fill="url(#fcr-flame2)" opacity="0.8">
        <animateTransform attributeName="transform" type="scale" values="1 1;0.95 1.1;1.08 0.96;1 1"
          additive="sum" dur="0.9s" repeatCount="indefinite"/>
      </path>
      {/* Crown body */}
      <path d="M 8,46 L 8,30 L 16,38 L 22,22 L 30,14 L 38,22 L 44,38 L 52,30 L 52,46 Z"
            fill="url(#fcr-gold)" stroke="#e08000" strokeWidth="0.7"/>
      {/* Band */}
      <rect x="7" y="44" width="46" height="8" rx="2" fill="url(#fcr-gold)"/>
      {/* Ember dots */}
      <circle cx="30" cy="17" r="2.5" fill="#ffee44" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.3;0.9" dur="1.2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

export function PlagueIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="plg-goggle" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#a0c020"/>
          <stop offset="100%" stopColor="#2a4a00"/>
        </radialGradient>
        <radialGradient id="plg-goggle2" cx="40%" cy="35%" r="60%">
          <stop offset="0%" stopColor="#80b010"/>
          <stop offset="100%" stopColor="#1a3800"/>
        </radialGradient>
      </defs>
      {/* Hat top — wide brimmed */}
      <ellipse cx="30" cy="12" rx="22" ry="6" fill="#2d1f0e"/>
      <rect x="10" y="6" width="40" height="8" fill="#1a1008" rx="1"/>
      {/* Brim shadow */}
      <ellipse cx="30" cy="14" rx="22" ry="3" fill="#0e0804" opacity="0.6"/>
      {/* Face/mask oval */}
      <ellipse cx="30" cy="36" rx="16" ry="18" fill="#3d2b1a"/>
      {/* Beak — long pointed */}
      <path d="M 22,40 L 18,56 L 30,52 L 42,56 L 38,40 Z" fill="#2a1e0c"/>
      <path d="M 24,42 L 20,52 Q 30,50 40,52 L 36,42 Z" fill="#3a2810" opacity="0.7"/>
      {/* Nostril holes on beak */}
      <circle cx="27" cy="48" r="1.5" fill="#1a0e04"/>
      <circle cx="33" cy="48" r="1.5" fill="#1a0e04"/>
      {/* Goggle left */}
      <circle cx="22" cy="30" r="7" fill="#1a0e04" stroke="#5a3a20" strokeWidth="1.5"/>
      <circle cx="22" cy="30" r="5.5" fill="url(#plg-goggle)">
        <animate attributeName="opacity" values="1;0.5;1" dur="2.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="20" cy="28" r="1.5" fill="white" opacity="0.25"/>
      {/* Goggle right */}
      <circle cx="38" cy="30" r="7" fill="#1a0e04" stroke="#5a3a20" strokeWidth="1.5"/>
      <circle cx="38" cy="30" r="5.5" fill="url(#plg-goggle2)">
        <animate attributeName="opacity" values="1;0.5;1" dur="2.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="36" cy="28" r="1.5" fill="white" opacity="0.25"/>
      {/* Goggle bridge */}
      <rect x="27" y="28" width="6" height="4" rx="1" fill="#2a1e0c"/>
      {/* Leather strap lines */}
      <line x1="14" y1="30" x2="8" y2="30" stroke="#5a3a20" strokeWidth="1.5"/>
      <line x1="46" y1="30" x2="52" y2="30" stroke="#5a3a20" strokeWidth="1.5"/>
    </svg>
  );
}

// ── EPIC ──────────────────────────────────────────────────────────────────────

export function HornsIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="hrn-left" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#7f0000"/>
          <stop offset="50%" stopColor="#cc0000"/>
          <stop offset="100%" stopColor="#ff4444"/>
        </linearGradient>
        <linearGradient id="hrn-right" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#7f0000"/>
          <stop offset="50%" stopColor="#cc0000"/>
          <stop offset="100%" stopColor="#ff4444"/>
        </linearGradient>
        <filter id="hrn-glow">
          <feGaussianBlur stdDeviation="2" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Left horn */}
      <path d="M 10,52 Q 8,38 12,24 Q 14,14 20,8 Q 18,20 22,30 Q 24,40 22,52 Z"
            fill="url(#hrn-left)" stroke="#8b0000" strokeWidth="0.5"/>
      {/* Right horn */}
      <path d="M 50,52 Q 52,38 48,24 Q 46,14 40,8 Q 42,20 38,30 Q 36,40 38,52 Z"
            fill="url(#hrn-right)" stroke="#8b0000" strokeWidth="0.5"/>
      {/* Tip glows */}
      <circle cx="20" cy="9" r="3" fill="#ff6666" filter="url(#hrn-glow)" opacity="0.8">
        <animate attributeName="r" values="3;4.5;3" dur="1.8s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;1;0.8" dur="1.8s" repeatCount="indefinite"/>
      </circle>
      <circle cx="40" cy="9" r="3" fill="#ff6666" filter="url(#hrn-glow)" opacity="0.8">
        <animate attributeName="r" values="3;4.5;3" dur="2s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>
      {/* Horn highlight */}
      <path d="M 14,44 Q 15,30 18,18" stroke="white" strokeWidth="1" opacity="0.15" fill="none"/>
      <path d="M 46,44 Q 45,30 42,18" stroke="white" strokeWidth="1" opacity="0.15" fill="none"/>
    </svg>
  );
}

export function AngelIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <radialGradient id="ang-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fffbe0" stopOpacity="0.6"/>
          <stop offset="70%" stopColor="#ffd700" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#ffd700" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="ang-ring" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fffde7"/>
          <stop offset="50%" stopColor="#ffd700"/>
          <stop offset="100%" stopColor="#f0b540"/>
        </linearGradient>
      </defs>
      {/* Glow backdrop */}
      <ellipse cx="30" cy="30" rx="24" ry="18" fill="url(#ang-glow)">
        <animate attributeName="rx" values="22;26;22" dur="3s" repeatCount="indefinite"/>
        <animate attributeName="ry" values="16;20;16" dur="3s" repeatCount="indefinite"/>
      </ellipse>
      {/* Halo ring — thick gold ellipse */}
      <ellipse cx="30" cy="30" rx="20" ry="9" fill="none" stroke="url(#ang-ring)" strokeWidth="5.5"/>
      {/* Inner ring highlight */}
      <ellipse cx="30" cy="30" rx="20" ry="9" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4"/>
      {/* Slow rotation shimmer */}
      <ellipse cx="30" cy="30" rx="20" ry="9" fill="none" stroke="white" strokeWidth="2" opacity="0" strokeDasharray="12 50">
        <animate attributeName="opacity" values="0;0.5;0" dur="2.5s" repeatCount="indefinite"/>
        <animateTransform attributeName="transform" type="rotate" from="0 30 30" to="360 30 30" dur="4s" repeatCount="indefinite"/>
      </ellipse>
    </svg>
  );
}

export function IceCrownIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="icr-base" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#e0f4ff"/>
          <stop offset="100%" stopColor="#5ba3c9"/>
        </linearGradient>
        <linearGradient id="icr-spike" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#a8d8f0"/>
          <stop offset="70%" stopColor="#ddf0ff"/>
          <stop offset="100%" stopColor="white"/>
        </linearGradient>
        <filter id="icr-frost">
          <feGaussianBlur stdDeviation="1" result="b"/>
          <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Crown band */}
      <rect x="8" y="42" width="44" height="8" rx="2" fill="url(#icr-base)" stroke="#7ec8e3" strokeWidth="0.7"/>
      {/* Icicle spikes — 5 */}
      <path d="M 14,42 L 10,24 L 18,42 Z" fill="url(#icr-spike)" stroke="#a8d8f0" strokeWidth="0.5" opacity="0.9"/>
      <path d="M 23,42 L 20,18 L 26,42 Z" fill="url(#icr-spike)" stroke="#a8d8f0" strokeWidth="0.5"/>
      <path d="M 30,42 L 30,10 L 30,42 L 26,42 L 34,42 Z" fill="url(#icr-spike)" stroke="#a8d8f0" strokeWidth="0.5"/>
      <path d="M 37,42 L 34,18 L 40,42 Z" fill="url(#icr-spike)" stroke="#a8d8f0" strokeWidth="0.5"/>
      <path d="M 46,42 L 42,24 L 50,42 Z" fill="url(#icr-spike)" stroke="#a8d8f0" strokeWidth="0.5" opacity="0.9"/>
      {/* Frost sparkles */}
      <circle cx="30" cy="12" r="2" fill="white" filter="url(#icr-frost)">
        <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite"/>
      </circle>
      <circle cx="20" cy="20" r="1.5" fill="white" filter="url(#icr-frost)">
        <animate attributeName="opacity" values="0.8;0.1;0.8" dur="2s" repeatCount="indefinite"/>
      </circle>
      <circle cx="40" cy="20" r="1.5" fill="white" filter="url(#icr-frost)">
        <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1.8s" repeatCount="indefinite"/>
      </circle>
      {/* Ice facet reflections on band */}
      <rect x="12" y="44" width="36" height="2" rx="1" fill="white" opacity="0.2"/>
    </svg>
  );
}

export function VikingIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="vkg-steel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8898aa"/>
          <stop offset="50%" stopColor="#c8d6e0"/>
          <stop offset="100%" stopColor="#5a6a78"/>
        </linearGradient>
        <linearGradient id="vkg-horn" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#c8a060"/>
          <stop offset="100%" stopColor="#f0d090"/>
        </linearGradient>
      </defs>
      {/* Left horn */}
      <path d="M 12,36 Q 4,28 6,16 Q 10,8 16,14 Q 14,22 16,30 Q 14,34 12,36 Z"
            fill="url(#vkg-horn)" stroke="#a07040" strokeWidth="0.5"/>
      {/* Right horn */}
      <path d="M 48,36 Q 56,28 54,16 Q 50,8 44,14 Q 46,22 44,30 Q 46,34 48,36 Z"
            fill="url(#vkg-horn)" stroke="#a07040" strokeWidth="0.5"/>
      {/* Helmet dome */}
      <path d="M 12,40 Q 12,16 30,14 Q 48,16 48,40 Z" fill="url(#vkg-steel)"/>
      {/* Nasal guard */}
      <rect x="28" y="34" width="4" height="12" rx="1.5" fill="url(#vkg-steel)" stroke="#4a5a68" strokeWidth="0.5"/>
      {/* Brow band */}
      <rect x="10" y="38" width="40" height="5" rx="2" fill="#4a5a68" stroke="#8898aa" strokeWidth="0.5"/>
      {/* Rivets */}
      {[[16,40],[24,40],[36,40],[44,40],[22,26],[38,26],[30,17]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="1.5" fill="#3a4a58" stroke="#aabbcc" strokeWidth="0.4"/>
      ))}
      {/* Steel gleam */}
      <path d="M 22,16 Q 28,14 34,16" stroke="white" strokeWidth="1.5" opacity="0.2" fill="none">
        <animate attributeName="opacity" values="0.1;0.35;0.1" dur="4s" repeatCount="indefinite"/>
      </path>
    </svg>
  );
}

// ── RARE ──────────────────────────────────────────────────────────────────────

export function HelmIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="hlm-steel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7a8fa0"/>
          <stop offset="40%" stopColor="#c0d0dc"/>
          <stop offset="100%" stopColor="#4a6070"/>
        </linearGradient>
      </defs>
      <path d="M 10,50 Q 10,16 30,14 Q 50,16 50,50 Z" fill="url(#hlm-steel)"/>
      {/* Visor / eye slot */}
      <rect x="12" y="38" width="36" height="5" rx="1" fill="#0d1520"/>
      <rect x="14" y="39" width="32" height="2" rx="1" fill="#1a2535" opacity="0.8"/>
      {/* Center ridge */}
      <line x1="30" y1="16" x2="30" y2="42" stroke="#8898aa" strokeWidth="1.5" opacity="0.4"/>
      {/* Cheek guards */}
      <path d="M 10,42 Q 8,48 10,52" stroke="#4a6070" strokeWidth="2" fill="none"/>
      <path d="M 50,42 Q 52,48 50,52" stroke="#4a6070" strokeWidth="2" fill="none"/>
      {/* Metal gleam */}
      <path d="M 20,18 Q 26,16 32,18" stroke="white" strokeWidth="1.5" opacity="0.25" fill="none">
        <animate attributeName="opacity" values="0.1;0.3;0.1" dur="3.5s" repeatCount="indefinite"/>
      </path>
      <line x1="12" y1="26" x2="14" y2="36" stroke="white" strokeWidth="0.8" opacity="0.1"/>
    </svg>
  );
}

export function TopHatIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="tph-body" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#2d2d2d"/>
          <stop offset="100%" stopColor="#0a0a0a"/>
        </linearGradient>
      </defs>
      {/* Wide brim */}
      <ellipse cx="30" cy="44" rx="22" ry="5" fill="#111" stroke="#333" strokeWidth="0.8"/>
      {/* Hat body (cylinder) */}
      <rect x="14" y="14" width="32" height="32" fill="url(#tph-body)" stroke="#333" strokeWidth="0.5"/>
      {/* Top of hat */}
      <ellipse cx="30" cy="14" rx="16" ry="4" fill="#222" stroke="#333" strokeWidth="0.5"/>
      {/* Ribbon band */}
      <rect x="14" y="36" width="32" height="5" fill="#8b0000" opacity="0.85"/>
      {/* Highlight on brim */}
      <ellipse cx="30" cy="44" rx="19" ry="2.5" fill="none" stroke="#444" strokeWidth="0.5"/>
      {/* Shine */}
      <path d="M 18,16 Q 22,14 26,16" stroke="white" strokeWidth="0.8" opacity="0.15" fill="none"/>
    </svg>
  );
}

export function WizardIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="wiz-hat" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#312e7a"/>
          <stop offset="100%" stopColor="#1a1850"/>
        </linearGradient>
      </defs>
      {/* Brim */}
      <ellipse cx="30" cy="48" rx="20" ry="5" fill="#1a1850" stroke="#4040a0" strokeWidth="0.7"/>
      {/* Cone body */}
      <path d="M 18,48 Q 20,40 24,30 Q 26,20 30,8 Q 34,20 36,30 Q 40,40 42,48 Z"
            fill="url(#wiz-hat)" stroke="#4040a0" strokeWidth="0.7"/>
      {/* Stars on hat */}
      <polygon points="24,30 25.5,26 27,30 23,27.5 28,27.5" fill="#ffd700" opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.3;0.9" dur="2s" repeatCount="indefinite"/>
      </polygon>
      <polygon points="34,20 35.5,16 37,20 33,17.5 38,17.5" fill="#ffd700" opacity="0.7" transform="scale(0.8)">
        <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2.8s" repeatCount="indefinite"/>
      </polygon>
      {/* Moon */}
      <path d="M 22,40 Q 19,36 22,33 Q 18,34 18,37 Q 18,41 22,40 Z" fill="#aaaaff" opacity="0.7"/>
      {/* Tip star */}
      <circle cx="30" cy="9" r="2.5" fill="#ffd700">
        <animate attributeName="r" values="2;3;2" dur="1.5s" repeatCount="indefinite"/>
        <animate attributeName="opacity" values="1;0.5;1" dur="1.5s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

export function BladeIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="bld-blade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#c8d8e8"/>
          <stop offset="50%" stopColor="#f0f8ff"/>
          <stop offset="100%" stopColor="#708090"/>
        </linearGradient>
      </defs>
      {/* Headband */}
      <rect x="6" y="36" width="48" height="8" rx="4" fill="#1a1a2e" stroke="#333" strokeWidth="0.7"/>
      {/* Blade mounted horizontally */}
      <path d="M 6,34 L 52,32 L 54,35 L 52,38 L 6,37 Z" fill="url(#bld-blade)"/>
      {/* Blade edge */}
      <path d="M 6,34 L 54,32" stroke="white" strokeWidth="0.8" opacity="0.5"/>
      {/* Blade tip */}
      <path d="M 52,32 L 58,34.5 L 52,38 Z" fill="#b0c0d0"/>
      {/* Guard / tsuba */}
      <ellipse cx="12" cy="35.5" rx="4" ry="3" fill="#8b6914" stroke="#c8a030" strokeWidth="0.5"/>
      {/* Handle wrap */}
      <rect x="6" y="33" width="6" height="5" fill="#8b4513" rx="1"/>
      {[0,1,2].map(i => (
        <line key={i} x1={7} y1={33.5 + i*1.5} x2={11} y2={33.5 + i*1.5} stroke="#5a2d0c" strokeWidth="0.7" opacity="0.7"/>
      ))}
      {/* Gleam */}
      <path d="M 20,33 L 40,32.5" stroke="white" strokeWidth="0.5" opacity="0.3">
        <animate attributeName="opacity" values="0.1;0.5;0.1" dur="2.5s" repeatCount="indefinite"/>
      </path>
    </svg>
  );
}

export function DetectiveIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="dtv-felt" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#5a4a3a"/>
          <stop offset="100%" stopColor="#2d2018"/>
        </linearGradient>
      </defs>
      {/* Wide brim — angled (detective tilt) */}
      <path d="M 2,40 Q 8,36 30,36 Q 52,36 58,40 Q 52,44 30,44 Q 8,44 2,40 Z" fill="#2a1c0e"/>
      {/* Hat crown with indent on top */}
      <path d="M 14,38 Q 14,22 18,16 Q 22,10 30,10 Q 38,10 42,16 Q 46,22 46,38 Z" fill="url(#dtv-felt)"/>
      {/* Crown indent (pinched) */}
      <path d="M 20,14 Q 26,10 34,14" fill="#1a1008" stroke="none"/>
      {/* Hat band */}
      <rect x="14" y="32" width="32" height="5" fill="#0a0604" rx="1"/>
      {/* Band pin */}
      <circle cx="24" cy="34.5" r="2" fill="#c8a030" stroke="#f0c040" strokeWidth="0.4"/>
      <circle cx="24" cy="34.5" r="0.8" fill="white" opacity="0.3"/>
      {/* Brim shadow line */}
      <path d="M 6,40 Q 30,42 54,40" stroke="#1a1008" strokeWidth="1" fill="none" opacity="0.5"/>
    </svg>
  );
}

export function JesterIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="jst-red" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#cc0000"/>
          <stop offset="100%" stopColor="#880000"/>
        </linearGradient>
        <linearGradient id="jst-yel" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffcc00"/>
          <stop offset="100%" stopColor="#cc8800"/>
        </linearGradient>
      </defs>
      {/* Left point (drooping) */}
      <path d="M 12,36 Q 6,28 8,16 Q 10,8 18,12 Q 16,20 20,30 Q 18,34 12,36 Z" fill="url(#jst-red)"/>
      {/* Right point */}
      <path d="M 48,36 Q 54,28 52,16 Q 50,8 42,12 Q 44,20 40,30 Q 42,34 48,36 Z" fill="url(#jst-yel)"/>
      {/* Central cap body */}
      <path d="M 16,42 Q 16,24 30,20 Q 44,24 44,42 Z" fill="url(#jst-red)"/>
      <path d="M 20,42 Q 20,26 30,24 Q 40,26 40,42 Z" fill="url(#jst-yel)" opacity="0.85"/>
      {/* Brim */}
      <ellipse cx="30" cy="42" rx="16" ry="4" fill="#880000"/>
      {/* Bell tips */}
      <circle cx="8" cy="16" r="3.5" fill="#ffd700" stroke="#b8860b" strokeWidth="0.5">
        <animate attributeName="cy" values="16;14;16" dur="1.2s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1"/>
      </circle>
      <circle cx="52" cy="16" r="3.5" fill="#cc0000" stroke="#880000" strokeWidth="0.5">
        <animate attributeName="cy" values="16;14;16" dur="1.0s" repeatCount="indefinite" calcMode="spline" keySplines="0.4 0 0.6 1"/>
      </circle>
    </svg>
  );
}

// ── UNCOMMON ──────────────────────────────────────────────────────────────────

export function NinjaIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* Headband */}
      <rect x="4" y="26" width="52" height="10" rx="5" fill="#1a1a1a" stroke="#333" strokeWidth="0.6"/>
      {/* Knot tie tails on right */}
      <path d="M 50,28 Q 56,24 56,30 Q 56,36 50,36" stroke="#1a1a1a" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <path d="M 50,32 Q 58,30 58,36 Q 58,42 52,40" stroke="#1a1a1a" strokeWidth="5" fill="none" strokeLinecap="round"/>
      {/* Red rising sun circle */}
      <circle cx="22" cy="31" r="7" fill="#cc0000" opacity="0.9"/>
      <circle cx="22" cy="31" r="4" fill="#ff4444" opacity="0.6"/>
      {/* Band texture lines */}
      <line x1="35" y1="27" x2="35" y2="35" stroke="#333" strokeWidth="0.5" opacity="0.5"/>
      <line x1="40" y1="27" x2="40" y2="35" stroke="#333" strokeWidth="0.5" opacity="0.5"/>
    </svg>
  );
}

export function FlowerCrownIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* Green vine band */}
      <path d="M 6,38 Q 18,32 30,34 Q 42,32 54,38" stroke="#2d6a1a" strokeWidth="4" fill="none" strokeLinecap="round"/>
      {/* Leaves */}
      {[[12,34],[24,30],[36,30],[48,34]].map(([cx,cy],i) => (
        <ellipse key={i} cx={cx} cy={cy} rx="5" ry="2.5" fill="#38a020" transform={`rotate(${-20+i*14} ${cx} ${cy})`} opacity="0.9"/>
      ))}
      {/* Flowers */}
      {[
        { cx:10, cy:32, petal:"#ff6b9a", center:"#ffff88" },
        { cx:22, cy:26, petal:"#ff88bb", center:"#fff176" },
        { cx:30, cy:24, petal:"#ffaa44", center:"#ffffff" },
        { cx:38, cy:26, petal:"#bb88ff", center:"#fff176" },
        { cx:50, cy:32, petal:"#ff6b9a", center:"#ffff88" },
      ].map(({cx,cy,petal,center},i) => (
        <g key={i}>
          {[0,60,120,180,240,300].map(a => (
            <ellipse key={a} cx={cx + Math.cos(a*Math.PI/180)*4.5} cy={cy + Math.sin(a*Math.PI/180)*4.5}
              rx="2.8" ry="2" fill={petal} opacity="0.9"
              transform={`rotate(${a} ${cx + Math.cos(a*Math.PI/180)*4.5} ${cy + Math.sin(a*Math.PI/180)*4.5})`}/>
          ))}
          <circle cx={cx} cy={cy} r="2.5" fill={center}/>
        </g>
      ))}
    </svg>
  );
}

export function PartyHatIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* Cone */}
      <path d="M 16,50 L 30,8 L 44,50 Z" fill="#cc44cc"/>
      {/* Stripes */}
      {[0.25,0.5,0.75].map((t, i) => {
        const y = 8 + t * 42;
        const half = t * 14;
        return <line key={i} x1={30-half} y1={y} x2={30+half} y2={y} stroke={["#ffff44","#44ffcc","#ff8844"][i]} strokeWidth="2.5"/>;
      })}
      {/* Brim */}
      <ellipse cx="30" cy="50" rx="14" ry="4" fill="#aa22aa"/>
      {/* Pompom */}
      <circle cx="30" cy="8" r="5" fill="#ffff44"/>
      {/* Confetti */}
      {[{x:10,y:20,r:15,c:"#ff4444"},{x:48,y:16,r:-20,c:"#44ccff"},{x:8,y:34,r:30,c:"#44ff44"},{x:52,y:32,r:-10,c:"#ffaa44"}].map((p,i) => (
        <rect key={i} x={p.x} y={p.y} width="3" height="3" rx="0.5" fill={p.c} transform={`rotate(${p.r} ${p.x} ${p.y})`}>
          <animateTransform attributeName="transform" type="translate" values="0 0;2 4;0 0" dur={`${1.5+i*0.3}s`} repeatCount="indefinite" additive="sum"/>
        </rect>
      ))}
    </svg>
  );
}

export function MortarIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* Board (flat square top) */}
      <rect x="8" y="16" width="44" height="5" rx="1" fill="#1a1a1a" stroke="#333" strokeWidth="0.5"/>
      {/* Cap body */}
      <rect x="16" y="20" width="28" height="18" fill="#222" stroke="#333" strokeWidth="0.5"/>
      {/* Cap sides */}
      <path d="M 16,20 Q 16,38 18,38 L 42,38 Q 44,38 44,20 Z" fill="#1a1a1a"/>
      {/* Tassel top button */}
      <circle cx="30" cy="16" r="3" fill="#cc8800"/>
      {/* Tassel cord + bob */}
      <line x1="30" y1="16" x2="44" y2="28" stroke="#cc8800" strokeWidth="1.5">
        <animateTransform attributeName="transform" type="rotate" values="0 30 16;10 30 16;0 30 16;-5 30 16;0 30 16" dur="2s" repeatCount="indefinite"/>
      </line>
      <circle cx="44" cy="28" r="3.5" fill="#cc8800">
        <animateTransform attributeName="transform" type="rotate" values="0 30 16;10 30 16;0 30 16;-5 30 16;0 30 16" dur="2s" repeatCount="indefinite"/>
      </circle>
    </svg>
  );
}

export function HardhatIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="hrd-yel" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffdd00"/>
          <stop offset="100%" stopColor="#cc9900"/>
        </linearGradient>
      </defs>
      {/* Dome */}
      <path d="M 8,40 Q 8,16 30,14 Q 52,16 52,40 Z" fill="url(#hrd-yel)"/>
      {/* Brim */}
      <rect x="4" y="38" width="52" height="6" rx="3" fill="url(#hrd-yel)" stroke="#aa7700" strokeWidth="0.5"/>
      {/* Inner suspension band */}
      <path d="M 14,38 Q 14,26 30,24 Q 46,26 46,38" fill="none" stroke="#cc8800" strokeWidth="1.5" opacity="0.4"/>
      {/* Center ridge */}
      <path d="M 30,14 L 30,40" stroke="#cc9900" strokeWidth="1" opacity="0.3"/>
      {/* Shine */}
      <path d="M 18,18 Q 24,14 30,16" stroke="white" strokeWidth="2" opacity="0.3" fill="none"/>
    </svg>
  );
}

export function CowboyIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="cwy-felt" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#6b4c2a"/>
          <stop offset="100%" stopColor="#3d2a14"/>
        </linearGradient>
      </defs>
      {/* Wide brim (curved up at sides) */}
      <path d="M 2,40 Q 6,30 16,34 Q 30,38 44,34 Q 54,30 58,40 Q 54,46 44,44 Q 30,46 16,44 Q 6,46 2,40 Z"
            fill="url(#cwy-felt)" stroke="#2a1a08" strokeWidth="0.5"/>
      {/* Crown with center pinch */}
      <path d="M 16,36 Q 16,20 30,18 Q 44,20 44,36 Z" fill="url(#cwy-felt)" stroke="#2a1a08" strokeWidth="0.5"/>
      {/* Pinch indent at top */}
      <path d="M 22,20 Q 26,16 30,18 Q 34,16 38,20 Q 34,18 30,20 Q 26,18 22,20 Z" fill="#3d2a14"/>
      {/* Hat band */}
      <rect x="16" y="30" width="28" height="5" fill="#1a0e04" rx="1"/>
      {/* Band buckle */}
      <rect x="26" y="30" width="8" height="5" fill="#8b6914" stroke="#c8a030" strokeWidth="0.4"/>
      {/* Brim detail line */}
      <path d="M 8,40 Q 30,42 52,40" stroke="#2a1a08" strokeWidth="0.8" fill="none" opacity="0.5"/>
    </svg>
  );
}

// ── COMMON ────────────────────────────────────────────────────────────────────

export function HaloIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="hlo-gold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffe566"/>
          <stop offset="100%" stopColor="#c8922a"/>
        </linearGradient>
      </defs>
      <ellipse cx="30" cy="30" rx="20" ry="8" fill="none" stroke="url(#hlo-gold)" strokeWidth="4"/>
      <ellipse cx="30" cy="30" rx="20" ry="8" fill="none" stroke="white" strokeWidth="1" opacity="0.3"/>
    </svg>
  );
}

export function VisorIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* Visor band */}
      <path d="M 6,34 Q 6,24 30,22 Q 54,24 54,34" fill="#1a1a2e" stroke="#3a3a5e" strokeWidth="0.7"/>
      <path d="M 6,34 Q 6,40 30,40 Q 54,40 54,34" fill="#22224e" stroke="#3a3a5e" strokeWidth="0.7"/>
      {/* Visor brim */}
      <path d="M 6,34 Q 6,46 30,46 Q 54,46 54,34" fill="#2a2a5e" stroke="#4a4a8e" strokeWidth="0.7"/>
      {/* Sweat band inside */}
      <path d="M 10,34 Q 10,28 30,26 Q 50,28 50,34" fill="none" stroke="#5a5a9e" strokeWidth="1" opacity="0.3"/>
    </svg>
  );
}

export function CapIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      <defs>
        <linearGradient id="cap-cl" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#3a7bd5"/>
          <stop offset="100%" stopColor="#1e4a9e"/>
        </linearGradient>
      </defs>
      {/* Cap dome */}
      <path d="M 10,40 Q 10,18 30,16 Q 50,18 50,40 Z" fill="url(#cap-cl)"/>
      {/* Brim */}
      <path d="M 10,40 Q 10,46 20,46 L 54,42 Q 58,40 54,38 L 10,38 Z" fill="#1a3a8a"/>
      {/* Center seam */}
      <line x1="30" y1="16" x2="30" y2="40" stroke="#2a5ab5" strokeWidth="0.8" opacity="0.4"/>
      {/* Button top */}
      <circle cx="30" cy="16" r="2.5" fill="#1a3a8a" stroke="#2a5ab5" strokeWidth="0.5"/>
      {/* Brim stitch line */}
      <path d="M 12,42 Q 20,44 52,41" stroke="#2a5ab5" strokeWidth="0.6" fill="none" opacity="0.4"/>
    </svg>
  );
}

export function BunnyIcon({ size }: S) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none">
      {/* Left ear */}
      <path d="M 18,46 Q 14,28 16,14 Q 18,6 22,10 Q 24,18 22,32 Q 22,40 22,46 Z" fill="#f8d7e8" stroke="#d4a0b8" strokeWidth="0.6"/>
      {/* Left inner ear */}
      <path d="M 19,42 Q 16,28 18,16 Q 20,10 21,14 Q 22,22 21,34 Q 21,40 19,42 Z" fill="#ffb3cc" opacity="0.8"/>
      {/* Right ear */}
      <path d="M 42,46 Q 46,28 44,14 Q 42,6 38,10 Q 36,18 38,32 Q 38,40 38,46 Z" fill="#f8d7e8" stroke="#d4a0b8" strokeWidth="0.6"/>
      {/* Right inner ear */}
      <path d="M 41,42 Q 44,28 42,16 Q 40,10 39,14 Q 38,22 39,34 Q 39,40 41,42 Z" fill="#ffb3cc" opacity="0.8"/>
      {/* Headband */}
      <rect x="12" y="42" width="36" height="7" rx="3.5" fill="#d4a0b8" stroke="#c090a8" strokeWidth="0.5"/>
    </svg>
  );
}

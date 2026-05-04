import { useCallback, useEffect, useRef, useState } from "react";
import { CRATES, openCrate, type CrateId, type CrateResult } from "../../lib/crates";
import { loadGems, formatGems, addGems } from "../../lib/gems";
import { loadInventory } from "../../lib/inventory";
import { RARITY_COLOR } from "../../../../shared/constants";
import type { Rarity } from "../../../../shared/constants";

type Phase = "select" | "opening" | "reveal";

type Props = {
  onClose: () => void;
};

const RARITY_LABELS: Record<Rarity, string> = {
  common: "Common", uncommon: "Uncommon", rare: "Rare",
  epic: "Epic", legendary: "Legendary", mythic: "Mythic",
};

function GemIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "inline-block", verticalAlign: "middle", marginRight: 3 }}>
      <polygon points="8,1 14,5 14,11 8,15 2,11 2,5" fill="#a855f7" stroke="#d946ef" strokeWidth="1"/>
      <polygon points="8,3 12,6 12,10 8,13 4,10 4,6" fill="#7c3aed" opacity="0.7"/>
      <polygon points="8,5 10,7 10,9 8,11 6,9 6,7" fill="#e9d5ff" opacity="0.5"/>
    </svg>
  );
}

export function CrateModal({ onClose }: Props) {
  const [gems, setGems] = useState(loadGems);
  const [phase, setPhase] = useState<Phase>("select");
  const [selectedCrate, setSelectedCrate] = useState<CrateId>("basic");
  const [result, setResult] = useState<CrateResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [spinAngle, setSpinAngle] = useState(0);
  const rafRef = useRef(0);
  const spinRef = useRef(0);
  const startRef = useRef(0);

  useEffect(() => {
    const handler = () => setGems(loadGems());
    window.addEventListener("slithera-gems-change", handler);
    return () => window.removeEventListener("slithera-gems-change", handler);
  }, []);

  const handleOpen = useCallback(() => {
    setError(null);
    const inv = loadInventory();
    const res = openCrate(selectedCrate, inv.itemIds);
    if (!res.ok) {
      setError(res.reason);
      return;
    }
    setResult(res.result);
    setPhase("opening");
    setGems(loadGems());

    // Spin animation: ~1.5s
    spinRef.current = 0;
    startRef.current = performance.now();
    const animate = () => {
      const elapsed = (performance.now() - startRef.current) / 1000;
      const t = Math.min(1, elapsed / 1.4);
      // Ease-out cubic: fast start, slow end
      const eased = 1 - Math.pow(1 - t, 3);
      spinRef.current = eased * 1080; // 3 full rotations
      setSpinAngle(spinRef.current);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setPhase("reveal");
      }
    };
    rafRef.current = requestAnimationFrame(animate);
  }, [selectedCrate]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const crate = CRATES.find((c) => c.id === selectedCrate)!;
  const canAfford = gems >= crate.price;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.panel} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <span style={styles.title}>CRATE VAULT</span>
          <div style={styles.gemBadge}>
            <GemIcon size={16} />
            <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 15, color: "#e9d5ff" }}>{formatGems(gems)}</span>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {phase === "select" && (
          <>
            {/* Crate grid */}
            <div style={styles.crateGrid}>
              {CRATES.map((c) => (
                <button
                  key={c.id}
                  style={{
                    ...styles.crateCard,
                    borderColor: selectedCrate === c.id ? c.color : "rgba(255,255,255,0.08)",
                    boxShadow: selectedCrate === c.id ? `0 0 20px ${c.glowColor}, inset 0 0 10px ${c.glowColor}` : "none",
                    background: selectedCrate === c.id
                      ? `linear-gradient(135deg, ${c.color}18, ${c.color}08)`
                      : "rgba(255,255,255,0.03)",
                  }}
                  onClick={() => setSelectedCrate(c.id)}
                >
                  <CrateBox color={c.color} glowColor={c.glowColor} selected={selectedCrate === c.id} />
                  <div style={{ ...styles.crateName, color: selectedCrate === c.id ? c.color : "#ccc" }}>{c.name}</div>
                  <div style={styles.crateSubtitle}>{c.subtitle}</div>
                  <div style={styles.cratePrice}>
                    <GemIcon size={12} />
                    <span style={{ color: gems >= c.price ? "#e9d5ff" : "#774444" }}>{c.price.toLocaleString()}</span>
                  </div>
                  <RarityBar weights={c.weights} />
                </button>
              ))}
            </div>

            {/* Open button */}
            <div style={styles.openRow}>
              {error && <div style={styles.errorMsg}>{error}</div>}
              <button
                style={{ ...styles.openBtn, opacity: canAfford ? 1 : 0.45, cursor: canAfford ? "pointer" : "not-allowed" }}
                onClick={canAfford ? handleOpen : undefined}
                disabled={!canAfford}
              >
                <GemIcon size={18} />
                Open for {crate.price.toLocaleString()} Gems
              </button>
              <button style={styles.demoBtn} onClick={() => addGems(500) && setGems(loadGems())}>
                + 500 Gems (dev)
              </button>
            </div>
          </>
        )}

        {phase === "opening" && (
          <div style={styles.spinArea}>
            <div style={{ transform: `rotate(${spinAngle}deg)`, transition: "none" }}>
              <CrateBox color={crate.color} glowColor={crate.glowColor} size={120} selected spinning />
            </div>
            <div style={{ color: "#ccc", marginTop: 24, fontFamily: "Fraunces, serif", fontSize: 18 }}>Opening…</div>
          </div>
        )}

        {phase === "reveal" && result && (
          <div style={styles.revealArea}>
            <div style={styles.revealGlow} />
            <div style={styles.revealBadge}>
              <span style={{ ...styles.rarityTag, color: RARITY_COLOR[result.item.rarity as Rarity] ?? "#aaa", borderColor: RARITY_COLOR[result.item.rarity as Rarity] ?? "#aaa" }}>
                {RARITY_LABELS[result.item.rarity as Rarity]}
              </span>
            </div>
            <div style={{ fontSize: 48, margin: "20px 0 8px" }}>
              <ItemPreview item={result.item} />
            </div>
            <div style={styles.revealName}>{result.item.name}</div>
            <div style={styles.revealCategory}>{result.item.category.toUpperCase()}</div>
            {!result.isNew && <div style={styles.duplicateMsg}>Already owned — stored in your collection</div>}
            <div style={styles.revealActions}>
              <button style={styles.openBtn} onClick={() => { setPhase("select"); setResult(null); }}>Open Another</button>
              <button style={styles.secondaryBtn} onClick={onClose}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────────────────

function CrateBox({ color, glowColor, size = 54, selected = false, spinning = false }: {
  color: string; glowColor: string; size?: number; selected?: boolean; spinning?: boolean;
}) {
  const s = size;
  return (
    <svg width={s} height={s * 0.85} viewBox="0 0 64 54" fill="none" style={{
      filter: selected || spinning ? `drop-shadow(0 0 ${s * 0.12}px ${color})` : "none",
      transition: spinning ? "none" : "filter 0.3s",
    }}>
      {/* Box body */}
      <rect x="4" y="18" width="56" height="32" rx="4" fill="#111827" stroke={color} strokeWidth="1.5"/>
      {/* Lid */}
      <rect x="2" y="12" width="60" height="12" rx="3" fill="#1e2a3a" stroke={color} strokeWidth="1.5"/>
      {/* Latch */}
      <rect x="26" y="8" width="12" height="16" rx="2" fill={color} opacity="0.9"/>
      <rect x="28" y="10" width="8" height="4" rx="1" fill="#ffffff" opacity="0.3"/>
      {/* Horizontal band */}
      <rect x="4" y="28" width="56" height="3" fill={color} opacity="0.35"/>
      {/* Corner bolts */}
      {[[10,22],[54,22],[10,44],[54,44]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="2.5" fill={color} opacity="0.7"/>
      ))}
      {/* Inner glow */}
      <rect x="6" y="20" width="52" height="28" rx="3" fill={glowColor} opacity="0.12"/>
    </svg>
  );
}

function RarityBar({ weights }: { weights: Record<Rarity, number> }) {
  const order: Rarity[] = ["common","uncommon","rare","epic","legendary","mythic"];
  const total = Object.values(weights).reduce((a,b) => a+b, 0);
  return (
    <div style={{ display:"flex", gap:2, marginTop:6, height:4, borderRadius:2, overflow:"hidden" }}>
      {order.map((r) => {
        const w = (weights[r] / total) * 100;
        if (!w) return null;
        return <div key={r} style={{ flex: w, background: RARITY_COLOR[r], opacity: 0.8 }} />;
      })}
    </div>
  );
}

function ItemPreview({ item }: { item: CrateResult["item"] }) {
  // Minimalist geometric preview per category using inline SVG
  const color = RARITY_COLOR[item.rarity as Rarity] ?? "#aaa";
  switch (item.category) {
    case "skin":
      return <svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill={color} opacity="0.2"/><circle cx="32" cy="32" r="18" fill={color} opacity="0.6"/><circle cx="32" cy="32" r="8" fill={color}/><circle cx="26" cy="26" r="3" fill="#fff" opacity="0.4"/></svg>;
    case "hat":
      return <svg width="64" height="64" viewBox="0 0 64 64"><polygon points="32,8 52,44 12,44" fill={color} opacity="0.85"/><rect x="8" y="44" width="48" height="8" rx="3" fill={color}/><circle cx="32" cy="8" r="4" fill="#fff" opacity="0.5"/></svg>;
    case "charm":
      return <svg width="64" height="64" viewBox="0 0 64 64"><polygon points="32,8 54,22 54,42 32,56 10,42 10,22" fill={color} opacity="0.2" stroke={color} strokeWidth="2"/><polygon points="32,16 46,25 46,39 32,48 18,39 18,25" fill={color} opacity="0.6"/><circle cx="32" cy="32" r="8" fill="#fff" opacity="0.3"/></svg>;
    case "trail":
      return <svg width="64" height="64" viewBox="0 0 64 64"><circle cx="10" cy="32" r="3" fill={color} opacity="0.3"/><circle cx="22" cy="32" r="4" fill={color} opacity="0.5"/><circle cx="34" cy="32" r="5" fill={color} opacity="0.7"/><circle cx="48" cy="32" r="7" fill={color}/><circle cx="44" cy="28" r="2" fill="#fff" opacity="0.4"/></svg>;
    default:
      return <svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill={color} opacity="0.5"/></svg>;
  }
}

// ── Styles ───────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 900,
    background: "rgba(2,3,8,0.88)",
    display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(6px)",
  },
  panel: {
    width: "min(92vw, 860px)", maxHeight: "90vh",
    background: "linear-gradient(160deg, #0d0d1a 0%, #080812 100%)",
    border: "1px solid rgba(168,85,247,0.2)",
    borderRadius: 16,
    boxShadow: "0 0 60px rgba(168,85,247,0.12), 0 24px 80px rgba(0,0,0,0.7)",
    display: "flex", flexDirection: "column",
    overflow: "hidden",
  },
  header: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "18px 24px", borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  title: {
    fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 700,
    color: "#e9d5ff", letterSpacing: "0.12em", flex: 1,
  },
  gemBadge: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(168,85,247,0.15)", borderRadius: 8,
    padding: "6px 12px", border: "1px solid rgba(168,85,247,0.3)",
  },
  closeBtn: {
    background: "none", border: "none", color: "#666", fontSize: 18,
    cursor: "pointer", padding: "4px 8px", borderRadius: 6,
    transition: "color 0.2s",
  },
  crateGrid: {
    display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10,
    padding: "20px 20px 4px",
    overflowY: "auto",
  },
  crateCard: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "14px 8px 10px",
    border: "1px solid", borderRadius: 12,
    cursor: "pointer", transition: "all 0.25s",
    background: "rgba(255,255,255,0.03)",
    gap: 4,
  },
  crateName: {
    fontFamily: "Fraunces, serif", fontSize: 11, fontWeight: 700,
    letterSpacing: "0.05em", marginTop: 6, textAlign: "center",
  },
  crateSubtitle: {
    fontFamily: "JetBrains Mono, monospace", fontSize: 9, color: "#666",
    textAlign: "center", lineHeight: 1.3,
  },
  cratePrice: {
    display: "flex", alignItems: "center", gap: 4,
    fontFamily: "JetBrains Mono, monospace", fontSize: 11, marginTop: 4,
  },
  openRow: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 10, padding: "16px 24px 24px",
  },
  openBtn: {
    display: "flex", alignItems: "center", gap: 8,
    background: "linear-gradient(135deg, #7c3aed, #a855f7)",
    border: "none", borderRadius: 10, color: "#fff",
    fontFamily: "Fraunces, serif", fontSize: 16, fontWeight: 700,
    padding: "12px 32px", cursor: "pointer",
    boxShadow: "0 4px 20px rgba(168,85,247,0.4)",
    transition: "all 0.2s",
  },
  secondaryBtn: {
    background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10, color: "#aaa", fontFamily: "Fraunces, serif", fontSize: 14,
    padding: "10px 28px", cursor: "pointer",
  },
  demoBtn: {
    background: "none", border: "1px dashed #333", borderRadius: 8,
    color: "#444", fontFamily: "JetBrains Mono, monospace", fontSize: 11,
    padding: "6px 16px", cursor: "pointer",
  },
  errorMsg: {
    color: "#ff6666", fontFamily: "JetBrains Mono, monospace", fontSize: 12,
  },
  spinArea: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", padding: 60,
  },
  revealArea: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "40px 24px", gap: 8,
    position: "relative",
  },
  revealGlow: {
    position: "absolute", inset: 0, pointerEvents: "none",
    background: "radial-gradient(ellipse at center, rgba(168,85,247,0.15) 0%, transparent 70%)",
  },
  revealBadge: { zIndex: 1 },
  rarityTag: {
    fontFamily: "JetBrains Mono, monospace", fontSize: 12, fontWeight: 700,
    letterSpacing: "0.1em", padding: "4px 12px",
    border: "1px solid", borderRadius: 20, textTransform: "uppercase",
  },
  revealName: {
    fontFamily: "Fraunces, serif", fontSize: 28, fontWeight: 700,
    color: "#f5f5f5", marginTop: 4, zIndex: 1,
  },
  revealCategory: {
    fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#666",
    letterSpacing: "0.12em", zIndex: 1,
  },
  duplicateMsg: {
    fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#886644",
    marginTop: 4, zIndex: 1,
  },
  revealActions: {
    display: "flex", gap: 12, marginTop: 20, zIndex: 1,
  },
};

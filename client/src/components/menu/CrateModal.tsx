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
      <polygon points="8,1 14,5 14,11 8,15 2,11 2,5" fill="#0ea5e9" stroke="#38bdf8" strokeWidth="1"/>
      <polygon points="8,3 12,6 12,10 8,13 4,10 4,6" fill="#0369a1" opacity="0.7"/>
      <polygon points="8,5 10,7 10,9 8,11 6,9 6,7" fill="#e0f2fe" opacity="0.5"/>
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

    spinRef.current = 0;
    startRef.current = performance.now();
    const animate = () => {
      const elapsed = (performance.now() - startRef.current) / 1000;
      const t = Math.min(1, elapsed / 1.4);
      const eased = 1 - Math.pow(1 - t, 3);
      spinRef.current = eased * 1080;
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
    <div style={S.overlay} onClick={onClose}>
      <div style={S.panel} onClick={(e) => e.stopPropagation()}>

        {/* Ambient top glow */}
        <div style={S.ambientGlow} />

        {/* Header */}
        <div style={S.header}>
          <div style={S.headerBrand}>
            <span style={S.headerEyebrow}>· · VAULT · ·</span>
            <span style={S.title}>Crate Sanctum</span>
          </div>
          <div style={S.gemBadge}>
            <GemIcon size={16} />
            <span style={S.gemCount}>{formatGems(gems)}</span>
          </div>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        {phase === "select" && (
          <>
            <div style={S.crateGrid}>
              {CRATES.map((c) => {
                const sel = selectedCrate === c.id;
                return (
                  <button
                    key={c.id}
                    style={{
                      ...S.crateCard,
                      borderColor: sel ? c.color : "rgba(240,181,64,0.12)",
                      boxShadow: sel
                        ? `0 0 24px ${c.glowColor}, inset 0 0 12px ${c.glowColor}`
                        : "0 2px 8px rgba(0,0,0,0.4)",
                      background: sel
                        ? `linear-gradient(160deg, ${c.color}18 0%, #1a120a 100%)`
                        : "linear-gradient(160deg, #1e1408 0%, #160f06 100%)",
                    }}
                    onClick={() => setSelectedCrate(c.id)}
                  >
                    <div style={{ ...S.crateTopBar, background: sel ? c.color : "rgba(240,181,64,0.15)" }} />
                    <CrateBox color={c.color} glowColor={c.glowColor} selected={sel} />
                    <div style={{ ...S.crateName, color: sel ? c.color : "#c9a87a" }}>{c.name}</div>
                    <div style={S.crateSubtitle}>{c.subtitle}</div>
                    <div style={S.cratePrice}>
                      <GemIcon size={11} />
                      <span style={{ color: gems >= c.price ? "#7dd3fc" : "#774444", fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}>
                        {c.price.toLocaleString()}
                      </span>
                    </div>
                    <RarityBar weights={c.weights} />
                  </button>
                );
              })}
            </div>

            <div style={S.openRow}>
              {error && <div style={S.errorMsg}>{error}</div>}
              <button
                style={{ ...S.openBtn, opacity: canAfford ? 1 : 0.45, cursor: canAfford ? "pointer" : "not-allowed" }}
                onClick={canAfford ? handleOpen : undefined}
                disabled={!canAfford}
              >
                <GemIcon size={18} />
                Open for {crate.price.toLocaleString()} Gems
              </button>
              <button style={S.demoBtn} onClick={() => { addGems(500); setGems(loadGems()); }}>
                + 500 Gems (dev)
              </button>
            </div>
          </>
        )}

        {phase === "opening" && (
          <div style={S.spinArea}>
            <div style={S.spinRing} />
            <div style={{ transform: `rotate(${spinAngle}deg)`, transition: "none", position: "relative", zIndex: 1 }}>
              <CrateBox color={crate.color} glowColor={crate.glowColor} size={110} selected spinning />
            </div>
            <div style={S.openingLabel}>Opening…</div>
          </div>
        )}

        {phase === "reveal" && result && (
          <div style={S.revealArea}>
            <div style={{ ...S.revealGlow, background: `radial-gradient(ellipse at center, ${RARITY_COLOR[result.item.rarity as Rarity]}22 0%, transparent 65%)` }} />
            <span style={{ ...S.rarityTag, color: RARITY_COLOR[result.item.rarity as Rarity] ?? "#aaa", borderColor: RARITY_COLOR[result.item.rarity as Rarity] ?? "#aaa" }}>
              {RARITY_LABELS[result.item.rarity as Rarity]}
            </span>
            <div style={S.revealIconWrap}>
              <ItemPreview item={result.item} />
            </div>
            <div style={S.revealName}>{result.item.name}</div>
            <div style={S.revealCategory}>{result.item.category.toUpperCase()}</div>
            {!result.isNew && (
              <div style={S.duplicateMsg}>Already in your collection</div>
            )}
            <div style={S.revealActions}>
              <button style={S.openBtn} onClick={() => { setPhase("select"); setResult(null); }}>
                Open Another
              </button>
              <button style={S.secondaryBtn} onClick={onClose}>Done</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function CrateBox({ color, glowColor, size = 54, selected = false, spinning = false }: {
  color: string; glowColor: string; size?: number; selected?: boolean; spinning?: boolean;
}) {
  const s = size;
  return (
    <svg width={s} height={s * 0.85} viewBox="0 0 64 54" fill="none" style={{
      filter: selected || spinning ? `drop-shadow(0 0 ${s * 0.14}px ${color})` : "none",
      transition: spinning ? "none" : "filter 0.3s",
    }}>
      {/* Body */}
      <rect x="4" y="18" width="56" height="32" rx="4" fill="#1a1006" stroke={color} strokeWidth="1.5"/>
      {/* Lid */}
      <rect x="2" y="12" width="60" height="12" rx="3" fill="#251808" stroke={color} strokeWidth="1.5"/>
      {/* Latch */}
      <rect x="26" y="8" width="12" height="16" rx="2" fill={color} opacity="0.9"/>
      <rect x="28" y="10" width="8" height="4" rx="1" fill="#fff8e8" opacity="0.3"/>
      {/* Band */}
      <rect x="4" y="28" width="56" height="3" fill={color} opacity="0.35"/>
      {/* Bolts */}
      {[[10,22],[54,22],[10,44],[54,44]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="2.5" fill={color} opacity="0.7"/>
      ))}
      {/* Inner glow */}
      <rect x="6" y="20" width="52" height="28" rx="3" fill={glowColor} opacity="0.10"/>
    </svg>
  );
}

function RarityBar({ weights }: { weights: Record<Rarity, number> }) {
  const order: Rarity[] = ["common","uncommon","rare","epic","legendary","mythic"];
  const total = Object.values(weights).reduce((a,b) => a+b, 0);
  return (
    <div style={{ display:"flex", gap:1, marginTop:6, height:3, borderRadius:2, overflow:"hidden", width:"100%" }}>
      {order.map((r) => {
        const w = (weights[r] / total) * 100;
        if (!w) return null;
        return <div key={r} style={{ flex: w, background: RARITY_COLOR[r], opacity: 0.75 }} />;
      })}
    </div>
  );
}

function ItemPreview({ item }: { item: CrateResult["item"] }) {
  const color = RARITY_COLOR[item.rarity as Rarity] ?? "#aaa";
  switch (item.category) {
    case "skin":
      return <svg width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r="30" fill={color} opacity="0.15"/><circle cx="36" cy="36" r="20" fill={color} opacity="0.5"/><circle cx="36" cy="36" r="10" fill={color}/><circle cx="29" cy="29" r="3.5" fill="#fff" opacity="0.4"/></svg>;
    case "hat":
      return <svg width="72" height="72" viewBox="0 0 72 72"><polygon points="36,8 56,50 16,50" fill={color} opacity="0.8"/><rect x="10" y="50" width="52" height="9" rx="3" fill={color}/><circle cx="36" cy="8" r="4" fill="#fff" opacity="0.45"/></svg>;
    case "charm":
      return <svg width="72" height="72" viewBox="0 0 72 72"><polygon points="36,8 60,24 60,48 36,64 12,48 12,24" fill={color} opacity="0.18" stroke={color} strokeWidth="2"/><polygon points="36,18 52,29 52,43 36,54 20,43 20,29" fill={color} opacity="0.55"/><circle cx="36" cy="36" r="9" fill="#fff" opacity="0.25"/></svg>;
    case "trail":
      return <svg width="72" height="72" viewBox="0 0 72 72"><circle cx="10" cy="36" r="3" fill={color} opacity="0.25"/><circle cx="24" cy="36" r="5" fill={color} opacity="0.45"/><circle cx="40" cy="36" r="7" fill={color} opacity="0.7"/><circle cx="58" cy="36" r="9" fill={color}/><circle cx="53" cy="30" r="3" fill="#fff" opacity="0.35"/></svg>;
    default:
      return <svg width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r="30" fill={color} opacity="0.5"/></svg>;
  }
}

// ── Styles ────────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 900,
    background: "rgba(8,5,2,0.90)",
    display: "flex", alignItems: "center", justifyContent: "center",
    backdropFilter: "blur(8px)",
  },
  panel: {
    width: "min(94vw, 820px)", maxHeight: "90vh",
    background: "linear-gradient(160deg, #1e1408 0%, #120d06 60%, #0e0a04 100%)",
    border: "1px solid rgba(240,181,64,0.22)",
    borderRadius: 18,
    boxShadow: "0 0 80px rgba(240,181,64,0.07), 0 32px 96px rgba(0,0,0,0.75)",
    display: "flex", flexDirection: "column",
    overflow: "hidden",
    position: "relative",
  },
  ambientGlow: {
    position: "absolute", top: 0, left: 0, right: 0, height: 200,
    background: "radial-gradient(ellipse at 50% -20%, rgba(240,181,64,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  header: {
    display: "flex", alignItems: "center", gap: 16,
    padding: "20px 24px 18px", borderBottom: "1px solid rgba(240,181,64,0.12)",
    position: "relative", zIndex: 1,
  },
  headerBrand: { flex: 1, display: "flex", flexDirection: "column", gap: 2 },
  headerEyebrow: {
    fontFamily: "JetBrains Mono, monospace", fontSize: 9,
    color: "rgba(240,181,64,0.5)", letterSpacing: "0.2em", textTransform: "uppercase",
  },
  title: {
    fontFamily: "Fraunces, serif", fontSize: 22, fontWeight: 700,
    color: "#f0b540", letterSpacing: "0.04em",
  },
  gemBadge: {
    display: "flex", alignItems: "center", gap: 6,
    background: "rgba(14,165,233,0.10)", borderRadius: 8,
    padding: "7px 14px", border: "1px solid rgba(14,165,233,0.25)",
  },
  gemCount: {
    fontFamily: "JetBrains Mono, monospace", fontSize: 14, color: "#7dd3fc",
  },
  closeBtn: {
    background: "none", border: "1px solid rgba(240,181,64,0.15)", color: "rgba(240,181,64,0.4)",
    fontSize: 16, cursor: "pointer", padding: "5px 9px", borderRadius: 6,
    transition: "all 0.2s",
    fontFamily: "JetBrains Mono, monospace",
  },
  crateGrid: {
    display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10,
    padding: "20px 20px 8px",
    overflowY: "auto", position: "relative", zIndex: 1,
  },
  crateCard: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "0 0 10px",
    border: "1px solid", borderRadius: 12,
    cursor: "pointer", transition: "all 0.2s",
    gap: 4, overflow: "hidden",
  },
  crateTopBar: {
    width: "100%", height: 3, marginBottom: 10,
    transition: "background 0.2s",
  },
  crateName: {
    fontFamily: "Fraunces, serif", fontSize: 11, fontWeight: 700,
    letterSpacing: "0.04em", textAlign: "center", lineHeight: 1.2,
  },
  crateSubtitle: {
    fontFamily: "JetBrains Mono, monospace", fontSize: 9,
    color: "rgba(197,163,107,0.5)", textAlign: "center", lineHeight: 1.3,
    padding: "0 6px",
  },
  cratePrice: {
    display: "flex", alignItems: "center", gap: 3, marginTop: 4,
  },
  openRow: {
    display: "flex", flexDirection: "column", alignItems: "center",
    gap: 10, padding: "16px 24px 24px", position: "relative", zIndex: 1,
  },
  openBtn: {
    display: "flex", alignItems: "center", gap: 8,
    background: "linear-gradient(135deg, #0369a1, #0ea5e9)",
    border: "none", borderRadius: 10, color: "#e0f2fe",
    fontFamily: "Fraunces, serif", fontSize: 15, fontWeight: 700,
    padding: "12px 32px", cursor: "pointer",
    boxShadow: "0 4px 20px rgba(14,165,233,0.35)",
    transition: "all 0.2s",
  },
  secondaryBtn: {
    background: "rgba(240,181,64,0.08)", border: "1px solid rgba(240,181,64,0.2)",
    borderRadius: 10, color: "#c9a87a", fontFamily: "Fraunces, serif", fontSize: 14,
    padding: "10px 28px", cursor: "pointer", transition: "all 0.2s",
  },
  demoBtn: {
    background: "none", border: "1px dashed rgba(240,181,64,0.15)", borderRadius: 8,
    color: "rgba(240,181,64,0.3)", fontFamily: "JetBrains Mono, monospace", fontSize: 10,
    padding: "5px 14px", cursor: "pointer",
  },
  errorMsg: {
    color: "#f87171", fontFamily: "JetBrains Mono, monospace", fontSize: 12,
  },
  spinArea: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", padding: 60,
    position: "relative", zIndex: 1,
  },
  spinRing: {
    position: "absolute", width: 180, height: 180, borderRadius: "50%",
    border: "1px solid rgba(240,181,64,0.12)",
    boxShadow: "0 0 40px rgba(240,181,64,0.06)",
  },
  openingLabel: {
    color: "#c9a87a", marginTop: 28,
    fontFamily: "Fraunces, serif", fontSize: 18, letterSpacing: "0.08em",
  },
  revealArea: {
    flex: 1, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center",
    padding: "40px 24px", gap: 10, position: "relative", zIndex: 1,
  },
  revealGlow: {
    position: "absolute", inset: 0, pointerEvents: "none",
  },
  rarityTag: {
    fontFamily: "JetBrains Mono, monospace", fontSize: 11, fontWeight: 700,
    letterSpacing: "0.12em", padding: "4px 14px",
    border: "1px solid", borderRadius: 20, textTransform: "uppercase" as const,
    zIndex: 1, display: "inline-block",
  },
  revealIconWrap: {
    zIndex: 1, margin: "8px 0",
  },
  revealName: {
    fontFamily: "Fraunces, serif", fontSize: 28, fontWeight: 700,
    color: "#f5e9d3", zIndex: 1,
  },
  revealCategory: {
    fontFamily: "JetBrains Mono, monospace", fontSize: 10,
    color: "rgba(197,163,107,0.5)", letterSpacing: "0.15em", zIndex: 1,
  },
  duplicateMsg: {
    fontFamily: "JetBrains Mono, monospace", fontSize: 11,
    color: "rgba(240,181,64,0.4)", zIndex: 1,
    border: "1px solid rgba(240,181,64,0.12)", borderRadius: 6,
    padding: "4px 12px",
  },
  revealActions: {
    display: "flex", gap: 12, marginTop: 16, zIndex: 1,
  },
};

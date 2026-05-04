import { useEffect, useState } from "react";
import { addCoins, formatCoins, recordDailyClaim, spendCoins } from "../../lib/coins";
import { formatGems, loadGems, spendGems } from "../../lib/gems";
import { formatCountdown } from "../../lib/daily";
import { grantItem } from "../../lib/inventory";
import { useAuth } from "../../lib/auth";
import { useCoins, useDailyClaim, useInventoryItems } from "../../lib/useEconomy";
import { MARKET_ITEMS, type MarketItem, type MarketCategory } from "../../lib/marketCatalog";
import { RARITY_COLOR, type Rarity } from "../../../../shared/constants";
import { CrateModal } from "./CrateModal";

type MarketModalProps = { open: boolean; onClose: () => void };

type Tab = MarketCategory | "all" | "crates";

const RARITY_ORDER: Rarity[] = ["common","uncommon","rare","epic","legendary","mythic"];
const RARITY_SORT = Object.fromEntries(RARITY_ORDER.map((r, i) => [r, i])) as Record<Rarity, number>;

export function MarketModal({ open, onClose }: MarketModalProps) {
  const { isSignedIn } = useAuth();
  const coins = useCoins();
  const owned = useInventoryItems();
  const { canClaim, secondsLeft } = useDailyClaim();
  const [gems, setGems] = useState(loadGems);
  const [tab, setTab] = useState<Tab>("all");
  const [bumpId, setBumpId] = useState<string | null>(null);
  const [crateOpen, setCrateOpen] = useState(false);

  useEffect(() => {
    const h = () => setGems(loadGems());
    window.addEventListener("slithera-gems-change", h);
    return () => window.removeEventListener("slithera-gems-change", h);
  }, []);

  if (!open) return null;

  const filtered = MARKET_ITEMS
    .filter((it) => tab === "all" || tab === "crates" || it.category === tab)
    .sort((a, b) => RARITY_SORT[b.rarity] - RARITY_SORT[a.rarity]);

  const buy = (item: MarketItem) => {
    if (!isSignedIn) return;
    if (owned.includes(item.id)) return;
    if (item.currency === "gems") {
      const res = spendGems(item.price);
      if (!res.ok) { bump(item.id); return; }
    } else {
      const res = spendCoins(item.price);
      if (!res.ok) { bump(item.id); return; }
    }
    grantItem(item.id);
  };

  const bump = (id: string) => {
    setBumpId(id);
    window.setTimeout(() => setBumpId(null), 600);
  };

  const canAfford = (item: MarketItem) =>
    item.currency === "gems" ? gems >= item.price : coins >= item.price;

  const TABS: { id: Tab; label: string }[] = [
    { id: "all",    label: "All" },
    { id: "skin",   label: "Skins" },
    { id: "hat",    label: "Hats" },
    { id: "charm",  label: "Charms" },
    { id: "trail",  label: "Trails" },
    { id: "crates", label: "Crates" },
  ];

  return (
    <>
      <div style={S.overlay} onClick={onClose}>
        <div style={S.panel} onClick={(e) => e.stopPropagation()}>
          {/* Sidebar */}
          <div style={S.sidebar}>
            <div style={S.sideTitle}>THE VAULT</div>
            <div style={S.sideSubtitle}>Permanent unlocks for refined serpents.</div>

            {/* Currency */}
            <div style={S.currencyBox}>
              <div style={S.currencyRow}>
                <CoinIcon />
                <span style={S.currencyLabel}>Coins</span>
                <span style={S.currencyVal}>{formatCoins(coins)}</span>
              </div>
              <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "8px 0" }} />
              <div style={S.currencyRow}>
                <GemIcon />
                <span style={S.currencyLabel}>Gems</span>
                <span style={{ ...S.currencyVal, color: "#d946ef" }}>{formatGems(gems)}</span>
              </div>
            </div>

            {/* Daily claim */}
            {isSignedIn && (
              canClaim ? (
                <button style={S.claimBtn} onClick={() => { addCoins(500); recordDailyClaim(); }}>
                  ✦ Claim 500 daily coins
                </button>
              ) : (
                <div style={S.claimCooldown}>Resets in {formatCountdown(secondsLeft)}</div>
              )
            )}
            {!isSignedIn && <div style={S.lockedNote}>Sign in to purchase</div>}

            {/* Crate CTA */}
            <button style={S.crateBtn} onClick={() => setCrateOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 64 54" fill="none" style={{ flexShrink: 0 }}>
                <rect x="4" y="18" width="56" height="32" rx="4" fill="#1e1040" stroke="#a855f7" strokeWidth="2"/>
                <rect x="2" y="12" width="60" height="12" rx="3" fill="#2a1860" stroke="#a855f7" strokeWidth="2"/>
                <rect x="26" y="8" width="12" height="16" rx="2" fill="#a855f7"/>
              </svg>
              Open Crates
            </button>

            {/* Tabs */}
            <nav style={S.nav}>
              {TABS.map(({ id, label }) => (
                <button
                  key={id}
                  style={{ ...S.navTab, ...(tab === id ? S.navTabActive : {}) }}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div style={S.content}>
            <div style={S.contentHeader}>
              <span style={S.contentTitle}>
                {tab === "all" ? "All Items" :
                 tab === "crates" ? "Crate Shop" :
                 tab[0].toUpperCase() + tab.slice(1) + "s"}
              </span>
              <span style={S.itemCount}>{tab === "crates" ? 5 : filtered.length} items</span>
            </div>

            {tab === "crates" ? (
              <CrateShopPreview onOpenCrates={() => setCrateOpen(true)} gems={gems} />
            ) : (
              <div style={S.grid}>
                {filtered.map((item) => {
                  const isOwned = owned.includes(item.id);
                  const affordable = canAfford(item);
                  const isBumped = bumpId === item.id;
                  const rc = RARITY_COLOR[item.rarity as Rarity] ?? "#aaa";
                  return (
                    <div
                      key={item.id}
                      style={{
                        ...S.card,
                        borderColor: isOwned ? `${rc}55` : `${rc}22`,
                        background: isOwned
                          ? `linear-gradient(135deg, ${rc}12, ${rc}06)`
                          : "rgba(255,255,255,0.025)",
                        transform: isBumped ? "translateX(-4px)" : "none",
                        transition: isBumped ? "none" : "all 0.2s",
                      }}
                    >
                      {/* Rarity accent bar */}
                      <div style={{ ...S.rarityBar, background: rc }} />

                      <ItemIcon category={item.category} rarity={item.rarity as Rarity} />

                      <div style={S.cardName}>{item.name}</div>
                      <div style={{ ...S.cardRarity, color: rc }}>{item.rarity.toUpperCase()}</div>
                      <div style={S.cardTagline}>{item.tagline}</div>

                      <button
                        style={{
                          ...S.buyBtn,
                          ...(isOwned ? S.buyOwned : affordable && isSignedIn ? S.buyActive : S.buyDisabled),
                        }}
                        onClick={() => buy(item)}
                        disabled={isOwned || !isSignedIn}
                      >
                        {isOwned ? "Owned" : (
                          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            {item.currency === "gems" ? <GemIcon size={11} /> : <CoinIcon size={11} />}
                            {item.currency === "gems" ? formatGems(item.price) : formatCoins(item.price)}
                          </span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>
      </div>

      {crateOpen && <CrateModal onClose={() => setCrateOpen(false)} />}
    </>
  );
}

// ── Crate shop preview ───────────────────────────────────────────────────────

function CrateShopPreview({ onOpenCrates, gems }: { onOpenCrates: () => void; gems: number }) {
  const { CRATES } = require("../../lib/crates") as typeof import("../../lib/crates");
  return (
    <div style={{ padding: "20px 24px" }}>
      <div style={{ fontFamily: "Fraunces, serif", color: "#e9d5ff", fontSize: 16, marginBottom: 16 }}>
        5 crate tiers — the rarer the crate, the rarer the drop.
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
        {CRATES.map((c) => (
          <div key={c.id} style={{
            border: `1px solid ${c.color}44`, borderRadius: 12,
            padding: "16px 12px", textAlign: "center",
            background: `linear-gradient(135deg, ${c.color}10, transparent)`,
          }}>
            <svg width="48" height="40" viewBox="0 0 64 54" fill="none" style={{ filter: `drop-shadow(0 0 6px ${c.color})` }}>
              <rect x="4" y="18" width="56" height="32" rx="4" fill="#111827" stroke={c.color} strokeWidth="2"/>
              <rect x="2" y="12" width="60" height="12" rx="3" fill="#1e2a3a" stroke={c.color} strokeWidth="2"/>
              <rect x="26" y="8" width="12" height="16" rx="2" fill={c.color}/>
            </svg>
            <div style={{ fontFamily: "Fraunces, serif", color: c.color, fontSize: 11, fontWeight: 700, marginTop: 8 }}>{c.name}</div>
            <div style={{ fontFamily: "JetBrains Mono, monospace", color: "#888", fontSize: 9, margin: "4px 0" }}>{c.subtitle}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3, marginTop: 6 }}>
              <GemIcon size={10} />
              <span style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: gems >= c.price ? "#e9d5ff" : "#664444" }}>{c.price.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
      <button style={{ ...S.buyActive, ...S.buyBtn, marginTop: 24, width: "100%", justifyContent: "center", fontSize: 15 }} onClick={onOpenCrates}>
        <svg width="16" height="14" viewBox="0 0 64 54" fill="none">
          <rect x="4" y="18" width="56" height="32" rx="4" fill="#1e1040" stroke="#a855f7" strokeWidth="2.5"/>
          <rect x="2" y="12" width="60" height="12" rx="3" fill="#2a1860" stroke="#a855f7" strokeWidth="2.5"/>
          <rect x="26" y="8" width="12" height="16" rx="2" fill="#a855f7"/>
        </svg>
        Open Crate Vault
      </button>
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────

function GemIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <polygon points="8,1 14,5 14,11 8,15 2,11 2,5" fill="#a855f7" stroke="#d946ef" strokeWidth="1"/>
      <polygon points="8,4 11,6.5 11,9.5 8,12 5,9.5 5,6.5" fill="#7c3aed" opacity="0.6"/>
      <circle cx="6" cy="6" r="1.5" fill="#fff" opacity="0.35"/>
    </svg>
  );
}

function CoinIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "inline-block", verticalAlign: "middle" }}>
      <circle cx="8" cy="8" r="7" fill="#d4a827" stroke="#ffd24d" strokeWidth="1"/>
      <circle cx="8" cy="8" r="4.5" fill="#c8951a" opacity="0.6"/>
      <circle cx="6" cy="6" r="1.5" fill="#fff" opacity="0.3"/>
    </svg>
  );
}

function ItemIcon({ category, rarity }: { category: string; rarity: Rarity }) {
  const color = RARITY_COLOR[rarity] ?? "#aaa";
  const s = 36;
  switch (category) {
    case "skin":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="16" fill={color} opacity="0.15"/>
          <circle cx="20" cy="20" r="10" fill={color} opacity="0.5"/>
          <circle cx="20" cy="20" r="5" fill={color}/>
          <circle cx="15" cy="15" r="2" fill="#fff" opacity="0.35"/>
        </svg>
      );
    case "hat":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          <polygon points="20,6 32,28 8,28" fill={color} opacity="0.8"/>
          <rect x="6" y="28" width="28" height="6" rx="2" fill={color}/>
          <circle cx="20" cy="6" r="2.5" fill="#fff" opacity="0.4"/>
        </svg>
      );
    case "charm":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          <polygon points="20,5 34,13 34,27 20,35 6,27 6,13" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5"/>
          <polygon points="20,11 28,16 28,24 20,29 12,24 12,16" fill={color} opacity="0.55"/>
          <circle cx="20" cy="20" r="5" fill="#fff" opacity="0.2"/>
        </svg>
      );
    case "trail":
      return (
        <svg width={s} height={s} viewBox="0 0 40 40">
          <circle cx="7" cy="20" r="2" fill={color} opacity="0.25"/>
          <circle cx="14" cy="20" r="3" fill={color} opacity="0.45"/>
          <circle cx="22" cy="20" r="4" fill={color} opacity="0.65"/>
          <circle cx="31" cy="20" r="6" fill={color}/>
          <circle cx="28" cy="17" r="2" fill="#fff" opacity="0.35"/>
        </svg>
      );
    default:
      return <svg width={s} height={s} viewBox="0 0 40 40"><circle cx="20" cy="20" r="14" fill={color} opacity="0.5"/></svg>;
  }
}

// ── Styles ───────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 800,
    background: "rgba(2,3,8,0.85)", backdropFilter: "blur(8px)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  panel: {
    width: "min(96vw, 1080px)", height: "min(90vh, 700px)",
    background: "linear-gradient(160deg, #0b0b18 0%, #070710 100%)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 18,
    boxShadow: "0 0 80px rgba(124,58,237,0.1), 0 30px 100px rgba(0,0,0,0.7)",
    display: "flex", overflow: "hidden", position: "relative",
  },
  closeBtn: {
    position: "absolute", top: 16, right: 16,
    background: "none", border: "none", color: "#555",
    fontSize: 18, cursor: "pointer", zIndex: 10, padding: "4px 8px",
  },
  sidebar: {
    width: 220, flexShrink: 0,
    background: "rgba(255,255,255,0.025)",
    borderRight: "1px solid rgba(255,255,255,0.05)",
    padding: "28px 20px", display: "flex", flexDirection: "column", gap: 14,
    overflow: "hidden",
  },
  sideTitle: {
    fontFamily: "Fraunces, serif", fontSize: 20, fontWeight: 700,
    color: "#e9d5ff", letterSpacing: "0.1em",
  },
  sideSubtitle: {
    fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#555",
    lineHeight: 1.5,
  },
  currencyBox: {
    background: "rgba(0,0,0,0.3)", borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.06)",
    padding: "12px 14px",
  },
  currencyRow: {
    display: "flex", alignItems: "center", gap: 8,
  },
  currencyLabel: {
    fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#666", flex: 1,
  },
  currencyVal: {
    fontFamily: "JetBrains Mono, monospace", fontSize: 13, color: "#d4a827", fontWeight: 700,
  },
  claimBtn: {
    background: "linear-gradient(135deg, #92400e, #b45309)",
    border: "none", borderRadius: 8, color: "#fde68a",
    fontFamily: "JetBrains Mono, monospace", fontSize: 11, fontWeight: 700,
    padding: "9px 12px", cursor: "pointer", textAlign: "left",
  },
  claimCooldown: {
    fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#554433",
    textAlign: "center",
  },
  lockedNote: {
    fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#443333",
    textAlign: "center",
  },
  crateBtn: {
    display: "flex", alignItems: "center", gap: 8,
    background: "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(168,85,247,0.15))",
    border: "1px solid rgba(168,85,247,0.4)", borderRadius: 9,
    color: "#c084fc", fontFamily: "Fraunces, serif", fontSize: 13, fontWeight: 700,
    padding: "10px 12px", cursor: "pointer",
    boxShadow: "0 0 16px rgba(168,85,247,0.15)",
    transition: "all 0.2s",
  },
  nav: {
    display: "flex", flexDirection: "column", gap: 2, marginTop: 8,
  },
  navTab: {
    background: "none", border: "none",
    color: "#555", fontFamily: "JetBrains Mono, monospace", fontSize: 11,
    padding: "8px 12px", borderRadius: 7, cursor: "pointer",
    textAlign: "left", transition: "all 0.15s", letterSpacing: "0.04em",
  },
  navTabActive: {
    background: "rgba(255,255,255,0.07)", color: "#e9d5ff",
  },
  content: {
    flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
  },
  contentHeader: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "22px 24px 14px",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  contentTitle: {
    fontFamily: "Fraunces, serif", fontSize: 18, color: "#ddd", flex: 1,
  },
  itemCount: {
    fontFamily: "JetBrains Mono, monospace", fontSize: 10, color: "#444",
  },
  grid: {
    flex: 1, overflowY: "auto",
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(148px, 1fr))",
    gap: 10, padding: "16px 20px",
    alignContent: "start",
  },
  card: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "14px 10px 12px",
    border: "1px solid", borderRadius: 12,
    position: "relative", gap: 4,
    overflow: "hidden",
  },
  rarityBar: {
    position: "absolute", top: 0, left: 0, right: 0, height: 2,
    opacity: 0.7,
  },
  cardName: {
    fontFamily: "Fraunces, serif", fontSize: 12, fontWeight: 700,
    color: "#ddd", textAlign: "center", marginTop: 6,
  },
  cardRarity: {
    fontFamily: "JetBrains Mono, monospace", fontSize: 9,
    letterSpacing: "0.08em",
  },
  cardTagline: {
    fontFamily: "JetBrains Mono, monospace", fontSize: 9,
    color: "#555", textAlign: "center", lineHeight: 1.4,
    flex: 1, display: "flex", alignItems: "center",
  },
  buyBtn: {
    border: "none", borderRadius: 7, fontSize: 11,
    padding: "6px 12px", cursor: "pointer", width: "100%",
    fontFamily: "JetBrains Mono, monospace", fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
    marginTop: 6,
  },
  buyActive: {
    background: "linear-gradient(135deg, #1e3a5f, #2563eb)",
    color: "#fff",
  },
  buyOwned: {
    background: "rgba(255,255,255,0.05)", color: "#555", cursor: "default",
  },
  buyDisabled: {
    background: "rgba(255,255,255,0.03)", color: "#3a3a3a", cursor: "not-allowed",
  },
};

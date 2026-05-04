import { useEffect, useRef, useState } from "react";
import { addCoins, formatCoins, recordDailyClaim, spendCoins } from "../../lib/coins";
import { formatGems, loadGems, spendGems } from "../../lib/gems";
import { formatCountdown } from "../../lib/daily";
import { grantItem } from "../../lib/inventory";
import { useAuth } from "../../lib/auth";
import { useCoins, useDailyClaim, useInventoryItems } from "../../lib/useEconomy";
import { MARKET_ITEMS, type MarketItem, type MarketCategory } from "../../lib/marketCatalog";
import { CRATES } from "../../lib/crates";
import { RARITY_COLOR, type Rarity } from "../../../../shared/constants";
import { CrateModal } from "./CrateModal";

type MarketModalProps = { open: boolean; onClose: () => void };
type Tab = MarketCategory | "all" | "crates";

const RARITY_ORDER: Rarity[] = ["mythic","legendary","epic","rare","uncommon","common"];
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
  const [hoverId, setHoverId] = useState<string | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = () => setGems(loadGems());
    window.addEventListener("slithera-gems-change", h);
    return () => window.removeEventListener("slithera-gems-change", h);
  }, []);

  // Reset scroll on tab change
  useEffect(() => {
    gridRef.current?.scrollTo({ top: 0 });
  }, [tab]);

  if (!open) return null;

  const filtered = MARKET_ITEMS
    .filter((it) => tab === "all" || tab === "crates" || it.category === tab)
    .sort((a, b) => RARITY_SORT[a.rarity] - RARITY_SORT[b.rarity]);

  const buy = (item: MarketItem) => {
    if (!isSignedIn || owned.includes(item.id)) return;
    if (item.currency === "gems") {
      if (!spendGems(item.price).ok) { bump(item.id); return; }
    } else {
      if (!spendCoins(item.price).ok) { bump(item.id); return; }
    }
    grantItem(item.id);
  };

  const bump = (id: string) => {
    setBumpId(id);
    window.setTimeout(() => setBumpId(null), 500);
  };

  const canAfford = (item: MarketItem) =>
    item.currency === "gems" ? gems >= item.price : coins >= item.price;

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: "all",    label: "All",    count: MARKET_ITEMS.length },
    { id: "skin",   label: "Skins",  count: MARKET_ITEMS.filter(i=>i.category==="skin").length },
    { id: "hat",    label: "Hats",   count: MARKET_ITEMS.filter(i=>i.category==="hat").length },
    { id: "charm",  label: "Charms", count: MARKET_ITEMS.filter(i=>i.category==="charm").length },
    { id: "trail",  label: "Trails", count: MARKET_ITEMS.filter(i=>i.category==="trail").length },
    { id: "crates", label: "Crates", count: CRATES.length },
  ];

  return (
    <>
      <div style={S.overlay} onClick={onClose}>
        <div style={S.panel} onClick={e => e.stopPropagation()}>

          {/* ── Sidebar ─────────────────────────────────── */}
          <aside style={S.sidebar}>
            <div style={S.sideInner}>
              <div style={S.brandMark}>THE VAULT</div>
              <div style={S.brandSub}>Curated relics for refined serpents.</div>

              {/* Currency block */}
              <div style={S.currencyBlock}>
                <div style={S.currRow}>
                  <span style={S.currIcon}>◉</span>
                  <span style={S.currLabel}>Coins</span>
                  <span style={S.currVal}>{formatCoins(coins)}</span>
                </div>
                <div style={S.divider} />
                <div style={S.currRow}>
                  <GemSvg size={13} />
                  <span style={S.currLabel}>Gems</span>
                  <span style={{ ...S.currVal, color: "#7dd4fc" }}>{formatGems(gems)}</span>
                </div>
              </div>

              {/* Daily claim */}
              {isSignedIn ? (
                canClaim ? (
                  <button style={S.claimBtn} onClick={() => { addCoins(500); recordDailyClaim(); }}>
                    ✦ Claim 500 coins
                  </button>
                ) : (
                  <div style={S.cooldown}>Resets in {formatCountdown(secondsLeft)}</div>
                )
              ) : (
                <div style={S.cooldown}>Sign in to purchase</div>
              )}

              {/* Crate CTA */}
              <button style={S.crateCtaBtn} onClick={() => setCrateOpen(true)}>
                <CrateMinisv />
                Open Crates
              </button>

              {/* Nav */}
              <nav style={S.nav}>
                {TABS.map(({ id, label, count }) => (
                  <button
                    key={id}
                    style={{ ...S.navItem, ...(tab === id ? S.navItemActive : {}) }}
                    onClick={() => setTab(id)}
                  >
                    <span>{label}</span>
                    {count !== undefined && (
                      <span style={{ ...S.navCount, ...(tab === id ? S.navCountActive : {}) }}>{count}</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────── */}
          <main style={S.main}>
            <div style={S.topbar}>
              <h2 style={S.topTitle}>
                {tab === "all" ? "All Items" : tab === "crates" ? "Crate Shop" : tab[0].toUpperCase() + tab.slice(1) + "s"}
              </h2>
              <span style={S.topCount}>
                {tab === "crates" ? CRATES.length : filtered.length} items
              </span>
            </div>

            <div ref={gridRef} style={S.scrollArea}>
              {tab === "crates" ? (
                <CrateShopGrid onOpen={() => setCrateOpen(true)} gems={gems} />
              ) : (
                <div style={S.grid}>
                  {filtered.map(item => {
                    const isOwned = owned.includes(item.id);
                    const affordable = canAfford(item);
                    const bumped = bumpId === item.id;
                    const hovered = hoverId === item.id;
                    const rc = RARITY_COLOR[item.rarity as Rarity] ?? "#8a7d68";
                    return (
                      <article
                        key={item.id}
                        style={{
                          ...S.card,
                          ...(isOwned ? S.cardOwned : {}),
                          ...(hovered && !isOwned ? S.cardHover : {}),
                          ...(bumped ? S.cardBump : {}),
                          borderColor: hovered ? `${rc}66` : isOwned ? `${rc}44` : "rgba(245,233,211,0.07)",
                        }}
                        onMouseEnter={() => setHoverId(item.id)}
                        onMouseLeave={() => setHoverId(null)}
                      >
                        <div style={{ ...S.rarityStripe, background: rc, opacity: isOwned ? 0.4 : 0.85 }} />
                        <ItemIcon category={item.category} rarity={item.rarity as Rarity} size={38} />
                        <div style={S.cardName}>{item.name}</div>
                        <div style={{ ...S.cardRarity, color: rc }}>{item.rarity.toUpperCase()}</div>
                        <div style={S.cardTagline}>{item.tagline}</div>
                        <BuyButton
                          item={item}
                          isOwned={isOwned}
                          affordable={affordable}
                          isSignedIn={isSignedIn}
                          onBuy={() => buy(item)}
                        />
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </main>

          <button style={S.closeBtn} onClick={onClose} aria-label="Close">✕</button>
        </div>
      </div>
      {crateOpen && <CrateModal onClose={() => setCrateOpen(false)} />}
    </>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function BuyButton({ item, isOwned, affordable, isSignedIn, onBuy }: {
  item: MarketItem; isOwned: boolean; affordable: boolean; isSignedIn: boolean; onBuy: () => void;
}) {
  if (isOwned) return <div style={S.ownedTag}>✓ Owned</div>;
  const gemBuy = item.currency === "gems";
  const active = affordable && isSignedIn;
  return (
    <button
      style={{
        ...S.buyBtn,
        ...(active ? (gemBuy ? S.buyGem : S.buyGold) : S.buyLocked),
      }}
      onClick={active ? onBuy : undefined}
      disabled={!active}
    >
      {gemBuy ? <GemSvg size={11} /> : <span style={{ color: "#f0b540", fontSize: 11 }}>◉</span>}
      <span>{gemBuy ? formatGems(item.price) : formatCoins(item.price)}</span>
    </button>
  );
}

function CrateShopGrid({ onOpen, gems }: { onOpen: () => void; gems: number }) {
  return (
    <div style={{ padding: "24px 28px" }}>
      <p style={{ fontFamily: "'Fraunces', serif", color: "#c4b59a", fontSize: 14, marginBottom: 20, lineHeight: 1.6 }}>
        Five tiers of crates — each guaranteeing rarer drops than the last.<br/>
        <span style={{ color: "#8a7d68", fontSize: 12 }}>Gems can be earned through hard gameplay or purchased.</span>
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 14 }}>
        {CRATES.map(c => (
          <div key={c.id} style={{
            background: `linear-gradient(160deg, rgba(20,14,8,0.9), rgba(14,10,6,0.95))`,
            border: `1px solid ${c.color}33`,
            borderRadius: 12,
            padding: "20px 16px",
            textAlign: "center",
          }}>
            <div style={{ filter: `drop-shadow(0 0 8px ${c.color})`, marginBottom: 12 }}>
              <CrateSvg color={c.color} size={52} />
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", color: c.color, fontSize: 13, fontWeight: 700 }}>{c.name}</div>
            <div style={{ fontFamily: "Outfit, sans-serif", color: "#6a5a48", fontSize: 10, margin: "4px 0 10px", lineHeight: 1.4 }}>{c.subtitle}</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
              <GemSvg size={12} />
              <span style={{ fontFamily: "Outfit, sans-serif", fontSize: 13, fontWeight: 700, color: gems >= c.price ? "#7dd4fc" : "#5a3a3a" }}>{c.price.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
      <button style={{ ...S.openCratesBtn }} onClick={onOpen}>
        <CrateMinisv /> Open the Crate Vault
      </button>
    </div>
  );
}

function ItemIcon({ category, rarity, size }: { category: string; rarity: Rarity; size: number }) {
  const c = RARITY_COLOR[rarity] ?? "#8a7d68";
  const s = size;
  switch (category) {
    case "skin": return (
      <svg width={s} height={s} viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="17" fill={c} opacity="0.08"/>
        <circle cx="20" cy="20" r="11" fill={c} opacity="0.25"/>
        <circle cx="20" cy="20" r="6" fill={c} opacity="0.8"/>
        <circle cx="15" cy="15" r="2.2" fill="#fff" opacity="0.28"/>
        <circle cx="20" cy="20" r="17" fill="none" stroke={c} strokeWidth="1" opacity="0.4"/>
      </svg>
    );
    case "hat": return (
      <svg width={s} height={s} viewBox="0 0 40 40">
        <polygon points="20,6 33,30 7,30" fill={c} opacity="0.75"/>
        <polygon points="20,6 33,30 7,30" fill="none" stroke={c} strokeWidth="1" opacity="0.4"/>
        <rect x="5" y="30" width="30" height="5" rx="2" fill={c} opacity="0.9"/>
        <circle cx="20" cy="6" r="2.5" fill="#fff" opacity="0.3"/>
      </svg>
    );
    case "charm": return (
      <svg width={s} height={s} viewBox="0 0 40 40">
        <polygon points="20,4 35,12 35,28 20,36 5,28 5,12" fill={c} opacity="0.1" stroke={c} strokeWidth="1.2"/>
        <polygon points="20,10 29,16 29,24 20,30 11,24 11,16" fill={c} opacity="0.55"/>
        <circle cx="20" cy="20" r="4" fill="#fff" opacity="0.2"/>
        <circle cx="16" cy="16" r="1.5" fill="#fff" opacity="0.25"/>
      </svg>
    );
    case "trail": return (
      <svg width={s} height={s} viewBox="0 0 40 40">
        <circle cx="6" cy="20" r="2" fill={c} opacity="0.2"/>
        <circle cx="13" cy="20" r="3" fill={c} opacity="0.4"/>
        <circle cx="21" cy="20" r="4.5" fill={c} opacity="0.6"/>
        <circle cx="31" cy="20" r="7" fill={c} opacity="0.9"/>
        <circle cx="28" cy="17" r="2.2" fill="#fff" opacity="0.3"/>
      </svg>
    );
    default: return <svg width={s} height={s} viewBox="0 0 40 40"><circle cx="20" cy="20" r="14" fill={c} opacity="0.4"/></svg>;
  }
}

function GemSvg({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: "inline-block", verticalAlign: "middle", flexShrink: 0 }}>
      <polygon points="8,1 13,5 13,11 8,15 3,11 3,5" fill="#0ea5e9" opacity="0.9" stroke="#7dd4fc" strokeWidth="0.8"/>
      <polygon points="8,4 11,6.5 11,9.5 8,12 5,9.5 5,6.5" fill="#0284c7" opacity="0.7"/>
      <circle cx="6.5" cy="6" r="1.2" fill="#fff" opacity="0.4"/>
    </svg>
  );
}

function CrateSvg({ color, size = 48 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={Math.round(size * 0.83)} viewBox="0 0 60 50" fill="none">
      <rect x="3" y="18" width="54" height="28" rx="4" fill="#14100c" stroke={color} strokeWidth="1.5"/>
      <rect x="1" y="12" width="58" height="11" rx="3" fill="#1a140e" stroke={color} strokeWidth="1.5"/>
      <rect x="24" y="7" width="12" height="15" rx="2" fill={color} opacity="0.9"/>
      <rect x="26" y="9" width="8" height="3.5" rx="1" fill="#fff" opacity="0.25"/>
      <rect x="3" y="27" width="54" height="3" fill={color} opacity="0.25"/>
      {[[9,21],[51,21],[9,41],[51,41]].map(([cx,cy],i) => (
        <circle key={i} cx={cx} cy={cy} r="2.2" fill={color} opacity="0.6"/>
      ))}
    </svg>
  );
}

function CrateMinisv() {
  return (
    <svg width="16" height="14" viewBox="0 0 60 50" fill="none" style={{ flexShrink: 0 }}>
      <rect x="3" y="18" width="54" height="28" rx="4" fill="#14100c" stroke="#f0b540" strokeWidth="2"/>
      <rect x="1" y="12" width="58" height="11" rx="3" fill="#1a140e" stroke="#f0b540" strokeWidth="2"/>
      <rect x="24" y="7" width="12" height="15" rx="2" fill="#f0b540"/>
    </svg>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 800,
    background: "rgba(6,4,2,0.82)", backdropFilter: "blur(10px)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  panel: {
    width: "min(96vw, 1060px)", height: "min(88vh, 680px)",
    background: "linear-gradient(155deg, #14100c 0%, #0e0a06 60%, #120e09 100%)",
    border: "1px solid rgba(245,233,211,0.09)",
    borderRadius: 16,
    boxShadow: "0 0 0 1px rgba(240,181,64,0.06), 0 32px 80px rgba(0,0,0,0.75), inset 0 1px 0 rgba(245,233,211,0.05)",
    display: "flex", overflow: "hidden", position: "relative",
  },
  closeBtn: {
    position: "absolute", top: 14, right: 14, zIndex: 10,
    background: "none", border: "none", color: "#3a2e24",
    fontSize: 16, cursor: "pointer", padding: "4px 8px", borderRadius: 6,
    transition: "color 0.2s", lineHeight: 1,
  },

  // ── Sidebar ───────────────────────────────────────────────────────────────
  sidebar: {
    width: 210, flexShrink: 0,
    background: "linear-gradient(180deg, #12100b 0%, #0f0c08 100%)",
    borderRight: "1px solid rgba(245,233,211,0.06)",
    display: "flex", flexDirection: "column",
    position: "relative", overflow: "hidden",
  },
  sideInner: {
    flex: 1, overflowY: "auto", padding: "26px 18px 20px",
    display: "flex", flexDirection: "column", gap: 14,
  },
  brandMark: {
    fontFamily: "'Fraunces', Georgia, serif", fontSize: 18, fontWeight: 900,
    color: "#f0b540", letterSpacing: "0.12em",
    textShadow: "0 0 20px rgba(240,181,64,0.25)",
  },
  brandSub: {
    fontFamily: "Outfit, sans-serif", fontSize: 10, color: "#6a5a48",
    lineHeight: 1.5,
  },
  currencyBlock: {
    background: "rgba(0,0,0,0.3)", borderRadius: 8,
    border: "1px solid rgba(245,233,211,0.07)",
    padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8,
  },
  currRow: {
    display: "flex", alignItems: "center", gap: 7,
  },
  currIcon: {
    color: "#f0b540", fontSize: 12, lineHeight: 1,
  },
  currLabel: {
    fontFamily: "Outfit, sans-serif", fontSize: 10, color: "#6a5a48", flex: 1,
  },
  currVal: {
    fontFamily: "Outfit, sans-serif", fontSize: 13, fontWeight: 700, color: "#f0b540",
  },
  divider: {
    height: 1, background: "rgba(245,233,211,0.06)",
  },
  claimBtn: {
    background: "linear-gradient(135deg, #2d1f12, #3d2a18)",
    border: "1px solid rgba(240,181,64,0.3)", borderRadius: 8,
    color: "#f0b540", fontFamily: "Outfit, sans-serif", fontSize: 11, fontWeight: 700,
    padding: "8px 10px", cursor: "pointer", textAlign: "left",
    boxShadow: "0 0 12px rgba(240,181,64,0.08)",
    transition: "all 0.2s",
  },
  cooldown: {
    fontFamily: "Outfit, sans-serif", fontSize: 10, color: "#4a3a2a", textAlign: "center",
  },
  crateCtaBtn: {
    display: "flex", alignItems: "center", gap: 8,
    background: "linear-gradient(135deg, #2a1e0e, #1e1608)",
    border: "1px solid rgba(240,181,64,0.25)", borderRadius: 9,
    color: "#d4a827", fontFamily: "'Fraunces', Georgia, serif", fontSize: 12, fontWeight: 700,
    padding: "9px 12px", cursor: "pointer",
    boxShadow: "0 0 14px rgba(212,168,39,0.1)",
    transition: "all 0.2s",
  },
  nav: {
    display: "flex", flexDirection: "column", gap: 1, marginTop: 4,
  },
  navItem: {
    display: "flex", alignItems: "center",
    background: "none", border: "none",
    color: "#6a5a48", fontFamily: "Outfit, sans-serif", fontSize: 12,
    padding: "7px 10px", borderRadius: 6, cursor: "pointer",
    textAlign: "left", transition: "all 0.15s",
    justifyContent: "space-between",
  },
  navItemActive: {
    background: "rgba(240,181,64,0.08)",
    color: "#f5e9d3",
    borderLeft: "2px solid #f0b540",
    paddingLeft: 8,
  },
  navCount: {
    background: "rgba(245,233,211,0.06)", borderRadius: 10,
    padding: "1px 6px", fontSize: 9, color: "#4a3a2a",
  },
  navCountActive: {
    background: "rgba(240,181,64,0.12)", color: "#d4a827",
  },

  // ── Main ───────────────────────────────────────────────────────────────────
  main: {
    flex: 1, display: "flex", flexDirection: "column", overflow: "hidden",
    minWidth: 0,
  },
  topbar: {
    display: "flex", alignItems: "center", gap: 12,
    padding: "20px 24px 14px",
    borderBottom: "1px solid rgba(245,233,211,0.05)",
    flexShrink: 0,
  },
  topTitle: {
    fontFamily: "'Fraunces', Georgia, serif", fontSize: 20, fontWeight: 700,
    color: "#f5e9d3", margin: 0, flex: 1, letterSpacing: "0.02em",
  },
  topCount: {
    fontFamily: "Outfit, sans-serif", fontSize: 10, color: "#4a3a2a",
  },
  scrollArea: {
    flex: 1, overflowY: "auto",
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(240,181,64,0.15) transparent",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
    gap: 10, padding: "16px 20px",
    alignContent: "start",
  },

  // ── Cards ─────────────────────────────────────────────────────────────────
  card: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "14px 10px 12px",
    border: "1px solid rgba(245,233,211,0.07)",
    borderRadius: 11,
    position: "relative", gap: 3,
    overflow: "hidden",
    background: "linear-gradient(160deg, rgba(26,20,14,0.9), rgba(18,14,10,0.95))",
    transition: "border-color 0.2s, box-shadow 0.2s, transform 0.15s",
    cursor: "default",
  },
  cardOwned: {
    background: "linear-gradient(160deg, rgba(22,18,12,0.85), rgba(16,12,8,0.9))",
  },
  cardHover: {
    transform: "translateY(-1px)",
    boxShadow: "0 6px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(240,181,64,0.06)",
  },
  cardBump: {
    transform: "translateX(-5px)",
    boxShadow: "inset 0 0 0 1px rgba(232,90,79,0.4)",
  },
  rarityStripe: {
    position: "absolute", top: 0, left: 0, right: 0, height: 2, borderRadius: "11px 11px 0 0",
  },
  cardName: {
    fontFamily: "'Fraunces', Georgia, serif", fontSize: 12, fontWeight: 700,
    color: "#f5e9d3", textAlign: "center", marginTop: 6, lineHeight: 1.2,
  },
  cardRarity: {
    fontFamily: "Outfit, sans-serif", fontSize: 9, fontWeight: 700,
    letterSpacing: "0.08em", lineHeight: 1,
  },
  cardTagline: {
    fontFamily: "Outfit, sans-serif", fontSize: 9,
    color: "#5a4a38", textAlign: "center", lineHeight: 1.35,
    flex: 1, display: "flex", alignItems: "center", minHeight: 28,
    paddingTop: 2,
  },

  // ── Buttons ───────────────────────────────────────────────────────────────
  ownedTag: {
    fontFamily: "Outfit, sans-serif", fontSize: 10, color: "#6a5a48",
    padding: "5px 10px", border: "1px solid rgba(245,233,211,0.08)",
    borderRadius: 6, marginTop: 4, width: "100%", textAlign: "center",
  },
  buyBtn: {
    border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700,
    padding: "6px 10px", cursor: "pointer", width: "100%", marginTop: 4,
    fontFamily: "Outfit, sans-serif",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
    transition: "opacity 0.15s",
  },
  buyGold: {
    background: "linear-gradient(135deg, #2d1f0a, #3d2c12)",
    color: "#f0b540", border: "1px solid rgba(240,181,64,0.3)",
    boxShadow: "0 0 10px rgba(240,181,64,0.08)",
  },
  buyGem: {
    background: "linear-gradient(135deg, #0a1a2d, #0e2040)",
    color: "#7dd4fc", border: "1px solid rgba(125,212,252,0.25)",
    boxShadow: "0 0 10px rgba(14,165,233,0.1)",
  },
  buyLocked: {
    background: "rgba(20,14,8,0.5)", color: "#3a2e24",
    border: "1px solid rgba(245,233,211,0.04)", cursor: "not-allowed",
  },

  // ── Crate shop ────────────────────────────────────────────────────────────
  openCratesBtn: {
    marginTop: 20, width: "100%", padding: "12px 20px",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
    background: "linear-gradient(135deg, #2d1f0a, #3d2c12)",
    border: "1px solid rgba(240,181,64,0.35)", borderRadius: 10,
    color: "#f0b540", fontFamily: "'Fraunces', Georgia, serif",
    fontSize: 15, fontWeight: 700, cursor: "pointer",
    boxShadow: "0 0 20px rgba(240,181,64,0.1)",
    transition: "all 0.2s",
  },
};

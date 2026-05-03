import { useEffect, useState } from "react";
import { addCoins, formatCoins, loadCoins, spendCoins } from "../../lib/coins";
import { grantItem, loadInventory } from "../../lib/inventory";
import { useAuth } from "../../lib/auth";
import { WardrobeModal } from "./WardrobeModal";

type MarketModalProps = { open: boolean; onClose: () => void };

type MarketItem = {
  id: string;
  name: string;
  category: "skin" | "hat" | "charm";
  glyph: string;
  price: number;
  rarity: "common" | "rare" | "epic" | "myth";
  tagline: string;
};

const ITEMS: MarketItem[] = [
  { id: "skin.solar-gold", name: "Solar Gold", category: "skin", glyph: "🐍", price: 1500, rarity: "rare", tagline: "Liquid sunlight in a coil." },
  { id: "skin.rainbow", name: "Rainbow", category: "skin", glyph: "🌈", price: 5000, rarity: "myth", tagline: "All hues, in motion." },
  { id: "skin.tide", name: "Tide", category: "skin", glyph: "🌊", price: 2200, rarity: "rare", tagline: "Calm only at the deep." },
  { id: "skin.coal", name: "Coal", category: "skin", glyph: "🜚", price: 3000, rarity: "epic", tagline: "Embers under ash." },
  { id: "hat.crown", name: "The Crown", category: "hat", glyph: "👑", price: 4000, rarity: "myth", tagline: "Won by sustained dominance." },
  { id: "hat.wizard", name: "Wizard", category: "hat", glyph: "🧙", price: 1800, rarity: "rare", tagline: "Now where did I leave my staff…" },
  { id: "hat.santa", name: "Santa", category: "hat", glyph: "🎅", price: 4500, rarity: "myth", tagline: "Limited holiday hat." },
  { id: "charm.diamond", name: "Diamond", category: "charm", glyph: "💎", price: 2500, rarity: "epic", tagline: "Dangling pressure, dangling proof." },
  { id: "charm.key", name: "Key", category: "charm", glyph: "🗝️", price: 1200, rarity: "epic", tagline: "Opens nothing, but it implies." }
];

const RARE_COLOR: Record<MarketItem["rarity"], string> = {
  common: "var(--wg-cream-mute)",
  rare: "var(--wg-gold)",
  epic: "var(--wg-amber)",
  myth: "var(--wg-ember)"
};

export function MarketModal({ open, onClose }: MarketModalProps) {
  const { isSignedIn } = useAuth();
  const [coins, setCoins] = useState<number>(() => loadCoins());
  const [owned, setOwned] = useState<string[]>(() => loadInventory().itemIds);
  const [filter, setFilter] = useState<"all" | "skin" | "hat" | "charm">("all");
  const [bumpId, setBumpId] = useState<string | null>(null);

  useEffect(() => {
    const refresh = () => {
      setCoins(loadCoins());
      setOwned(loadInventory().itemIds);
    };
    window.addEventListener("slithera-coins-change", refresh);
    window.addEventListener("slithera-inventory-change", refresh);
    return () => {
      window.removeEventListener("slithera-coins-change", refresh);
      window.removeEventListener("slithera-inventory-change", refresh);
    };
  }, []);

  const filtered = ITEMS.filter((it) => filter === "all" || it.category === filter);

  const buy = (item: MarketItem) => {
    if (!isSignedIn) return;
    if (owned.includes(item.id)) return;
    const result = spendCoins(item.price);
    if (!result.ok) {
      // simulate "earn coins for testing" - the user has no real path to earn yet
      // be polite about it: do nothing, the price tag stays red
      setBumpId(item.id);
      window.setTimeout(() => setBumpId(null), 600);
      return;
    }
    grantItem(item.id);
    setCoins(result.balance);
    setOwned(loadInventory().itemIds);
  };

  const claimDailyCoins = () => {
    addCoins(500);
  };

  return (
    <WardrobeModal
      open={open}
      onClose={onClose}
      preview={
        <div className="wg-market-hero">
          <div className="wg-market-hero-eyebrow">· · · MARKET · · ·</div>
          <div className="wg-market-hero-title">The <span className="accent">Vault</span></div>
          <div className="wg-market-hero-meta">Refined relics for refined serpents.</div>
          <div className="wg-market-coins">
            <span className="wg-coin-glyph" aria-hidden="true">◉</span>
            <strong>{formatCoins(coins)}</strong>
            <span className="wg-market-coins-meta">Balance</span>
          </div>
          {!isSignedIn ? (
            <div className="wg-market-locked">Sign in to purchase.</div>
          ) : (
            <button className="wg-market-claim" type="button" onClick={claimDailyCoins}>
              ✦ Claim 500 daily coins
            </button>
          )}
        </div>
      }
      side={
        <div className="wg-modal-side">
          <div className="wg-modal-eyebrow">CHAPTER · IV</div>
          <div>
            <div className="wg-modal-title">A curated <span className="accent">vault</span></div>
            <div className="wg-modal-subtitle">Permanent unlocks. Coins never expire.</div>
          </div>
          <div className="wg-market-tabs" role="tablist">
            {(["all", "skin", "hat", "charm"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={filter === tab}
                className={filter === tab ? "wg-market-tab active" : "wg-market-tab"}
                onClick={() => setFilter(tab)}
              >
                {tab === "all" ? "All" : tab[0].toUpperCase() + tab.slice(1) + "s"}
              </button>
            ))}
          </div>
          <div className="wg-market-grid">
            {filtered.map((item) => {
              const isOwned = owned.includes(item.id);
              const canAfford = coins >= item.price;
              return (
                <div
                  key={item.id}
                  className={`wg-market-card${isOwned ? " owned" : ""}${bumpId === item.id ? " shake" : ""}`}
                >
                  <div className="wg-market-glyph">{item.glyph}</div>
                  <div className="wg-market-name">{item.name}</div>
                  <div className="wg-market-tagline">{item.tagline}</div>
                  <div className="wg-market-rarity" style={{ color: RARE_COLOR[item.rarity] }}>
                    {item.rarity.toUpperCase()}
                  </div>
                  <button
                    type="button"
                    className={isOwned ? "wg-market-buy owned" : canAfford && isSignedIn ? "wg-market-buy" : "wg-market-buy disabled"}
                    onClick={() => buy(item)}
                    disabled={isOwned || !isSignedIn}
                  >
                    {isOwned ? "Owned" : (
                      <>
                        <span className="wg-coin-glyph" aria-hidden="true">◉</span>
                        <span>{formatCoins(item.price)}</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      }
    />
  );
}

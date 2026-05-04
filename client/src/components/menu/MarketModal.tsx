import { useState } from "react";
import { addCoins, formatCoins, recordDailyClaim, spendCoins } from "../../lib/coins";
import { formatCountdown } from "../../lib/daily";
import { grantItem } from "../../lib/inventory";
import { useAuth } from "../../lib/auth";
import { useCoins, useDailyClaim, useInventoryItems } from "../../lib/useEconomy";
import { MARKET_ITEMS, type MarketItem } from "../../lib/marketCatalog";
import { WardrobeModal } from "./WardrobeModal";

type MarketModalProps = { open: boolean; onClose: () => void };

const RARE_COLOR: Record<MarketItem["rarity"], string> = {
  common: "var(--wg-cream-mute)",
  rare: "var(--wg-gold)",
  epic: "var(--wg-amber)",
  myth: "var(--wg-ember)"
};

export function MarketModal({ open, onClose }: MarketModalProps) {
  const { isSignedIn } = useAuth();
  const coins = useCoins();
  const owned = useInventoryItems();
  const { canClaim, secondsLeft } = useDailyClaim();
  const [filter, setFilter] = useState<"all" | "skin" | "hat" | "charm">("all");
  const [bumpId, setBumpId] = useState<string | null>(null);

  const filtered = MARKET_ITEMS.filter((it) => filter === "all" || it.category === filter);

  const buy = (item: MarketItem) => {
    if (!isSignedIn) return;
    if (owned.includes(item.id)) return;
    const result = spendCoins(item.price);
    if (!result.ok) {
      setBumpId(item.id);
      window.setTimeout(() => setBumpId(null), 600);
      return;
    }
    grantItem(item.id);
  };

  const claimDailyCoins = () => {
    if (!isSignedIn || !canClaim) return;
    addCoins(500);
    recordDailyClaim();
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
          ) : canClaim ? (
            <button className="wg-market-claim" type="button" onClick={claimDailyCoins}>
              ✦ Claim 500 daily coins
            </button>
          ) : (
            <div className="wg-market-claim-cooldown">
              Daily claim resets in {formatCountdown(secondsLeft)}
            </div>
          )}
        </div>
      }
      side={
        <div className="wg-modal-side wg-market-side">
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

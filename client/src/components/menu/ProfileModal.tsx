import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import { formatCoins } from "../../lib/coins";
import { useCoins, useInventoryItems, useStats, useXp } from "../../lib/useEconomy";
import { MARKET_ITEMS } from "../../lib/marketCatalog";
import { loadMatches, type MatchRecord } from "../../lib/matchHistory";
import { WardrobeModal } from "./WardrobeModal";

type ProfileModalProps = { open: boolean; onClose: () => void };

const ITEM_LOOKUP: Record<string, { name: string; glyph: string }> = MARKET_ITEMS.reduce((acc, item) => {
  acc[item.id] = { name: item.name, glyph: item.glyph };
  return acc;
}, {} as Record<string, { name: string; glyph: string }>);

function describeItem(id: string): { name: string; glyph: string } {
  if (ITEM_LOOKUP[id]) return ITEM_LOOKUP[id];
  // fallback for legacy or unknown ids
  const [, raw = id] = id.split(".");
  return { name: raw.split("-").map((s) => s[0]?.toUpperCase() + s.slice(1)).join(" "), glyph: "✦" };
}

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

function isUrl(value: string | undefined): boolean {
  if (!value) return false;
  return /^https?:\/\//i.test(value);
}

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { user, signOut } = useAuth();
  const coins = useCoins();
  const items = useInventoryItems();
  const { level } = useXp();
  const stats = useStats();
  const [matches, setMatches] = useState<MatchRecord[]>(() => loadMatches());

  useEffect(() => {
    setMatches(loadMatches());
  }, [user?.id]);

  useEffect(() => {
    const refresh = () => setMatches(loadMatches());
    window.addEventListener("slithera-matches-change", refresh);
    return () => window.removeEventListener("slithera-matches-change", refresh);
  }, []);

  const pct = Math.round((level.current / level.needed) * 100);

  if (!user) {
    return (
      <WardrobeModal
        open={open}
        onClose={onClose}
        preview={
          <div className="wg-profile-modal-hero">
            <div className="wg-profile-modal-eyebrow">· · · PROFILE · · ·</div>
            <div className="wg-profile-modal-title">Not <span className="accent">signed in</span></div>
            <div className="wg-profile-modal-meta">Sign in from the right panel to see your dossier.</div>
          </div>
        }
        side={
          <div className="wg-modal-side">
            <div className="wg-modal-eyebrow">CHAPTER · VII</div>
            <div>
              <div className="wg-modal-title">Profile</div>
              <div className="wg-modal-subtitle">A signed-in player has a level, an inventory, and a coin balance.</div>
            </div>
            <div style={{ flex: 1 }} />
            <button className="wg-cancel-btn" type="button" onClick={onClose}>Close</button>
          </div>
        }
      />
    );
  }

  return (
    <WardrobeModal
      open={open}
      onClose={onClose}
      preview={
        <div className="wg-profile-modal-hero">
          <div className="wg-profile-modal-avatar">
            {isUrl(user.avatar) ? (
              <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" />
            ) : (
              user.avatar
            )}
          </div>
          <div className="wg-profile-modal-name">{user.name}</div>
          <div className="wg-profile-modal-meta">Level {level.level} · Initiate</div>
          <div className="wg-profile-modal-bar">
            <i style={{ width: `${pct}%` }} />
          </div>
          <div className="wg-profile-modal-xp">{level.current.toLocaleString()} / {level.needed.toLocaleString()} XP</div>
          <div className="wg-profile-modal-coin">
            <span className="wg-coin-glyph" aria-hidden="true">◉</span>
            <strong>{formatCoins(coins)}</strong>
          </div>
        </div>
      }
      side={
        <div className="wg-modal-side">
          <div className="wg-modal-eyebrow">CHAPTER · VII</div>
          <div>
            <div className="wg-modal-title">{user.name}'s <span className="accent">dossier</span></div>
            <div className="wg-modal-subtitle">Permanent record. Cosmetics persist across sessions.</div>
          </div>

          <div className="wg-profile-content">
            <div className="wg-profile-modal-stats">
              <div><strong>{stats.bestLength.toLocaleString()}</strong><span>Best Length</span></div>
              <div><strong>{stats.bestScore.toLocaleString()}</strong><span>Best Score</span></div>
              <div><strong>{stats.totalKills}</strong><span>Kills</span></div>
              <div><strong>{stats.gamesPlayed}</strong><span>Games</span></div>
            </div>

            <div className="wg-profile-modal-inventory">
              <div className="wg-modal-eyebrow" style={{ marginBottom: 6 }}>INVENTORY · {items.length}</div>
              {items.length > 0 ? (
                <div className="wg-profile-modal-items">
                  {items.map((id) => {
                    const { name, glyph } = describeItem(id);
                    return (
                      <span key={id} className="wg-inventory-chip" title={id}>
                        <span aria-hidden="true">{glyph}</span> {name}
                      </span>
                    );
                  })}
                </div>
              ) : (
                <div className="wg-profile-modal-empty">Nothing yet. Visit the Vault.</div>
              )}
            </div>

            <div className="wg-profile-modal-history">
              <div className="wg-modal-eyebrow" style={{ marginBottom: 6 }}>RECENT RUNS · {matches.length}</div>
              {matches.length > 0 ? (
                <div className="wg-match-list">
                  {matches.map((m) => (
                    <div className="wg-match-row" key={m.endedAt}>
                      <div className="wg-match-time">{formatRelativeTime(m.endedAt)}</div>
                      <div className="wg-match-stats">
                        <span><strong>{m.length}</strong>len</span>
                        <span><strong>{m.kills}</strong>k</span>
                        <span><strong>{m.foodEaten}</strong>food</span>
                      </div>
                      <div className="wg-match-rewards">+{m.coinsEarned}◉</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="wg-profile-modal-empty">No runs yet. Begin the arena.</div>
              )}
            </div>
          </div>

          <div className="wg-equip-row">
            <button className="wg-cancel-btn" type="button" onClick={() => { signOut(); onClose(); }}>Sign Out</button>
            <button className="wg-equip-btn" type="button" onClick={onClose}>Close</button>
          </div>
        </div>
      }
    />
  );
}


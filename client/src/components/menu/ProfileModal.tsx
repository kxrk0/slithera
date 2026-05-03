import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import { formatCoins, loadCoins } from "../../lib/coins";
import { loadInventory } from "../../lib/inventory";
import { loadStats } from "../../lib/stats";
import { deriveLevel, loadXp } from "../../lib/xp";
import { WardrobeModal } from "./WardrobeModal";

type ProfileModalProps = { open: boolean; onClose: () => void };

export function ProfileModal({ open, onClose }: ProfileModalProps) {
  const { user, signOut } = useAuth();
  const [coins, setCoins] = useState<number>(() => loadCoins());
  const [xp, setXp] = useState(() => loadXp());
  const [items, setItems] = useState<string[]>(() => loadInventory().itemIds);

  useEffect(() => {
    if (!open) return;
    const refresh = () => {
      setCoins(loadCoins());
      setXp(loadXp());
      setItems(loadInventory().itemIds);
    };
    window.addEventListener("slithera-coins-change", refresh);
    window.addEventListener("slithera-xp-change", refresh);
    window.addEventListener("slithera-inventory-change", refresh);
    return () => {
      window.removeEventListener("slithera-coins-change", refresh);
      window.removeEventListener("slithera-xp-change", refresh);
      window.removeEventListener("slithera-inventory-change", refresh);
    };
  }, [open]);

  const stats = loadStats();
  const level = deriveLevel(xp);
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
          <div className="wg-profile-modal-avatar">{user.avatar}</div>
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

          <div className="wg-profile-modal-stats">
            <div><strong>{stats.bestScore.toLocaleString()}</strong><span>Best Length</span></div>
            <div><strong>{stats.totalKills}</strong><span>Kills</span></div>
            <div><strong>{stats.gamesPlayed}</strong><span>Games</span></div>
            <div><strong>{stats.winStreak}</strong><span>Streak</span></div>
          </div>

          <div className="wg-profile-modal-inventory">
            <div className="wg-modal-eyebrow" style={{ marginBottom: 6 }}>INVENTORY · {items.length}</div>
            {items.length > 0 ? (
              <div className="wg-profile-modal-items">
                {items.map((id) => (
                  <span key={id} className="wg-inventory-chip">{id}</span>
                ))}
              </div>
            ) : (
              <div className="wg-profile-modal-empty">Nothing yet. Visit the Vault.</div>
            )}
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

import { useEffect, useState } from "react";
import { useAuth } from "../../lib/auth";
import { formatCoins, loadCoins } from "../../lib/coins";
import { deriveLevel, loadXp } from "../../lib/xp";

type ProfileCardProps = {
  onOpenMarket: () => void;
  onOpenQuests: () => void;
  onOpenSocial: () => void;
  onOpenProfile: () => void;
  playerName?: string;
};

export function ProfileCard({ onOpenMarket, onOpenQuests, onOpenSocial, onOpenProfile, playerName }: ProfileCardProps) {
  const { user, signIn, signOut } = useAuth();
  const [coins, setCoins] = useState<number>(() => loadCoins());
  const [signing, setSigning] = useState(false);
  const [xp, setXp] = useState(() => loadXp());

  useEffect(() => {
    const handler = () => setCoins(loadCoins());
    window.addEventListener("slithera-coins-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("slithera-coins-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  useEffect(() => {
    const handler = () => setXp(loadXp());
    window.addEventListener("slithera-xp-change", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("slithera-xp-change", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);

  const level = deriveLevel(xp);
  const xpPct = Math.round((level.current / level.needed) * 100);

  if (!user) {
    const handleSignIn = async () => {
      setSigning(true);
      try {
        await signIn(playerName);
      } finally {
        setSigning(false);
      }
    };
    return (
      <div className="wg-profile-card wg-profile-card--out">
        <div className="wg-profile-eyebrow">SIGN IN TO UNLOCK</div>
        <ul className="wg-profile-perks">
          <li>Earn coins from every match</li>
          <li>Daily quests &amp; XP</li>
          <li>Premium skins, hats, charms</li>
          <li>Gift items to friends</li>
        </ul>
        <button className="wg-google-btn" type="button" onClick={handleSignIn} disabled={signing}>
          <span className="wg-google-glyph" aria-hidden="true">G</span>
          <span>{signing ? "Signing in…" : "Sign in with Google"}</span>
        </button>
        <div className="wg-profile-mini-row">
          <button className="wg-mini-btn" type="button" onClick={onOpenMarket} aria-label="Market">
            <span className="icon">🏛</span><span>Market</span>
          </button>
          <button className="wg-mini-btn locked" type="button" onClick={onOpenQuests} aria-label="Quests" title="Sign in required">
            <span className="icon">🪶</span><span>Quests</span>
          </button>
          <button className="wg-mini-btn locked" type="button" onClick={onOpenSocial} aria-label="Social" title="Sign in required">
            <span className="icon">🪞</span><span>Social</span>
          </button>
          <button className="wg-mini-btn locked" type="button" onClick={onOpenProfile} aria-label="Profile" title="Sign in required">
            <span className="icon">⚜</span><span>Profile</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="wg-profile-card">
      <div className="wg-profile-head">
        <div className="wg-profile-avatar">{user.avatar}</div>
        <div className="wg-profile-info">
          <div className="wg-profile-name">{user.name}</div>
          <div className="wg-profile-meta">Level {level.level} · Initiate</div>
        </div>
        <button className="wg-profile-signout" type="button" onClick={signOut} aria-label="Sign out">⏻</button>
      </div>
      <div className="wg-profile-xp">
        <div className="wg-profile-xp-bar"><i style={{ width: `${xpPct}%` }} /></div>
        <div className="wg-profile-xp-meta">
          <span>{level.current.toLocaleString()} / {level.needed.toLocaleString()} XP</span>
          <span className="coin"><span aria-hidden="true">◉</span> {formatCoins(coins)}</span>
        </div>
      </div>
      <div className="wg-profile-mini-row">
        <button className="wg-mini-btn" type="button" onClick={onOpenMarket}>
          <span className="icon">🏛</span><span>Market</span>
        </button>
        <button className="wg-mini-btn" type="button" onClick={onOpenQuests}>
          <span className="icon">🪶</span><span>Quests</span>
        </button>
        <button className="wg-mini-btn" type="button" onClick={onOpenSocial}>
          <span className="icon">🪞</span><span>Social</span>
        </button>
        <button className="wg-mini-btn" type="button" onClick={onOpenProfile}>
          <span className="icon">⚜</span><span>Profile</span>
        </button>
      </div>
    </div>
  );
}

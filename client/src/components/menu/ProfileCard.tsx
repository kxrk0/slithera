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
    const refresh = () => {
      setCoins(loadCoins());
      setXp(loadXp());
    };
    window.addEventListener("slithera-coins-change", refresh);
    window.addEventListener("slithera-xp-change", refresh);
    window.addEventListener("slithera-auth-change", refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener("slithera-coins-change", refresh);
      window.removeEventListener("slithera-xp-change", refresh);
      window.removeEventListener("slithera-auth-change", refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const level = deriveLevel(xp);
  const xpPct = Math.round((level.current / level.needed) * 100);

  if (!user) {
    const handleSignIn = async () => {
      setSigning(true);
      try {
        await signIn();
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
          <svg className="wg-google-glyph" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
            <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" fill="currentColor" />
          </svg>
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
        <div className="wg-profile-avatar">
          {user.avatar.startsWith("http")
            ? <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" />
            : user.avatar}
        </div>
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

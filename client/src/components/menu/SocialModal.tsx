import { useState } from "react";
import { useAuth } from "../../lib/auth";
import { WardrobeModal } from "./WardrobeModal";

type SocialModalProps = { open: boolean; onClose: () => void };

const FRIENDS = [
  { id: "f1", name: "NeonRift",    avatar: "🦊", level: 23, online: true,  status: "In arena" },
  { id: "f2", name: "Voidrunner",  avatar: "🐉", level: 18, online: true,  status: "Idle" },
  { id: "f3", name: "Fluxion",     avatar: "🐍", level: 14, online: false, status: "Last seen 4h" },
  { id: "f4", name: "Bytecoil",    avatar: "🦋", level: 9,  online: false, status: "Last seen 2d" }
];

const GIFTABLE = [
  { id: "gift.cube", name: "Cube charm", glyph: "🎲" },
  { id: "gift.rose", name: "Velvet skin", glyph: "🌹" },
  { id: "gift.crown", name: "Crown hat", glyph: "👑" }
];

export function SocialModal({ open, onClose }: SocialModalProps) {
  const { isSignedIn } = useAuth();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const sendGift = (friendId: string) => {
    setSentTo(friendId);
    window.setTimeout(() => setSentTo(null), 1500);
  };

  return (
    <WardrobeModal
      open={open}
      onClose={onClose}
      preview={
        <div className="wg-social-hero">
          <div className="wg-social-hero-eyebrow">· · · SOCIAL · · ·</div>
          <div className="wg-social-hero-title">The <span className="accent">Salon</span></div>
          <div className="wg-social-hero-meta">Friends, gifts, gentle warfare.</div>
          {!isSignedIn ? (
            <div className="wg-social-locked">Sign in to see your salon.</div>
          ) : (
            <div className="wg-social-friend-count">{FRIENDS.filter(f => f.online).length} of {FRIENDS.length} online</div>
          )}
        </div>
      }
      side={
        <div className="wg-modal-side">
          <div className="wg-modal-eyebrow">CHAPTER · VI</div>
          <div>
            <div className="wg-modal-title">Friends &amp; <span className="accent">gifts</span></div>
            <div className="wg-modal-subtitle">Send a charm, hat, or skin to a friend.</div>
          </div>

          <div className="wg-social-list">
            {FRIENDS.map((f) => (
              <div key={f.id} className={`wg-friend-card${f.online ? " online" : ""}`}>
                <div className="wg-friend-avatar">
                  <span>{f.avatar}</span>
                  {f.online ? <i className="wg-friend-online" /> : null}
                </div>
                <div className="wg-friend-info">
                  <div className="wg-friend-name">{f.name}</div>
                  <div className="wg-friend-meta">Lv. {f.level} · {f.status}</div>
                </div>
                <button
                  className={sentTo === f.id ? "wg-friend-gift sent" : "wg-friend-gift"}
                  type="button"
                  onClick={() => sendGift(f.id)}
                  disabled={!isSignedIn || sentTo === f.id}
                >
                  {sentTo === f.id ? "Sent ✓" : "Gift"}
                </button>
              </div>
            ))}
          </div>

          <div className="wg-social-giftable">
            <div className="wg-modal-eyebrow" style={{ marginBottom: 6 }}>YOUR GIFT POOL</div>
            <div className="wg-social-gift-row">
              {GIFTABLE.map((g) => (
                <div className="wg-social-gift-chip" key={g.id}>
                  <span>{g.glyph}</span>
                  <b>{g.name}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      }
    />
  );
}

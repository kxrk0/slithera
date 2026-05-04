import { useEffect, useMemo, useState } from "react";
import type { LeaderboardEntry } from "../../../../shared/types";
import { loadDaily, secondsUntilMidnight } from "../../lib/daily";
import { loadStats } from "../../lib/stats";
import { AchievementsModal } from "./AchievementsModal";
import { ArenaHallPanel } from "./ArenaHallPanel";
import { CenterPanel } from "./CenterPanel";
import { CharmPicker } from "./CharmPicker";
import { HatPicker } from "./HatPicker";
import { LifetimePanel } from "./LifetimePanel";
import { LoadoutPanel } from "./LoadoutPanel";
import { StreakBanner } from "./StreakBanner";
import { MarketModal } from "./MarketModal";
import { ProfileModal } from "./ProfileModal";
import { QuestsModal } from "./QuestsModal";
import { SettingsModal } from "./SettingsModal";
import { SkinPicker } from "./SkinPicker";
import { SocialModal } from "./SocialModal";

type WarmGoldMenuProps = {
  name: string;
  skinId: string;
  hatId: string;
  ropeAccessoryId: string;
  leaderboard: LeaderboardEntry[];
  online: number;
  latencyMs?: number;
  onNameChange: (name: string) => void;
  onSkinChange: (skinId: string) => void;
  onHatChange: (hatId: string) => void;
  onRopeAccessoryChange: (id: string) => void;
  onStart: () => void;
};

type ModalKind = "skin" | "hat" | "charm" | null;

export function WarmGoldMenu({
  name, skinId, hatId, ropeAccessoryId, leaderboard, online, latencyMs,
  onNameChange, onSkinChange, onHatChange, onRopeAccessoryChange, onStart
}: WarmGoldMenuProps) {
  const [modal, setModal] = useState<ModalKind>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const stats = useMemo(() => loadStats(), []);
  const daily = useMemo(() => loadDaily(), []);
  const [countdown, setCountdown] = useState(() => secondsUntilMidnight());

  useEffect(() => {
    const id = window.setInterval(() => setCountdown(secondsUntilMidnight()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const noop = () => undefined;
  const [marketOpen, setMarketOpen] = useState(false);
  const [questsOpen, setQuestsOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);

  return (
    <section className="wg-stage" aria-label="Slithera main menu">
      <div className="wg-overlay" />
      <div className="wg-grain" />
      <div className="wg-top-ornament">A Coil &amp; Honey Arena · Est. MMXXVI</div>
      <div className="wg-grid">
        <div className="wg-left-stack">
          <LoadoutPanel
            skinId={skinId}
            hatId={hatId}
            ropeAccessoryId={ropeAccessoryId}
            onOpenSkin={() => setModal("skin")}
            onOpenHat={() => setModal("hat")}
            onOpenCharm={() => setModal("charm")}
          />
          <StreakBanner />
          <LifetimePanel stats={stats} />
        </div>
        <CenterPanel
          name={name}
          latencyMs={latencyMs}
          onNameChange={onNameChange}
          onStart={onStart}
          onSettings={() => setSettingsOpen(true)}
          onStats={() => setAchievementsOpen(true)}
          onHowToPlay={noop}
        />
        <ArenaHallPanel
          leaderboard={leaderboard}
          online={online}
          daily={daily}
          countdownSec={countdown}
          playerName={name}
          onOpenMarket={() => setMarketOpen(true)}
          onOpenQuests={() => setQuestsOpen(true)}
          onOpenSocial={() => setSocialOpen(true)}
          onOpenProfile={() => setProfileOpen(true)}
        />
      </div>
      <div className="wg-bottom-edge">SLITHERA · NO. 002 · MMXXVI</div>

      <SkinPicker
        open={modal === "skin"}
        onClose={() => setModal(null)}
        skinId={skinId}
        hatId={hatId}
        onChange={onSkinChange}
      />
      <HatPicker
        open={modal === "hat"}
        onClose={() => setModal(null)}
        skinId={skinId}
        hatId={hatId}
        onChange={onHatChange}
      />
      <CharmPicker
        open={modal === "charm"}
        onClose={() => setModal(null)}
        skinId={skinId}
        hatId={hatId}
        ropeAccessoryId={ropeAccessoryId}
        onChange={onRopeAccessoryChange}
      />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <MarketModal open={marketOpen} onClose={() => setMarketOpen(false)} />
      <QuestsModal open={questsOpen} onClose={() => setQuestsOpen(false)} />
      <SocialModal open={socialOpen} onClose={() => setSocialOpen(false)} />
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
      <AchievementsModal open={achievementsOpen} onClose={() => setAchievementsOpen(false)} />
    </section>
  );
}

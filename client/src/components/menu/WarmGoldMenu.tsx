import { useEffect, useMemo, useState } from "react";
import type { LeaderboardEntry } from "../../../../shared/types";
import { loadDaily, secondsUntilMidnight } from "../../lib/daily";
import { loadStats } from "../../lib/stats";
import { ArenaHallPanel } from "./ArenaHallPanel";
import { CenterPanel } from "./CenterPanel";
import { CharmPicker } from "./CharmPicker";
import { HatPicker } from "./HatPicker";
import { LifetimePanel } from "./LifetimePanel";
import { LoadoutPanel } from "./LoadoutPanel";
import { SettingsModal } from "./SettingsModal";
import { SkinPicker } from "./SkinPicker";

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
  const noopMarket = () => undefined;
  const noopQuests = () => undefined;
  const noopSocial = () => undefined;
  const noopProfile = () => undefined;

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
          <LifetimePanel stats={stats} />
        </div>
        <CenterPanel
          name={name}
          latencyMs={latencyMs}
          onNameChange={onNameChange}
          onStart={onStart}
          onSettings={() => setSettingsOpen(true)}
          onStats={noop}
          onHowToPlay={noop}
        />
        <ArenaHallPanel
          leaderboard={leaderboard}
          online={online}
          daily={daily}
          countdownSec={countdown}
          playerName={name}
          onOpenMarket={noopMarket}
          onOpenQuests={noopQuests}
          onOpenSocial={noopSocial}
          onOpenProfile={noopProfile}
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
    </section>
  );
}

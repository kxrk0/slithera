import { useEffect, useMemo, useRef, useState } from "react";
import { AchievementToasts } from "./components/AchievementToasts";
import { EmotePicker } from "./components/EmotePicker";
import { GameHud } from "./components/GameHud";
import { TouchControls } from "./components/TouchControls";
import { WarmGoldMenu } from "./components/menu/WarmGoldMenu";
import { PixiGame } from "./game/PixiGame";
import { useGameClient } from "./game/useGameClient";
import { evaluateAchievements } from "./lib/achievements";
import { playSfx, unlockAudioOnFirstGesture } from "./lib/audio";
import { useAuth } from "./lib/auth";
import { addCoins } from "./lib/coins";
import { recordDailyRunEnd } from "./lib/daily";
import { loadLoadout, saveLoadout } from "./lib/loadout";
import { recordMatch } from "./lib/matchHistory";
import { useMenuSimulation } from "./lib/menuBackdrop";
import { recordQuestRunEnd } from "./lib/quests";
import { loadStats, recordGameEnd } from "./lib/stats";
import { addXp } from "./lib/xp";
import type { ClientInput } from "../../shared/types";

type LastReward = { coins: number; xp: number; at: number };

export default function App() {
  const autoStart = new URLSearchParams(window.location.search).get("play") === "1";
  const { user } = useAuth();
  const initialLoadout = loadLoadout();
  const [started, setStarted] = useState(autoStart);
  const [paused, setPaused] = useState(!autoStart);
  const [name, setName] = useState(initialLoadout.name);
  const [skinId, setSkinId] = useState<string>(initialLoadout.skinId);
  const [hatId, setHatId] = useState(initialLoadout.hatId);
  const [ropeAccessoryId, setRopeAccessoryId] = useState(initialLoadout.ropeAccessoryId);
  const [perf, setPerf] = useState({ fps: 0, renderer: "webgl" });
  const [lastReward, setLastReward] = useState<LastReward | null>(null);

  // When the user signs in/out, swap to that user's saved loadout
  useEffect(() => {
    const next = loadLoadout();
    setName(next.name);
    setSkinId(next.skinId);
    setHatId(next.hatId);
    setRopeAccessoryId(next.ropeAccessoryId);
  }, [user?.id]);

  // Persist loadout on every change
  useEffect(() => {
    saveLoadout({ name, skinId, hatId, ropeAccessoryId });
  }, [name, skinId, hatId, ropeAccessoryId]);

  // Unlock audio on first user gesture (browser policy)
  useEffect(() => { unlockAudioOnFirstGesture(); }, []);

  const profile = useMemo(
    () => ({ name: name.trim() || "You", skinId, hatId, ropeAccessoryId }),
    [name, skinId, hatId, ropeAccessoryId]
  );
  const { status, playerId, snapshot, latency, recentEvents, sendInput, respawn, sendEmote } = useGameClient(started, profile);
  const menuSnapshot = useMenuSimulation(!started);
  const player = useMemo(() => snapshot?.players.find((item) => item.id === playerId), [snapshot, playerId]);

  // Wire SFX to gameplay events
  useEffect(() => {
    if (!recentEvents) return;
    const last = recentEvents[recentEvents.length - 1];
    if (!last) return;
    const ev = last.event;
    if (ev.type === "death") {
      if (ev.id === playerId) playSfx("death");
      else if (ev.killerId === playerId) playSfx("kill");
    } else if (ev.type === "food" && ev.playerId === playerId) {
      playSfx("food-eat");
    }
  }, [recentEvents, playerId]);

  // Achievement unlock SFX
  useEffect(() => {
    const onUnlock = () => playSfx("achievement");
    window.addEventListener("slithera-achievement-unlocked", onUnlock);
    return () => window.removeEventListener("slithera-achievement-unlocked", onUnlock);
  }, []);

  // Boost-start SFX (one shot per local boost engagement)
  const wasBoosting = useRef(false);
  useEffect(() => {
    const isBoosting = Boolean(player?.boosting);
    if (isBoosting && !wasBoosting.current) playSfx("boost-start");
    wasBoosting.current = isBoosting;
  }, [player?.boosting]);

  const [lastAlive, setLastAlive] = useState<{ alive: boolean; score: number; kills: number; startedAt: number }>(
    { alive: false, score: 0, kills: 0, startedAt: 0 }
  );
  useEffect(() => {
    if (!player) return;
    if (player.alive && !lastAlive.alive) {
      setLastAlive({ alive: true, score: 0, kills: 0, startedAt: Date.now() });
      // Clear stale reward overlay when a new run starts
      setLastReward(null);
    }
    if (!player.alive && lastAlive.alive) {
      const playedSec = Math.max(0, Math.floor((Date.now() - lastAlive.startedAt) / 1000));
      const foodEaten = player.score;
      const length = player.segments.length;
      recordGameEnd({ score: foodEaten, length, kills: player.kills, playedSec, foodEaten });
      const xp = foodEaten + player.kills * 50;
      const coins = Math.floor(foodEaten / 5) + player.kills * 25;
      addXp(xp);
      addCoins(coins);
      recordQuestRunEnd({ foodEaten, kills: player.kills, length });
      recordDailyRunEnd({ foodEaten, kills: player.kills, length });
      recordMatch({
        endedAt: Date.now(),
        length,
        kills: player.kills,
        foodEaten,
        playedSec,
        coinsEarned: coins,
        xpEarned: xp
      });
      // Evaluate achievements against the freshly-updated stats
      const stats = loadStats();
      evaluateAchievements({
        bestLength: stats.bestLength,
        totalKills: stats.totalKills,
        totalFoodEaten: stats.totalFoodEaten,
        gamesPlayed: stats.gamesPlayed
      });
      setLastReward({ coins, xp, at: Date.now() });
      setLastAlive((prev) => ({ ...prev, alive: false }));
    }
  }, [player, lastAlive]);

  const handleInput = (input: ClientInput) => {
    if (!paused) sendInput(input);
  };

  // Escape toggles pause while a game is in progress
  useEffect(() => {
    if (!started) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && player?.alive) {
        setPaused((value) => !value);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, player?.alive]);

  const renderedSnapshot = started ? snapshot : menuSnapshot;
  const renderedPlayerId = started ? playerId : undefined;
  const leaderboard = renderedSnapshot?.leaderboard ?? [];
  const online = renderedSnapshot?.players.length ?? 0;

  return (
    <main className="game-shell">
      <AchievementToasts />
      <PixiGame
        snapshot={renderedSnapshot}
        playerId={renderedPlayerId}
        paused={!started ? false : paused}
        onInput={handleInput}
        onPerf={setPerf}
        recentEvents={started ? recentEvents : undefined}
      />
      {started && player?.alive ? <EmotePicker onSend={sendEmote} /> : null}
      {started && player?.alive ? (
        <TouchControls
          onAim={(heading, active) => {
            if (active) handleInput({ heading, boosting: player.boosting });
          }}
          onBoost={(boosting) => {
            handleInput({ heading: player.targetHeading, boosting });
          }}
        />
      ) : null}
      {started ? (
        <GameHud
          status={status}
          latency={latency}
          player={player}
          playerId={playerId}
          snapshot={snapshot}
          paused={paused}
          perf={perf}
          recentEvents={recentEvents}
          rewards={lastReward}
          onPause={() => setPaused((value) => !value)}
          onPlay={() => {
            setPaused(false);
            if (player && !player.alive) respawn();
          }}
          onRespawn={() => {
            setLastReward(null);
            respawn();
          }}
          onMainMenu={() => {
            setStarted(false);
            setPaused(true);
          }}
          onBoost={(boosting) => {
            if (!player) return;
            handleInput({ heading: player.targetHeading, boosting });
          }}
        />
      ) : (
        <WarmGoldMenu
          name={name}
          skinId={skinId}
          hatId={hatId}
          ropeAccessoryId={ropeAccessoryId}
          leaderboard={leaderboard}
          online={online}
          latencyMs={latency}
          onNameChange={setName}
          onSkinChange={setSkinId}
          onHatChange={setHatId}
          onRopeAccessoryChange={setRopeAccessoryId}
          onStart={() => {
            setStarted(true);
            setPaused(false);
          }}
        />
      )}
    </main>
  );
}

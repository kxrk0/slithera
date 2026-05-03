import { useEffect, useMemo, useState } from "react";
import { GameHud } from "./components/GameHud";
import { WarmGoldMenu } from "./components/menu/WarmGoldMenu";
import { PixiGame } from "./game/PixiGame";
import { useGameClient } from "./game/useGameClient";
import { addCoins } from "./lib/coins";
import { useMenuSimulation } from "./lib/menuBackdrop";
import { recordGameEnd } from "./lib/stats";
import { addXp } from "./lib/xp";
import { SNAKE_SKINS } from "../../shared/constants";
import type { ClientInput } from "../../shared/types";

export default function App() {
  const autoStart = new URLSearchParams(window.location.search).get("play") === "1";
  const [started, setStarted] = useState(autoStart);
  const [paused, setPaused] = useState(!autoStart);
  const [name, setName] = useState("");
  const [skinId, setSkinId] = useState<string>(SNAKE_SKINS[0].id);
  const [hatId, setHatId] = useState("none");
  const [ropeAccessoryId, setRopeAccessoryId] = useState("none");
  const [perf, setPerf] = useState({ fps: 0, renderer: "webgl" });
  const profile = useMemo(
    () => ({ name: name.trim() || "You", skinId, hatId, ropeAccessoryId }),
    [name, skinId, hatId, ropeAccessoryId]
  );
  const { status, playerId, snapshot, latency, sendInput, respawn } = useGameClient(started, profile);
  const menuSnapshot = useMenuSimulation(!started);
  const player = useMemo(() => snapshot?.players.find((item) => item.id === playerId), [snapshot, playerId]);

  // Record game-end stats when local player transitions alive -> dead.
  const [lastAlive, setLastAlive] = useState<{ alive: boolean; score: number; kills: number; startedAt: number }>(
    { alive: false, score: 0, kills: 0, startedAt: 0 }
  );
  useEffect(() => {
    if (!player) return;
    if (player.alive && !lastAlive.alive) {
      setLastAlive({ alive: true, score: 0, kills: 0, startedAt: Date.now() });
    }
    if (!player.alive && lastAlive.alive) {
      const playedSec = Math.max(0, Math.floor((Date.now() - lastAlive.startedAt) / 1000));
      recordGameEnd({ score: player.score, kills: player.kills, playedSec });
      // Award XP and coins (gated to signed-in users via the lib internals — but since lib is local, just call)
      // Length-based reward: 1 XP per length point + 50 per kill, 1 coin per 5 length
      const lengthAwarded = player.score; // score now = length
      addXp(lengthAwarded + player.kills * 50);
      addCoins(Math.floor(lengthAwarded / 5));
      setLastAlive((prev) => ({ ...prev, alive: false }));
    }
  }, [player, lastAlive]);

  const handleInput = (input: ClientInput) => {
    if (!paused) sendInput(input);
  };

  const renderedSnapshot = started ? snapshot : menuSnapshot;
  const renderedPlayerId = started ? playerId : undefined;
  const leaderboard = renderedSnapshot?.leaderboard ?? [];
  const online = renderedSnapshot?.players.length ?? 0;

  return (
    <main className="game-shell">
      <PixiGame
        snapshot={renderedSnapshot}
        playerId={renderedPlayerId}
        paused={!started ? false : paused}
        onInput={handleInput}
        onPerf={setPerf}
      />
      {started ? (
        <GameHud
          status={status}
          latency={latency}
          player={player}
          playerId={playerId}
          snapshot={snapshot}
          paused={paused}
          perf={perf}
          onPause={() => setPaused((value) => !value)}
          onPlay={() => {
            setPaused(false);
            if (player && !player.alive) respawn();
          }}
          onRespawn={respawn}
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

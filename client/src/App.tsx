import { useMemo, useState } from "react";
import { GameHud } from "./components/GameHud";
import { MainMenu } from "./components/MainMenu";
import { PixiGame } from "./game/PixiGame";
import { useGameClient } from "./game/useGameClient";
import { SNAKE_SKINS } from "../../shared/constants";
import type { ClientInput } from "../../shared/types";

export default function App() {
  const autoStart = new URLSearchParams(window.location.search).get("play") === "1";
  const [started, setStarted] = useState(autoStart);
  const [paused, setPaused] = useState(!autoStart);
  const [name, setName] = useState("You");
  const [skinId, setSkinId] = useState<string>(SNAKE_SKINS[0].id);
  const [hatId, setHatId] = useState("none");
  const [ropeAccessoryId, setRopeAccessoryId] = useState("none");
  const [perf, setPerf] = useState({ fps: 0, renderer: "webgl" });
  const profile = useMemo(() => ({ name: name.trim() || "You", skinId, ropeAccessoryId }), [name, skinId, ropeAccessoryId]);
  const { status, playerId, snapshot, latency, sendInput, respawn } = useGameClient(started, profile);
  const player = useMemo(() => snapshot?.players.find((item) => item.id === playerId), [snapshot, playerId]);

  const handleInput = (input: ClientInput) => {
    if (!paused) sendInput(input);
  };

  return (
    <main className="game-shell">
      <PixiGame snapshot={snapshot} playerId={playerId} paused={paused} onInput={handleInput} onPerf={setPerf} />
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
          onBoost={(boosting) => {
            if (!player) return;
            handleInput({ heading: player.targetHeading, boosting });
          }}
        />
      ) : (
        <MainMenu
          name={name}
          skinId={skinId}
          hatId={hatId}
          ropeAccessoryId={ropeAccessoryId}
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

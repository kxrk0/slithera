import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { GameHud } from "../client/src/components/GameHud";
import type { ServerSnapshot } from "../shared/types";

const snapshot: ServerSnapshot = {
  type: "snapshot",
  tick: 1,
  serverTime: Date.now(),
  players: [
    {
      id: "you",
      name: "You",
      skinId: "cyan-core",
      color: "#22d8ff",
      accent: "#b9f6ff",
      score: 12840,
      boost: 76,
      alive: true,
      bot: false,
      boosting: false,
      speed: 168,
      heading: 0,
      targetHeading: 0,
      segments: [{ x: 1000, y: 900 }],
      segmentProgress: 0,
      kills: 0,
      ropeAccessoryId: "none",
      hatId: "none"
    }
  ],
  food: [{ id: "food_1", x: 700, y: 600, color: "#ffd24d", value: 2, driftAngle: 0, driftSpeed: 0 }],
  leaderboard: [{ id: "you", name: "You", score: 12840, color: "#22d8ff", you: true }]
};

describe("HUD smoke", () => {
  it("renders production HUD controls and live score", () => {
    render(
      <GameHud
        status="online"
        latency={24}
        player={snapshot.players[0]}
        playerId="you"
        snapshot={snapshot}
        paused={false}
        perf={{ fps: 240, renderer: "webgl" }}
        onPlay={vi.fn()}
        onPause={vi.fn()}
        onRespawn={vi.fn()}
        onBoost={vi.fn()}
      />
    );

    expect(screen.getByRole("heading", { name: "SLITHERA" })).toBeInTheDocument();
    expect(screen.getAllByText("12,840").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText("Leaderboard")).toBeInTheDocument();
  });
});

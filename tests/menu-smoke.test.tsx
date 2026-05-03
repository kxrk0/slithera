import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WarmGoldMenu } from "../client/src/components/menu/WarmGoldMenu";

describe("WarmGoldMenu", () => {
  const baseProps = {
    name: "Tester",
    skinId: "cyan-core",
    hatId: "none",
    ropeAccessoryId: "none",
    leaderboard: [{ id: "tester", name: "Tester", score: 1234, color: "#22d8ff", you: true }],
    online: 7,
    latencyMs: 24,
    onNameChange: vi.fn(),
    onSkinChange: vi.fn(),
    onHatChange: vi.fn(),
    onRopeAccessoryChange: vi.fn(),
    onStart: vi.fn()
  };

  it("renders the brand and the play CTA", () => {
    render(<WarmGoldMenu {...baseProps} />);
    expect(screen.getByRole("heading", { name: /Slither/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Begin the arena/i })).toBeInTheDocument();
  });

  it("renders the loadout panel and shows the skin name", () => {
    render(<WarmGoldMenu {...baseProps} />);
    expect(screen.getByLabelText("Loadout")).toBeInTheDocument();
    expect(screen.getByText("Cyan Core")).toBeInTheDocument();
  });

  it("renders the leaderboard with the provided entry", () => {
    render(<WarmGoldMenu {...baseProps} />);
    expect(screen.getByLabelText("Leaderboard")).toBeInTheDocument();
    expect(screen.getByText(/Tester \(You\)/)).toBeInTheDocument();
  });

  it("calls onStart when play button is clicked", () => {
    const onStart = vi.fn();
    render(<WarmGoldMenu {...baseProps} onStart={onStart} />);
    screen.getByRole("button", { name: /Begin the arena/i }).click();
    expect(onStart).toHaveBeenCalledTimes(1);
  });
});

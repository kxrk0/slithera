import { useEffect, useState } from "react";
import { TICK_RATE } from "../../../shared/constants";
import { createWorld, makeSnapshot, stepWorld } from "../../../shared/simulation";
import type { ServerSnapshot } from "../../../shared/types";

/**
 * Drives a client-side simulation while the user is in the menu so the
 * PixiGame canvas behind the menu is never empty. Bots wander the world.
 * The synthetic snapshot has no human player, so PixiGame's camera falls
 * back to the world center automatically.
 */
export function useMenuSimulation(active: boolean): ServerSnapshot | undefined {
  const [snapshot, setSnapshot] = useState<ServerSnapshot | undefined>(undefined);

  useEffect(() => {
    if (!active) return;
    const world = createWorld(Math.floor(Math.random() * 100000));
    const stepDt = 1 / TICK_RATE;
    let stopped = false;
    const intervalId = window.setInterval(() => {
      if (stopped) return;
      stepWorld(world, stepDt);
      setSnapshot(makeSnapshot(world));
    }, 1000 / 30);
    return () => {
      stopped = true;
      window.clearInterval(intervalId);
    };
  }, [active]);

  return active ? snapshot : undefined;
}

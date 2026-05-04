import { useEffect, useState } from "react";
import { useAuth } from "./auth";
import { loadCoins, dailyClaimAvailable } from "./coins";
import { secondsUntilMidnight } from "./daily";
import { loadInventory } from "./inventory";
import { loadStats, type StoredStats } from "./stats";
import { deriveLevel, loadXp, type LevelInfo, type XpState } from "./xp";

function subscribe(events: string[], handler: () => void): () => void {
  events.forEach((e) => window.addEventListener(e, handler));
  return () => events.forEach((e) => window.removeEventListener(e, handler));
}

export function useCoins(): number {
  const { user } = useAuth();
  const [coins, setCoins] = useState<number>(() => loadCoins());

  useEffect(() => {
    const refresh = () => setCoins(loadCoins());
    refresh();
    return subscribe(["slithera-coins-change", "slithera-auth-change"], refresh);
  }, [user?.id]);

  return coins;
}

export function useInventoryItems(): string[] {
  const { user } = useAuth();
  const [items, setItems] = useState<string[]>(() => loadInventory().itemIds);

  useEffect(() => {
    const refresh = () => setItems(loadInventory().itemIds);
    refresh();
    return subscribe(["slithera-inventory-change", "slithera-auth-change"], refresh);
  }, [user?.id]);

  return items;
}

export function useXp(): { state: XpState; level: LevelInfo } {
  const { user } = useAuth();
  const [state, setState] = useState<XpState>(() => loadXp());

  useEffect(() => {
    const refresh = () => setState(loadXp());
    refresh();
    return subscribe(["slithera-xp-change", "slithera-auth-change"], refresh);
  }, [user?.id]);

  return { state, level: deriveLevel(state) };
}

export function useStats(): StoredStats {
  const { user } = useAuth();
  const [stats, setStats] = useState<StoredStats>(() => loadStats());

  useEffect(() => {
    const refresh = () => setStats(loadStats());
    refresh();
    return subscribe(["slithera-stats-change", "slithera-auth-change"], refresh);
  }, [user?.id]);

  return stats;
}

export function useDailyClaim(): { canClaim: boolean; secondsLeft: number } {
  const { user } = useAuth();
  const [canClaim, setCanClaim] = useState<boolean>(() => dailyClaimAvailable());
  const [secondsLeft, setSecondsLeft] = useState<number>(() => secondsUntilMidnight());

  useEffect(() => {
    const refresh = () => {
      setCanClaim(dailyClaimAvailable());
      setSecondsLeft(secondsUntilMidnight());
    };
    refresh();
    const id = window.setInterval(refresh, 1000);
    const off = subscribe(["slithera-coins-change", "slithera-auth-change"], refresh);
    return () => { window.clearInterval(id); off(); };
  }, [user?.id]);

  return { canClaim, secondsLeft };
}

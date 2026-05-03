import { loadAuthUser } from "./auth";

function balanceKey(): string | null {
  const user = loadAuthUser();
  return user ? `slithera-coins:${user.id}` : null;
}

function claimKey(): string | null {
  const user = loadAuthUser();
  return user ? `slithera-coins-claim-at:${user.id}` : null;
}

export function loadCoins(): number {
  const key = balanceKey();
  if (!key) return 0;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return 0;
    const value = Number(JSON.parse(raw));
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
  } catch {
    return 0;
  }
}

function saveCoins(value: number): number {
  const key = balanceKey();
  const clamped = Math.max(0, Math.floor(value));
  if (!key) return clamped;
  try {
    window.localStorage.setItem(key, JSON.stringify(clamped));
    window.dispatchEvent(new CustomEvent("slithera-coins-change"));
  } catch { /* ignore */ }
  return clamped;
}

export function addCoins(amount: number): number {
  return saveCoins(loadCoins() + Math.max(0, Math.floor(amount)));
}

export function spendCoins(amount: number): { ok: boolean; balance: number } {
  const current = loadCoins();
  if (amount < 0 || current < amount) return { ok: false, balance: current };
  return { ok: true, balance: saveCoins(current - amount) };
}

export function formatCoins(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `${(value / 1000).toFixed(1)}k`;
  return value.toLocaleString("en-US");
}

export function loadLastDailyClaim(): number {
  const key = claimKey();
  if (!key) return 0;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return 0;
    const value = Number(JSON.parse(raw));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

export function recordDailyClaim(now = Date.now()): void {
  const key = claimKey();
  if (!key) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(now));
    window.dispatchEvent(new CustomEvent("slithera-coins-change"));
  } catch { /* ignore */ }
}

export function dailyClaimAvailable(now = Date.now()): boolean {
  const last = loadLastDailyClaim();
  if (last === 0) return true;
  const lastDate = new Date(last);
  const today = new Date(now);
  return (
    lastDate.getFullYear() !== today.getFullYear() ||
    lastDate.getMonth() !== today.getMonth() ||
    lastDate.getDate() !== today.getDate()
  );
}

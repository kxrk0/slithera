const STORAGE_KEY = "slithera-coins";

export function loadCoins(): number {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return 0;
    const value = Number(JSON.parse(raw));
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
  } catch {
    return 0;
  }
}

function saveCoins(value: number): number {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Math.max(0, Math.floor(value))));
    window.dispatchEvent(new CustomEvent("slithera-coins-change"));
  } catch { /* ignore */ }
  return Math.max(0, Math.floor(value));
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

const CLAIM_KEY = "slithera-coins-claim-at";

export function loadLastDailyClaim(): number {
  try {
    const raw = window.localStorage.getItem(CLAIM_KEY);
    if (!raw) return 0;
    const value = Number(JSON.parse(raw));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

export function recordDailyClaim(now = Date.now()): void {
  try {
    window.localStorage.setItem(CLAIM_KEY, JSON.stringify(now));
    window.dispatchEvent(new CustomEvent("slithera-coins-change"));
  } catch { /* ignore */ }
}

export function dailyClaimAvailable(now = Date.now()): boolean {
  const last = loadLastDailyClaim();
  if (last === 0) return true;
  // Available if a calendar-day boundary has been crossed since last claim
  const lastDate = new Date(last);
  const today = new Date(now);
  return (
    lastDate.getFullYear() !== today.getFullYear() ||
    lastDate.getMonth() !== today.getMonth() ||
    lastDate.getDate() !== today.getDate()
  );
}

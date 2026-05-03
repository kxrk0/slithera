import { loadAuthUser } from "./auth";

type Inventory = { itemIds: string[] };

function storageKey(): string | null {
  const user = loadAuthUser();
  return user ? `slithera-inventory:${user.id}` : null;
}

export function loadInventory(): Inventory {
  const key = storageKey();
  if (!key) return { itemIds: [] };
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return { itemIds: [] };
    const parsed = JSON.parse(raw) as Partial<Inventory>;
    return { itemIds: Array.isArray(parsed.itemIds) ? parsed.itemIds.slice() : [] };
  } catch {
    return { itemIds: [] };
  }
}

export function ownsItem(id: string): boolean {
  return loadInventory().itemIds.includes(id);
}

export function grantItem(id: string): Inventory {
  const key = storageKey();
  if (!key) return { itemIds: [] };
  const inv = loadInventory();
  if (!inv.itemIds.includes(id)) inv.itemIds.push(id);
  try {
    window.localStorage.setItem(key, JSON.stringify(inv));
    window.dispatchEvent(new CustomEvent("slithera-inventory-change"));
  } catch { /* ignore */ }
  return inv;
}

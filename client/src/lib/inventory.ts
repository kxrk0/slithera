const STORAGE_KEY = "slithera-inventory";

type Inventory = { itemIds: string[] };

export function loadInventory(): Inventory {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
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
  const inv = loadInventory();
  if (!inv.itemIds.includes(id)) inv.itemIds.push(id);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(inv));
    window.dispatchEvent(new CustomEvent("slithera-inventory-change"));
  } catch { /* ignore */ }
  return inv;
}

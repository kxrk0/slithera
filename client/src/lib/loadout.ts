import { loadAuthUser } from "./auth";

export type StoredLoadout = {
  name: string;
  skinId: string;
  hatId: string;
  ropeAccessoryId: string;
};

const DEFAULTS: StoredLoadout = {
  name: "",
  skinId: "cyan-core",
  hatId: "none",
  ropeAccessoryId: "none"
};

function storageKey(): string {
  const user = loadAuthUser();
  return user ? `slithera-loadout:${user.id}` : "slithera-loadout:guest";
}

export function loadLoadout(): StoredLoadout {
  try {
    const raw = window.localStorage.getItem(storageKey());
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<StoredLoadout>;
    return {
      name: typeof parsed.name === "string" ? parsed.name.slice(0, 32) : DEFAULTS.name,
      skinId: typeof parsed.skinId === "string" ? parsed.skinId : DEFAULTS.skinId,
      hatId: typeof parsed.hatId === "string" ? parsed.hatId : DEFAULTS.hatId,
      ropeAccessoryId: typeof parsed.ropeAccessoryId === "string" ? parsed.ropeAccessoryId : DEFAULTS.ropeAccessoryId
    };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveLoadout(partial: Partial<StoredLoadout>): StoredLoadout {
  const merged = { ...loadLoadout(), ...partial };
  try {
    window.localStorage.setItem(storageKey(), JSON.stringify(merged));
  } catch { /* ignore */ }
  return merged;
}

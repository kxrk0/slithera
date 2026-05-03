export type GameSettings = {
  masterVolume: number;     // 0-100
  fpsCap: 0 | 60 | 120 | 240; // 0 = uncapped
  mouseSensitivity: number; // 0.5 - 2.0
  lowFxMode: boolean;
  hideUiWhilePlaying: boolean;
};

const STORAGE_KEY = "slithera-settings";

const DEFAULTS: GameSettings = {
  masterVolume: 70,
  fpsCap: 0,
  mouseSensitivity: 1.0,
  lowFxMode: false,
  hideUiWhilePlaying: false
};

export function loadSettings(): GameSettings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULTS };
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return { ...DEFAULTS };
  }
}

export function saveSettings(partial: Partial<GameSettings>): GameSettings {
  const merged = { ...loadSettings(), ...partial };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch { /* ignore */ }
  return merged;
}

export const FPS_OPTIONS: { value: GameSettings["fpsCap"]; label: string }[] = [
  { value: 0,   label: "Unlocked" },
  { value: 60,  label: "60" },
  { value: 120, label: "120" },
  { value: 240, label: "240" }
];

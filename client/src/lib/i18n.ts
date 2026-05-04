import { useEffect, useState } from "react";

export type Locale = "en" | "tr";

const STORAGE_KEY = "slithera-locale";

type StringKey = keyof typeof STRINGS_EN;

const STRINGS_EN = {
  // Core menu
  "menu.beginArena": "Begin the Arena",
  "menu.enterName": "Enter a name to begin",
  "menu.enterAs": "Enter as {name}",
  "menu.awaiting": "Awaiting your sigil",
  "menu.choosePlaceholder": "Choose your name…",
  "menu.settings": "Settings",
  "menu.achievements": "Achievements",
  "menu.howToPlay": "How to Play",

  // HUD
  "hud.length": "Length",
  "hud.fps": "FPS",
  "hud.online": "{count} online · {ms}ms",
  "hud.arena": "Arena",
  "hud.theHall": "The Hall",

  // Death screen
  "death.eyebrow": "ELIMINATED",
  "death.title": "Your light fractured",
  "death.titleLead": "Your light",
  "death.titleAccent": "fractured",
  "death.killerPrefix": "by ",
  "death.killerSuffix": "",
  "death.byOwn": "by your own coil",
  "death.length": "Length",
  "death.kills": "Kills",
  "death.food": "Food",
  "death.coins": "Coins",
  "death.xpEarned": "+ {xp} XP earned",
  "death.respawn": "Respawn",
  "death.mainMenu": "Main Menu",

  // Pause
  "pause.eyebrow": "INTERMISSION",
  "pause.title": "Pause & breathe",
  "pause.skin": "Skin",
  "pause.hat": "Hat",
  "pause.charm": "Charm",
  "pause.bare": "Bare",
  "pause.none": "None",
  "pause.hint": "Change loadout from the main menu — wardrobe options reload your snake.",
  "pause.resume": "Resume →",

  // Modals - common
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.save": "Save",
  "common.wear": "Wear",
  "common.locked": "Locked",
  "common.claim": "Claim",
  "common.claimed": "Claimed",
  "common.owned": "Owned",
  "common.signOut": "Sign Out",

  // Streak
  "streak.days": "day",
  "streak.daysPlural": "days",
  "streak.todayClaimed": "Today claimed",
  "streak.maxTier": "Max tier reached",
  "streak.nextAt": "Next at day {day}",

  // Validation
  "name.empty": "Enter a name to begin",
  "name.tooShort": "At least 1 character",
  "name.tooLong": "Max 16 characters",
  "name.profanity": "Try a different name"
};

const STRINGS_TR: Record<StringKey, string> = {
  "menu.beginArena": "Arenaya gir",
  "menu.enterName": "Başlamak için isim gir",
  "menu.enterAs": "{name} olarak gir",
  "menu.awaiting": "Mührünü bekliyor",
  "menu.choosePlaceholder": "İsmini seç…",
  "menu.settings": "Ayarlar",
  "menu.achievements": "Başarımlar",
  "menu.howToPlay": "Nasıl Oynanır",

  "hud.length": "Uzunluk",
  "hud.fps": "FPS",
  "hud.online": "{count} çevrimiçi · {ms}ms",
  "hud.arena": "Arena",
  "hud.theHall": "Liste",

  "death.eyebrow": "ELENDİN",
  "death.title": "Işığın söndü",
  "death.titleLead": "Işığın",
  "death.titleAccent": "söndü",
  "death.killerPrefix": "",
  "death.killerSuffix": " tarafından",
  "death.byOwn": "kendi kuyruğunla",
  "death.length": "Uzunluk",
  "death.kills": "Avlanan",
  "death.food": "Yem",
  "death.coins": "Coin",
  "death.xpEarned": "+ {xp} XP kazandın",
  "death.respawn": "Tekrar Doğ",
  "death.mainMenu": "Ana Menü",

  "pause.eyebrow": "ARA",
  "pause.title": "Durakla & nefeslen",
  "pause.skin": "Kostüm",
  "pause.hat": "Şapka",
  "pause.charm": "Tılsım",
  "pause.bare": "Yok",
  "pause.none": "Yok",
  "pause.hint": "Kostüm değişiklikleri ana menüden — gardırop seçenekleri yılanı yeniden yükler.",
  "pause.resume": "Devam →",

  "common.cancel": "İptal",
  "common.close": "Kapat",
  "common.save": "Kaydet",
  "common.wear": "Giy",
  "common.locked": "Kilitli",
  "common.claim": "Topla",
  "common.claimed": "Toplandı",
  "common.owned": "Sahip",
  "common.signOut": "Çıkış",

  "streak.days": "gün",
  "streak.daysPlural": "gün",
  "streak.todayClaimed": "Bugün toplandı",
  "streak.maxTier": "En üst seviye",
  "streak.nextAt": "Sıradaki: gün {day}",

  "name.empty": "Başlamak için isim gir",
  "name.tooShort": "En az 1 karakter",
  "name.tooLong": "En fazla 16 karakter",
  "name.profanity": "Farklı bir isim dene"
};

const TABLES: Record<Locale, Record<StringKey, string>> = {
  en: STRINGS_EN,
  tr: STRINGS_TR
};

function detectInitialLocale(): Locale {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "en" || saved === "tr") return saved;
  } catch { /* ignore */ }
  if (typeof navigator !== "undefined") {
    const lang = navigator.language?.toLowerCase() ?? "";
    if (lang.startsWith("tr")) return "tr";
  }
  return "en";
}

let currentLocale: Locale = typeof window === "undefined" ? "en" : detectInitialLocale();

export function getLocale(): Locale {
  return currentLocale;
}

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
    window.dispatchEvent(new CustomEvent("slithera-locale-change", { detail: locale }));
  } catch { /* ignore */ }
}

function fmt(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

export function t(key: StringKey, params?: Record<string, string | number>): string {
  const table = TABLES[currentLocale] ?? STRINGS_EN;
  return fmt(table[key] ?? STRINGS_EN[key] ?? key, params);
}

export function useLocale(): { locale: Locale; setLocale: (l: Locale) => void; t: typeof t } {
  const [, force] = useState(0);
  useEffect(() => {
    const refresh = () => force((n) => n + 1);
    window.addEventListener("slithera-locale-change", refresh);
    return () => window.removeEventListener("slithera-locale-change", refresh);
  }, []);
  return {
    locale: currentLocale,
    setLocale,
    t
  };
}

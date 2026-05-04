export type MarketCategory = "skin" | "hat" | "charm";
export type MarketRarity = "common" | "rare" | "epic" | "myth";

export type MarketItem = {
  id: string;             // canonical id, prefixed: skin.x | hat.x | charm.x
  refId: string;          // raw id used by pickers (matches SNAKE_SKINS / HAT_OPTIONS / ROPE_ACCESSORIES)
  name: string;
  category: MarketCategory;
  glyph: string;
  price: number;
  rarity: MarketRarity;
  tagline: string;
};

export const MARKET_ITEMS: MarketItem[] = [
  { id: "skin.solar-gold", refId: "solar-gold", name: "Solar Gold", category: "skin", glyph: "🐍", price: 1500, rarity: "rare",  tagline: "Liquid sunlight in a coil." },
  { id: "skin.tide",       refId: "tide",       name: "Tide",       category: "skin", glyph: "🌊", price: 2200, rarity: "rare",  tagline: "Calm only at the deep." },
  { id: "skin.coal",       refId: "coal",       name: "Coal",       category: "skin", glyph: "🜚", price: 3000, rarity: "epic",  tagline: "Embers under ash." },
  { id: "skin.void-violet",refId: "void-violet",name: "Void Violet",category: "skin", glyph: "🜲", price: 3500, rarity: "epic",  tagline: "A hue that swallows light." },
  { id: "skin.rainbow",    refId: "rainbow",    name: "Rainbow",    category: "skin", glyph: "🌈", price: 5000, rarity: "myth",  tagline: "All hues, in motion." },

  { id: "hat.crown",   refId: "crown",   name: "Crown",   category: "hat", glyph: "👑", price: 4000, rarity: "myth", tagline: "Won by sustained dominance." },
  { id: "hat.wizard",  refId: "wizard",  name: "Wizard",  category: "hat", glyph: "🧙", price: 1800, rarity: "rare", tagline: "Now where did I leave my staff…" },
  { id: "hat.santa",   refId: "santa",   name: "Santa",   category: "hat", glyph: "🎅", price: 4500, rarity: "myth", tagline: "Limited holiday hat." },
  { id: "hat.top-hat", refId: "top-hat", name: "Top Hat", category: "hat", glyph: "🎩", price: 1600, rarity: "rare", tagline: "Civility, weaponized." },
  { id: "hat.party",   refId: "party",   name: "Party",   category: "hat", glyph: "🎉", price: 600,  rarity: "common", tagline: "Confetti for the modest." },
  { id: "hat.blade",   refId: "blade",   name: "Blade",   category: "hat", glyph: "⚔️", price: 2400, rarity: "rare", tagline: "Worn by tacticians." },

  { id: "charm.diamond", refId: "diamond", name: "Diamond", category: "charm", glyph: "💎", price: 2500, rarity: "epic",   tagline: "Dangling pressure, dangling proof." },
  { id: "charm.key",     refId: "key",     name: "Key",     category: "charm", glyph: "🗝️", price: 1200, rarity: "epic",   tagline: "Opens nothing, but it implies." },
  { id: "charm.skull",   refId: "skull",   name: "Skull",   category: "charm", glyph: "☠️", price: 800,  rarity: "rare",   tagline: "A small reminder." },
  { id: "charm.moon",    refId: "moon",    name: "Moon",    category: "charm", glyph: "🌙", price: 1000, rarity: "rare",   tagline: "Crescent on a string." },
  { id: "charm.cube",    refId: "cube",    name: "Cube",    category: "charm", glyph: "🎲", price: 500,  rarity: "common", tagline: "Six odds and an even." }
];

// Items that everyone gets for free (no purchase required)
const FREE_SKINS = new Set(["cyan-core", "embercoil", "venom-lime"]);
const FREE_HATS = new Set(["none", "halo", "visor"]);
const FREE_CHARMS = new Set(["none", "star", "bolt", "fire", "eye", "heart"]);

export function findMarketItemByRef(category: MarketCategory, refId: string): MarketItem | undefined {
  return MARKET_ITEMS.find((it) => it.category === category && it.refId === refId);
}

export function isFreeSkin(refId: string): boolean { return FREE_SKINS.has(refId); }
export function isFreeHat(refId: string): boolean { return FREE_HATS.has(refId); }
export function isFreeCharm(refId: string): boolean { return FREE_CHARMS.has(refId); }

export function ownsMarketRef(category: MarketCategory, refId: string, ownedIds: string[]): boolean {
  if (category === "skin" && isFreeSkin(refId)) return true;
  if (category === "hat" && isFreeHat(refId)) return true;
  if (category === "charm" && isFreeCharm(refId)) return true;
  const item = findMarketItemByRef(category, refId);
  if (!item) return true; // not in market = freely usable
  return ownedIds.includes(item.id);
}

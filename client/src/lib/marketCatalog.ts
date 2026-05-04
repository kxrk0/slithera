import type { Rarity } from "../../../shared/constants";

export type MarketCategory = "skin" | "hat" | "charm" | "trail";
export type MarketCurrency = "coins" | "gems";

export type MarketItem = {
  id: string;
  refId: string;
  name: string;
  category: MarketCategory;
  rarity: Rarity;
  tagline: string;
  currency: MarketCurrency;
  price: number;
};

export const MARKET_ITEMS: MarketItem[] = [
  // ── Skins — Coins ──────────────────────────────────────────────────────────
  { id: "skin.void-violet", refId: "void-violet", name: "Void Violet", category: "skin", rarity: "rare",      currency: "coins", price: 3500,  tagline: "A hue that swallows light." },
  { id: "skin.solar-gold",  refId: "solar-gold",  name: "Solar Gold",  category: "skin", rarity: "rare",      currency: "coins", price: 1500,  tagline: "Liquid sunlight in a coil." },
  { id: "skin.tide",        refId: "tide",        name: "Tide",        category: "skin", rarity: "epic",      currency: "coins", price: 2200,  tagline: "Calm only at the deep." },
  { id: "skin.coal",        refId: "coal",        name: "Coal",        category: "skin", rarity: "epic",      currency: "coins", price: 3000,  tagline: "Embers under ash." },
  { id: "skin.rainbow",     refId: "rainbow",     name: "Rainbow",     category: "skin", rarity: "mythic",    currency: "coins", price: 5000,  tagline: "All hues, in motion." },

  // ── Skins — Gems ───────────────────────────────────────────────────────────
  { id: "skin.shadow",   refId: "shadow",   name: "Shadow",   category: "skin", rarity: "uncommon",  currency: "gems", price: 200,   tagline: "The dark between stars." },
  { id: "skin.crimson",  refId: "crimson",  name: "Crimson",  category: "skin", rarity: "rare",      currency: "gems", price: 400,   tagline: "Blood of the arena." },
  { id: "skin.arctic",   refId: "arctic",   name: "Arctic",   category: "skin", rarity: "rare",      currency: "gems", price: 450,   tagline: "Frost before the thaw." },
  { id: "skin.sakura",   refId: "sakura",   name: "Sakura",   category: "skin", rarity: "rare",      currency: "gems", price: 500,   tagline: "Petals on a blade." },
  { id: "skin.poison",   refId: "poison",   name: "Poison",   category: "skin", rarity: "rare",      currency: "gems", price: 480,   tagline: "Beautiful. Lethal." },
  { id: "skin.midnight", refId: "midnight", name: "Midnight", category: "skin", rarity: "epic",      currency: "gems", price: 800,   tagline: "Where stars sink." },
  { id: "skin.chrome",   refId: "chrome",   name: "Chrome",   category: "skin", rarity: "epic",      currency: "gems", price: 900,   tagline: "Mirror-bright, edge-sharp." },
  { id: "skin.glacial",  refId: "glacial",  name: "Glacial",  category: "skin", rarity: "epic",      currency: "gems", price: 850,   tagline: "The patience of ice." },
  { id: "skin.obsidian", refId: "obsidian", name: "Obsidian", category: "skin", rarity: "legendary", currency: "gems", price: 1800,  tagline: "Forged in volcanic silence." },
  { id: "skin.lava",     refId: "lava",     name: "Lava",     category: "skin", rarity: "legendary", currency: "gems", price: 2000,  tagline: "The earth's last exhale." },
  { id: "skin.inferno",  refId: "inferno",  name: "Inferno",  category: "skin", rarity: "legendary", currency: "gems", price: 2200,  tagline: "Not fire. Fury." },
  { id: "skin.aurora",   refId: "aurora",   name: "Aurora",   category: "skin", rarity: "mythic",    currency: "gems", price: 4500,  tagline: "The sky, unchained." },

  // ── Hats — Coins ───────────────────────────────────────────────────────────
  { id: "hat.party",   refId: "party",   name: "Party",    category: "hat", rarity: "uncommon", currency: "coins", price: 600,   tagline: "Confetti for the modest." },
  { id: "hat.mortar",  refId: "mortar",  name: "Mortarboard", category: "hat", rarity: "uncommon", currency: "coins", price: 800, tagline: "Education as armor." },
  { id: "hat.hardhat", refId: "hardhat", name: "Hardhat",  category: "hat", rarity: "uncommon", currency: "coins", price: 700,   tagline: "Safety first, always." },
  { id: "hat.helm",    refId: "helm",    name: "Helm",     category: "hat", rarity: "rare",     currency: "coins", price: 1200,  tagline: "Worn by survivors." },
  { id: "hat.top-hat", refId: "top-hat", name: "Top Hat",  category: "hat", rarity: "rare",     currency: "coins", price: 1600,  tagline: "Civility, weaponized." },
  { id: "hat.wizard",  refId: "wizard",  name: "Wizard",   category: "hat", rarity: "rare",     currency: "coins", price: 1800,  tagline: "Now where did I leave my staff…" },
  { id: "hat.blade",   refId: "blade",   name: "Blade",    category: "hat", rarity: "rare",     currency: "coins", price: 2400,  tagline: "Worn by tacticians." },
  { id: "hat.crown",   refId: "crown",   name: "Crown",    category: "hat", rarity: "legendary",currency: "coins", price: 4000,  tagline: "Won by sustained dominance." },
  { id: "hat.santa",   refId: "santa",   name: "Santa",    category: "hat", rarity: "mythic",   currency: "coins", price: 4500,  tagline: "Limited holiday hat." },

  // ── Hats — Gems ────────────────────────────────────────────────────────────
  { id: "hat.cowboy",     refId: "cowboy",     name: "Cowboy",       category: "hat", rarity: "uncommon",  currency: "gems", price: 250,   tagline: "High noon. Always." },
  { id: "hat.ninja",      refId: "ninja",      name: "Ninja Band",   category: "hat", rarity: "uncommon",  currency: "gems", price: 280,   tagline: "The shadow wears a headband." },
  { id: "hat.flower",     refId: "flower",     name: "Flower Crown", category: "hat", rarity: "uncommon",  currency: "gems", price: 220,   tagline: "Soft outside, relentless inside." },
  { id: "hat.jester",     refId: "jester",     name: "Jester",       category: "hat", rarity: "rare",      currency: "gems", price: 550,   tagline: "The laugh hides the knife." },
  { id: "hat.detective",  refId: "detective",  name: "Detective",    category: "hat", rarity: "rare",      currency: "gems", price: 500,   tagline: "Nothing escapes the brim." },
  { id: "hat.horns",      refId: "horns",      name: "Devil Horns",  category: "hat", rarity: "epic",      currency: "gems", price: 900,   tagline: "Hell promoted you." },
  { id: "hat.angel",      refId: "angel",      name: "Angel Halo",   category: "hat", rarity: "epic",      currency: "gems", price: 950,   tagline: "Mercy is optional." },
  { id: "hat.ice-crown",  refId: "ice-crown",  name: "Ice Crown",    category: "hat", rarity: "epic",      currency: "gems", price: 1100,  tagline: "The cold that commands." },
  { id: "hat.viking",     refId: "viking",     name: "Viking",       category: "hat", rarity: "epic",      currency: "gems", price: 1000,  tagline: "From the northern dark." },
  { id: "hat.pharaoh",    refId: "pharaoh",    name: "Pharaoh",      category: "hat", rarity: "legendary", currency: "gems", price: 2000,  tagline: "Eternal. Unyielding." },
  { id: "hat.samurai",    refId: "samurai",    name: "Samurai",      category: "hat", rarity: "legendary", currency: "gems", price: 2200,  tagline: "One cut. Finished." },
  { id: "hat.fire-crown", refId: "fire-crown", name: "Fire Crown",   category: "hat", rarity: "legendary", currency: "gems", price: 2500,  tagline: "Kingship, on fire." },
  { id: "hat.plague",     refId: "plague",     name: "Plague Doctor",category: "hat", rarity: "legendary", currency: "gems", price: 2800,  tagline: "Cure is just another word." },
  { id: "hat.dark-crown", refId: "dark-crown", name: "Dark Crown",   category: "hat", rarity: "mythic",    currency: "gems", price: 5000,  tagline: "The throne at the end of all things." },

  // ── Charms — Coins ─────────────────────────────────────────────────────────
  { id: "charm.skull",    refId: "skull",    name: "Skull",   category: "charm", rarity: "uncommon", currency: "coins", price: 800,   tagline: "A small reminder." },
  { id: "charm.moon",     refId: "moon",     name: "Moon",    category: "charm", rarity: "uncommon", currency: "coins", price: 1000,  tagline: "Crescent on a string." },
  { id: "charm.cube",     refId: "cube",     name: "Cube",    category: "charm", rarity: "uncommon", currency: "coins", price: 500,   tagline: "Six odds and an even." },
  { id: "charm.diamond",  refId: "diamond",  name: "Diamond", category: "charm", rarity: "rare",     currency: "coins", price: 2500,  tagline: "Dangling pressure, dangling proof." },
  { id: "charm.key",      refId: "key",      name: "Key",     category: "charm", rarity: "rare",     currency: "coins", price: 1200,  tagline: "Opens nothing, but it implies." },

  // ── Charms — Gems ──────────────────────────────────────────────────────────
  { id: "charm.anchor",     refId: "anchor",     name: "Anchor",    category: "charm", rarity: "uncommon",  currency: "gems", price: 180,   tagline: "Weight as identity." },
  { id: "charm.shield",     refId: "shield",     name: "Shield",    category: "charm", rarity: "uncommon",  currency: "gems", price: 200,   tagline: "Defence you can see." },
  { id: "charm.snowflake",  refId: "snowflake",  name: "Snowflake", category: "charm", rarity: "uncommon",  currency: "gems", price: 220,   tagline: "Unique, like you." },
  { id: "charm.gear",       refId: "gear",       name: "Gear",      category: "charm", rarity: "uncommon",  currency: "gems", price: 190,   tagline: "Mechanical soul." },
  { id: "charm.cross",      refId: "cross",      name: "Cross",     category: "charm", rarity: "uncommon",  currency: "gems", price: 170,   tagline: "Faith in the fight." },
  { id: "charm.feather",    refId: "feather",    name: "Feather",   category: "charm", rarity: "uncommon",  currency: "gems", price: 210,   tagline: "Light enough to cut." },
  { id: "charm.clover",     refId: "clover",     name: "Clover",    category: "charm", rarity: "uncommon",  currency: "gems", price: 200,   tagline: "Four leaves, no guarantees." },
  { id: "charm.trident",    refId: "trident",    name: "Trident",   category: "charm", rarity: "rare",      currency: "gems", price: 380,   tagline: "The sea's authority." },
  { id: "charm.sword",      refId: "sword",      name: "Sword",     category: "charm", rarity: "rare",      currency: "gems", price: 400,   tagline: "Argument settled." },
  { id: "charm.infinity",   refId: "infinity",   name: "Infinity",  category: "charm", rarity: "rare",      currency: "gems", price: 420,   tagline: "No beginning. No end." },
  { id: "charm.hourglass",  refId: "hourglass",  name: "Hourglass", category: "charm", rarity: "rare",      currency: "gems", price: 360,   tagline: "Sand runs for everyone." },
  { id: "charm.compass",    refId: "compass",    name: "Compass",   category: "charm", rarity: "rare",      currency: "gems", price: 450,   tagline: "Always pointing somewhere." },
  { id: "charm.spiral",     refId: "spiral",     name: "Spiral",    category: "charm", rarity: "rare",      currency: "gems", price: 400,   tagline: "The golden ratio, dangling." },
  { id: "charm.rune",       refId: "rune",       name: "Rune",      category: "charm", rarity: "rare",      currency: "gems", price: 440,   tagline: "Ancient script, modern menace." },
  { id: "charm.atom",       refId: "atom",       name: "Atom",      category: "charm", rarity: "epic",      currency: "gems", price: 750,   tagline: "Everything is this." },
  { id: "charm.crystal",    refId: "crystal",    name: "Crystal",   category: "charm", rarity: "epic",      currency: "gems", price: 800,   tagline: "Clarity under pressure." },
  { id: "charm.crown-charm",refId: "crown-charm",name: "Crown",     category: "charm", rarity: "epic",      currency: "gems", price: 900,   tagline: "Tiny throne, same weight." },
  { id: "charm.dragon",     refId: "dragon",     name: "Dragon",    category: "charm", rarity: "legendary", currency: "gems", price: 1800,  tagline: "The myth that bites." },
  { id: "charm.phoenix",    refId: "phoenix",    name: "Phoenix",   category: "charm", rarity: "legendary", currency: "gems", price: 2000,  tagline: "From the ash, again." },
  { id: "charm.orb",        refId: "orb",        name: "Void Orb",  category: "charm", rarity: "legendary", currency: "gems", price: 2200,  tagline: "The silence inside a collapse." },

  // ── Trails — Gems ──────────────────────────────────────────────────────────
  { id: "trail.sparkle",       refId: "sparkle",       name: "Sparkle",   category: "trail", rarity: "common",    currency: "gems", price: 120,   tagline: "Small glitters, big statement." },
  { id: "trail.shadow-trail",  refId: "shadow-trail",  name: "Umbra",     category: "trail", rarity: "uncommon",  currency: "gems", price: 320,   tagline: "Where you've been disappears." },
  { id: "trail.fire-trail",    refId: "fire-trail",    name: "Inferno",   category: "trail", rarity: "rare",      currency: "gems", price: 650,   tagline: "The path stays lit." },
  { id: "trail.ice-trail",     refId: "ice-trail",     name: "Glacial",   category: "trail", rarity: "rare",      currency: "gems", price: 600,   tagline: "Freeze everything you pass." },
  { id: "trail.rainbow-trail", refId: "rainbow-trail", name: "Prismatic", category: "trail", rarity: "rare",      currency: "gems", price: 700,   tagline: "Impossible to ignore." },
  { id: "trail.sakura-trail",  refId: "sakura-trail",  name: "Sakura",    category: "trail", rarity: "rare",      currency: "gems", price: 680,   tagline: "Petals in your wake." },
  { id: "trail.void-trail",    refId: "void-trail",    name: "Void",      category: "trail", rarity: "epic",      currency: "gems", price: 1100,  tagline: "Nothing follows." },
  { id: "trail.gold-trail",    refId: "gold-trail",    name: "Gilded",    category: "trail", rarity: "epic",      currency: "gems", price: 1200,  tagline: "Everything you touch turns." },
  { id: "trail.lightning-trail",refId:"lightning-trail",name: "Stormborn",category: "trail", rarity: "epic",      currency: "gems", price: 1150,  tagline: "Electric from birth." },
  { id: "trail.aurora-trail",  refId: "aurora-trail",  name: "Aurora",    category: "trail", rarity: "legendary", currency: "gems", price: 2500,  tagline: "Northern lights, made personal." },
];

// ── Free item sets ────────────────────────────────────────────────────────────
const FREE_SKINS  = new Set(["cyan-core", "embercoil", "venom-lime"]);
const FREE_HATS   = new Set(["none", "halo", "visor", "cap", "bunny"]);
const FREE_CHARMS = new Set(["none", "star", "bolt", "fire", "eye", "heart", "arrow"]);
const FREE_TRAILS = new Set(["none"]);

export function isFreeSkin(refId: string):  boolean { return FREE_SKINS.has(refId); }
export function isFreeHat(refId: string):   boolean { return FREE_HATS.has(refId); }
export function isFreeCharm(refId: string): boolean { return FREE_CHARMS.has(refId); }
export function isFreeTrail(refId: string): boolean { return FREE_TRAILS.has(refId); }

export function findMarketItemByRef(category: MarketCategory, refId: string): MarketItem | undefined {
  return MARKET_ITEMS.find((it) => it.category === category && it.refId === refId);
}

export function ownsMarketRef(category: MarketCategory, refId: string, ownedIds: string[]): boolean {
  if (category === "skin"  && isFreeSkin(refId))  return true;
  if (category === "hat"   && isFreeHat(refId))   return true;
  if (category === "charm" && isFreeCharm(refId)) return true;
  if (category === "trail" && isFreeTrail(refId)) return true;
  const item = findMarketItemByRef(category, refId);
  if (!item) return true;
  return ownedIds.includes(item.id);
}

export const WORLD_WIDTH = 5200;
export const WORLD_HEIGHT = 3400;
export const TICK_RATE = 60;
export const SNAPSHOT_RATE = 30;
export const MIN_ACTIVE_SNAKES = 6;
export const MAX_ACTIVE_SNAKES = 14;
export const TARGET_BOTS_PER_HUMAN = 4;
export const MAX_FOOD = 260;
export const MAX_FOOD_AFTER_DROPS = 520;
export const START_LENGTH = 10;
export const SCORE_PER_SEGMENT = 8;
export const MIN_SCORE = 0;
export const MAX_SEGMENTS = 260;
export const BASE_SPEED = 168;
export const BOOST_SPEED = 300;
export const TURN_RATE = 2.35;
export const SEGMENT_SPACING = 18;
// Server only sends entities within this radius around the player's head (snapshot bandwidth).
// Picked to comfortably cover the smallest zoom (~0.55× → diagonal half ≈ 2000px) plus padding.
export const VIEW_RADIUS = 2800;
export const TAIL_GROW_SEGMENTS_PER_SECOND = 5.5;
export const TAIL_SHRINK_SEGMENTS_PER_SECOND = 14;
export const HEAD_RADIUS = 16;
export const BODY_RADIUS = 14;
export const FOOD_RADIUS = 8;
export const FOOD_SCORE = 1;
export const FOOD_DRIFT_SPEED = 10;
export const FOOD_ATTRACT_RADIUS = 90;
export const FOOD_ATTRACT_SPEED = 80;
export const BOOST_SHRINK_SCORE_PER_SECOND = 3;
export const BOOST_MAX = 100;
export const BOOST_DRAIN_PER_SECOND = 30;
export const BOOST_REFILL_PER_SECOND = 18;
export const BOOST_MIN_TO_START = 6;
export const SELF_COLLISION_SKIP_SEGMENTS = 8;
export const RESPAWN_DELAY_MS = 1400;

export const PLAYER_COLORS = [
  "#22d8ff",
  "#ff6a43",
  "#a6ff3f",
  "#b15cff",
  "#ffd24d",
  "#ff4f93",
  "#42f5b3",
  "#7f8cff"
] as const;

export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic";

export const RARITY_COLOR: Record<Rarity, string> = {
  common:    "#aaaaaa",
  uncommon:  "#57c757",
  rare:      "#4a9eff",
  epic:      "#c060ff",
  legendary: "#ffa040",
  mythic:    "#ff6ec7",
};

export const SNAKE_SKINS = [
  // ── Free skins ─────────────────────────────────────────────────────────────
  { id: "cyan-core",   name: "Cyan Core",   color: "#22d8ff", accent: "#b9f6ff", shadow: "#075c76",  rarity: "common"    as Rarity },
  { id: "embercoil",   name: "Embercoil",   color: "#ff6a43", accent: "#ffd2a8", shadow: "#6b1b13",  rarity: "common"    as Rarity },
  { id: "venom-lime",  name: "Venom Lime",  color: "#a6ff3f", accent: "#f1ffd2", shadow: "#33680d",  rarity: "common"    as Rarity },

  // ── Coin skins ─────────────────────────────────────────────────────────────
  { id: "void-violet", name: "Void Violet", color: "#b15cff", accent: "#ead4ff", shadow: "#3a1169",  rarity: "rare"      as Rarity },
  { id: "solar-gold",  name: "Solar Gold",  color: "#ffd24d", accent: "#fff3bd", shadow: "#6d4a05",  rarity: "rare"      as Rarity },
  { id: "tide",        name: "Tide",        color: "#1ec3b8", accent: "#aef5ee", shadow: "#0a4f4b",  rarity: "epic"      as Rarity },
  { id: "coal",        name: "Coal",        color: "#3a3a3f", accent: "#ff5252", shadow: "#0e0e10",  rarity: "epic"      as Rarity },
  { id: "rainbow",     name: "Rainbow",     color: "#ff6b9a", accent: "#ffe3a3", shadow: "#7e30c4",  rarity: "mythic"    as Rarity },
  { id: "lotus",       name: "Lotus",       color: "#f472b6", accent: "#fce7f3", shadow: "#831843",  rarity: "mythic"    as Rarity },

  // ── Gem skins ──────────────────────────────────────────────────────────────
  { id: "shadow",      name: "Shadow",      color: "#2d2d3a", accent: "#9b59b6", shadow: "#0f0f14",  rarity: "uncommon"  as Rarity },
  { id: "crimson",     name: "Crimson",     color: "#dc143c", accent: "#ff8096", shadow: "#7b0a1f",  rarity: "rare"      as Rarity },
  { id: "arctic",      name: "Arctic",      color: "#c8eeff", accent: "#ffffff", shadow: "#4a90b8",  rarity: "rare"      as Rarity },
  { id: "sakura",      name: "Sakura",      color: "#ffb7c5", accent: "#fff0f3", shadow: "#c96089",  rarity: "rare"      as Rarity },
  { id: "poison",      name: "Poison",      color: "#39ff14", accent: "#b8ff8c", shadow: "#1a6600",  rarity: "rare"      as Rarity },
  { id: "midnight",    name: "Midnight",    color: "#1a1a4e", accent: "#6d9fff", shadow: "#09091f",  rarity: "epic"      as Rarity },
  { id: "chrome",      name: "Chrome",      color: "#b0b8c4", accent: "#ffffff", shadow: "#4a5060",  rarity: "epic"      as Rarity },
  { id: "glacial",     name: "Glacial",     color: "#7dd8e8", accent: "#d4f5fc", shadow: "#1e6a7a",  rarity: "epic"      as Rarity },
  { id: "obsidian",    name: "Obsidian",    color: "#1e1e2e", accent: "#c9a227", shadow: "#0a0a12",  rarity: "legendary" as Rarity },
  { id: "lava",        name: "Lava",        color: "#ff4500", accent: "#ffb347", shadow: "#8b1a00",  rarity: "legendary" as Rarity },
  { id: "inferno",     name: "Inferno",     color: "#8b0000", accent: "#ff6600", shadow: "#3d0000",  rarity: "legendary" as Rarity },
  { id: "aurora",      name: "Aurora",      color: "#00e5ff", accent: "#e040fb", shadow: "#004d66",  rarity: "mythic"    as Rarity },
] as const;

export const BOT_NAMES = [
  "NeonRift", "Bytecoil", "Voidrunner", "Fluxion", "SerpntX",
  "Zynapse", "Chromatic", "DataWyrm", "PixelPython", "IonViper"
] as const;

export const ROPE_ACCESSORIES = [
  // ── Free ───────────────────────────────────────────────────────────────────
  { id: "none",       name: "None",       rarity: "common"    as Rarity },
  { id: "star",       name: "Star",       rarity: "common"    as Rarity },
  { id: "bolt",       name: "Bolt",       rarity: "common"    as Rarity },
  { id: "fire",       name: "Fire",       rarity: "common"    as Rarity },
  { id: "eye",        name: "Eye",        rarity: "common"    as Rarity },
  { id: "heart",      name: "Heart",      rarity: "common"    as Rarity },
  { id: "arrow",      name: "Arrow",      rarity: "common"    as Rarity },

  // ── Uncommon ───────────────────────────────────────────────────────────────
  { id: "skull",      name: "Skull",      rarity: "uncommon"  as Rarity },
  { id: "moon",       name: "Moon",       rarity: "uncommon"  as Rarity },
  { id: "cube",       name: "Cube",       rarity: "uncommon"  as Rarity },
  { id: "shield",     name: "Shield",     rarity: "uncommon"  as Rarity },
  { id: "snowflake",  name: "Snowflake",  rarity: "uncommon"  as Rarity },
  { id: "gear",       name: "Gear",       rarity: "uncommon"  as Rarity },
  { id: "cross",      name: "Cross",      rarity: "uncommon"  as Rarity },
  { id: "feather",    name: "Feather",    rarity: "uncommon"  as Rarity },
  { id: "clover",     name: "Clover",     rarity: "uncommon"  as Rarity },
  { id: "anchor",     name: "Anchor",     rarity: "uncommon"  as Rarity },

  // ── Rare ───────────────────────────────────────────────────────────────────
  { id: "diamond",    name: "Diamond",    rarity: "rare"      as Rarity },
  { id: "key",        name: "Key",        rarity: "rare"      as Rarity },
  { id: "trident",    name: "Trident",    rarity: "rare"      as Rarity },
  { id: "sword",      name: "Sword",      rarity: "rare"      as Rarity },
  { id: "infinity",   name: "Infinity",   rarity: "rare"      as Rarity },
  { id: "hourglass",  name: "Hourglass",  rarity: "rare"      as Rarity },
  { id: "compass",    name: "Compass",    rarity: "rare"      as Rarity },
  { id: "spiral",     name: "Spiral",     rarity: "rare"      as Rarity },
  { id: "rune",       name: "Rune",       rarity: "rare"      as Rarity },

  // ── Epic ───────────────────────────────────────────────────────────────────
  { id: "atom",       name: "Atom",       rarity: "epic"      as Rarity },
  { id: "crystal",    name: "Crystal",    rarity: "epic"      as Rarity },
  { id: "crown-charm",name: "Crown",      rarity: "epic"      as Rarity },

  // ── Legendary ──────────────────────────────────────────────────────────────
  { id: "dragon",     name: "Dragon",     rarity: "legendary" as Rarity },
  { id: "phoenix",    name: "Phoenix",    rarity: "legendary" as Rarity },
  { id: "orb",        name: "Void Orb",   rarity: "legendary" as Rarity },

  // ── Exclusive ──────────────────────────────────────────────────────────────
  { id: "venus",      name: "Venüs",      rarity: "mythic"    as Rarity },
] as const;

export type RopeAccessoryId = typeof ROPE_ACCESSORIES[number]["id"];

export const HAT_OPTIONS = [
  // ── Free ───────────────────────────────────────────────────────────────────
  { id: "none",       name: "Bare",          mark: "—",  rarity: ""            },
  { id: "halo",       name: "Halo",          mark: "◯",  rarity: "common"      as Rarity },
  { id: "visor",      name: "Visor",         mark: "◧",  rarity: "common"      as Rarity },
  { id: "cap",        name: "Cap",           mark: "▲",  rarity: "common"      as Rarity },
  { id: "bunny",      name: "Bunny Ears",    mark: "∩∩", rarity: "common"      as Rarity },

  // ── Uncommon ───────────────────────────────────────────────────────────────
  { id: "ninja",      name: "Ninja Band",    mark: "≡",  rarity: "uncommon"    as Rarity },
  { id: "flower",     name: "Flower Crown",  mark: "✿",  rarity: "uncommon"    as Rarity },
  { id: "party",      name: "Party",         mark: "✦",  rarity: "uncommon"    as Rarity },
  { id: "mortar",     name: "Mortarboard",   mark: "⊓",  rarity: "uncommon"    as Rarity },
  { id: "hardhat",    name: "Hardhat",       mark: "⌂",  rarity: "uncommon"    as Rarity },
  { id: "cowboy",     name: "Cowboy",        mark: "∪",  rarity: "uncommon"    as Rarity },

  // ── Rare ───────────────────────────────────────────────────────────────────
  { id: "helm",       name: "Helm",          mark: "◆",  rarity: "rare"        as Rarity },
  { id: "top-hat",    name: "Top Hat",       mark: "⊤",  rarity: "rare"        as Rarity },
  { id: "wizard",     name: "Wizard",        mark: "✦",  rarity: "rare"        as Rarity },
  { id: "blade",      name: "Blade",         mark: "✕",  rarity: "rare"        as Rarity },
  { id: "detective",  name: "Detective",     mark: "◇",  rarity: "rare"        as Rarity },
  { id: "jester",     name: "Jester",        mark: "✛",  rarity: "rare"        as Rarity },

  // ── Epic ───────────────────────────────────────────────────────────────────
  { id: "horns",      name: "Devil Horns",   mark: "∧",  rarity: "epic"        as Rarity },
  { id: "angel",      name: "Angel Halo",    mark: "◎",  rarity: "epic"        as Rarity },
  { id: "ice-crown",  name: "Ice Crown",     mark: "✧",  rarity: "epic"        as Rarity },
  { id: "viking",     name: "Viking",        mark: "⋈",  rarity: "epic"        as Rarity },

  // ── Legendary ──────────────────────────────────────────────────────────────
  { id: "crown",      name: "Crown",         mark: "♛",  rarity: "legendary"   as Rarity },
  { id: "pharaoh",    name: "Pharaoh",       mark: "Ψ",  rarity: "legendary"   as Rarity },
  { id: "samurai",    name: "Samurai",       mark: "⊕",  rarity: "legendary"   as Rarity },
  { id: "fire-crown", name: "Fire Crown",    mark: "✸",  rarity: "legendary"   as Rarity },
  { id: "plague",     name: "Plague Doctor", mark: "✝",  rarity: "legendary"   as Rarity },

  // ── Mythic ─────────────────────────────────────────────────────────────────
  { id: "dark-crown", name: "Dark Crown",    mark: "⬧",  rarity: "mythic"      as Rarity },
  { id: "santa",      name: "Santa",         mark: "✦",  rarity: "mythic"      as Rarity },
] as const;

export type HatId = typeof HAT_OPTIONS[number]["id"];

export const TRAIL_OPTIONS = [
  { id: "none",           name: "None",        rarity: "common"    as Rarity },
  { id: "sparkle",        name: "Sparkle",     rarity: "common"    as Rarity },
  { id: "shadow-trail",   name: "Umbra",       rarity: "uncommon"  as Rarity },
  { id: "fire-trail",     name: "Inferno",     rarity: "rare"      as Rarity },
  { id: "ice-trail",      name: "Glacial",     rarity: "rare"      as Rarity },
  { id: "rainbow-trail",  name: "Prismatic",   rarity: "rare"      as Rarity },
  { id: "sakura-trail",   name: "Sakura",      rarity: "rare"      as Rarity },
  { id: "void-trail",     name: "Void",        rarity: "epic"      as Rarity },
  { id: "gold-trail",     name: "Gilded",      rarity: "epic"      as Rarity },
  { id: "lightning-trail",name: "Stormborn",   rarity: "epic"      as Rarity },
  { id: "aurora-trail",   name: "Aurora",      rarity: "legendary" as Rarity },
] as const;

export type TrailId = typeof TRAIL_OPTIONS[number]["id"];

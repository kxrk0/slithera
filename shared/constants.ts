export const WORLD_WIDTH = 5200;
export const WORLD_HEIGHT = 3400;
export const TICK_RATE = 60;
export const SNAPSHOT_RATE = 45;
export const MIN_ACTIVE_SNAKES = 6;
export const MAX_FOOD = 240;
export const MAX_FOOD_AFTER_DROPS = 380;
export const START_LENGTH = 22;
export const SCORE_PER_SEGMENT = 3;
export const MIN_SCORE = 70;
export const MAX_SEGMENTS = 260;
export const BASE_SPEED = 168;
export const BOOST_SPEED = 300;
export const TURN_RATE = 2.35;
export const SEGMENT_SPACING = 18;
export const TAIL_GROW_SEGMENTS_PER_SECOND = 5.5;
export const TAIL_SHRINK_SEGMENTS_PER_SECOND = 14;
export const HEAD_RADIUS = 16;
export const BODY_RADIUS = 14;
export const FOOD_RADIUS = 8;
export const FOOD_SCORE = 2;
export const FOOD_DRIFT_SPEED = 10;
export const FOOD_ATTRACT_RADIUS = 185;
export const FOOD_ATTRACT_SPEED = 390;
export const BOOST_SHRINK_SCORE_PER_SECOND = 8;
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

export const SNAKE_SKINS = [
  {
    id: "cyan-core",
    name: "Cyan Core",
    color: "#22d8ff",
    accent: "#b9f6ff",
    shadow: "#075c76"
  },
  {
    id: "embercoil",
    name: "Embercoil",
    color: "#ff6a43",
    accent: "#ffd2a8",
    shadow: "#6b1b13"
  },
  {
    id: "venom-lime",
    name: "Venom Lime",
    color: "#a6ff3f",
    accent: "#f1ffd2",
    shadow: "#33680d"
  },
  {
    id: "void-violet",
    name: "Void Violet",
    color: "#b15cff",
    accent: "#ead4ff",
    shadow: "#3a1169"
  },
  {
    id: "solar-gold",
    name: "Solar Gold",
    color: "#ffd24d",
    accent: "#fff3bd",
    shadow: "#6d4a05"
  }
] as const;

export const BOT_NAMES = [
  "NeonRift",
  "Bytecoil",
  "Voidrunner",
  "Fluxion",
  "SerpntX",
  "Zynapse",
  "Chromatic",
  "DataWyrm",
  "PixelPython",
  "IonViper"
] as const;

export const ROPE_ACCESSORIES = [
  { id: "none",    name: "None"    },
  { id: "skull",   name: "Skull"   },
  { id: "star",    name: "Star"    },
  { id: "diamond", name: "Diamond" },
  { id: "bolt",    name: "Bolt"    },
  { id: "fire",    name: "Fire"    },
  { id: "eye",     name: "Eye"     },
  { id: "heart",   name: "Heart"   }
] as const;

export type RopeAccessoryId = typeof ROPE_ACCESSORIES[number]["id"];

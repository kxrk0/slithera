export type EntityId = string;

export type Vec2 = {
  x: number;
  y: number;
};

export type SnakeSegment = Vec2;

export type PlayerState = {
  id: EntityId;
  name: string;
  skinId: string;
  color: string;
  accent: string;
  score: number;
  boost: number;
  alive: boolean;
  bot: boolean;
  boosting: boolean;
  speed: number;
  heading: number;
  targetHeading: number;
  segments: SnakeSegment[];
  segmentProgress: number;
  kills: number;
  deathAt?: number;
  lastKillerId?: string;
  lastKillerName?: string;
  ropeAccessoryId?: string;
  hatId?: string;
};

export type FoodPellet = Vec2 & {
  id: EntityId;
  color: string;
  value: number;
  driftAngle: number;
  driftSpeed: number;
  // "drop" = chunk dropped by a dead snake (rendered as flesh, not pellet).
  // Omitted/undefined = ordinary food pellet.
  kind?: "drop";
};

export type LeaderboardEntry = {
  id: EntityId;
  name: string;
  score: number;
  color: string;
  hatId?: string;
  skinId?: string;
  you?: boolean;
};

export type ClientInput = {
  heading: number;
  boosting: boolean;
};

export type EmoteId = "wave" | "laugh" | "skull" | "fire" | "heart" | "shock";

export type ClientMessage =
  | { type: "join"; name: string; skinId?: string; ropeAccessoryId?: string; hatId?: string; uid?: string }
  | { type: "input"; input: ClientInput; seq: number }
  | { type: "ping"; nonce: number }
  | { type: "respawn" }
  | { type: "emote"; emoteId: EmoteId };

export type ServerSnapshot = {
  type: "snapshot";
  tick: number;
  serverTime: number;
  players: PlayerState[];
  food: FoodPellet[];
  leaderboard: LeaderboardEntry[];
};

export type GameEvent =
  | { type: "joined"; id: EntityId; name: string }
  | { type: "death"; id: EntityId; killerId?: EntityId }
  | { type: "food"; id: EntityId; playerId: EntityId; value: number }
  | { type: "respawned"; id: EntityId }
  | { type: "emote"; playerId: EntityId; emoteId: EmoteId };

export type ServerMessage =
  | { type: "welcome"; id: EntityId; snapshot: ServerSnapshot }
  | ServerSnapshot
  | { type: "event"; event: GameEvent }
  | { type: "pong"; nonce: number; serverTime: number }
  | { type: "error"; message: string };

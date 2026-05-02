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
};

export type FoodPellet = Vec2 & {
  id: EntityId;
  color: string;
  value: number;
  driftAngle: number;
  driftSpeed: number;
};

export type LeaderboardEntry = {
  id: EntityId;
  name: string;
  score: number;
  color: string;
  you?: boolean;
};

export type ClientInput = {
  heading: number;
  boosting: boolean;
};

export type ClientMessage =
  | { type: "join"; name: string; skinId?: string }
  | { type: "input"; input: ClientInput; seq: number }
  | { type: "ping"; nonce: number }
  | { type: "respawn" };

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
  | { type: "respawned"; id: EntityId };

export type ServerMessage =
  | { type: "welcome"; id: EntityId; snapshot: ServerSnapshot }
  | ServerSnapshot
  | { type: "event"; event: GameEvent }
  | { type: "pong"; nonce: number; serverTime: number }
  | { type: "error"; message: string };

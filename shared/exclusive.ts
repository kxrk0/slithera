// Exclusive cosmetics keyed by their picker id (matches SNAKE_SKINS / ROPE_ACCESSORIES).
// Validated on BOTH client and server: the server is authoritative.

export const EXCLUSIVE_SKIN_OWNERS: Record<string, string[]> = {
  "lotus": ["zYTbPkl580S3kW3fvEg8gXfoRp83", "rQWCri0lm0YdFDCGanaf3RHZAZq1"]
};

export const EXCLUSIVE_CHARM_OWNERS: Record<string, string[]> = {
  "venus": ["zYTbPkl580S3kW3fvEg8gXfoRp83", "rQWCri0lm0YdFDCGanaf3RHZAZq1"]
};

// Developer UIDs — these players receive the DEV badge in-game and on the leaderboard.
export const DEV_UIDS: readonly string[] = ["zYTbPkl580S3kW3fvEg8gXfoRp83"];

export function isDevUid(uid: string | undefined): boolean {
  return uid !== undefined && (DEV_UIDS as readonly string[]).includes(uid);
}

export function canUseSkinFor(skinId: string, uid: string | undefined): boolean {
  const allowed = EXCLUSIVE_SKIN_OWNERS[skinId];
  if (!allowed) return true;
  return uid !== undefined && allowed.includes(uid);
}

export function canUseCharmFor(charmId: string, uid: string | undefined): boolean {
  const allowed = EXCLUSIVE_CHARM_OWNERS[charmId];
  if (!allowed) return true;
  return uid !== undefined && allowed.includes(uid);
}

export function isExclusiveSkinId(skinId: string): boolean {
  return skinId in EXCLUSIVE_SKIN_OWNERS;
}

export function isExclusiveCharmId(charmId: string): boolean {
  return charmId in EXCLUSIVE_CHARM_OWNERS;
}

import {
  canUseCharmFor,
  canUseSkinFor,
  isExclusiveCharmId,
  isExclusiveSkinId
} from "../../../shared/exclusive";

export function canUseSkin(skinId: string, uid: string | undefined): boolean {
  return canUseSkinFor(skinId, uid);
}

export function isExclusiveSkin(skinId: string): boolean {
  return isExclusiveSkinId(skinId);
}

export function canUseCharm(charmId: string, uid: string | undefined): boolean {
  return canUseCharmFor(charmId, uid);
}

export function isExclusiveCharm(charmId: string): boolean {
  return isExclusiveCharmId(charmId);
}

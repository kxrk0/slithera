import { describe, expect, it } from "vitest";
import {
  canUseCharmFor,
  canUseSkinFor,
  isExclusiveCharmId,
  isExclusiveSkinId
} from "../shared/exclusive";
import { createPlayer, createWorld } from "../shared/simulation";

const OWNER_UID = "zYTbPkl580S3kW3fvEg8gXfoRp83";

describe("exclusive cosmetic gating", () => {
  it("identifies exclusive ids", () => {
    expect(isExclusiveSkinId("lotus")).toBe(true);
    expect(isExclusiveSkinId("cyan-core")).toBe(false);
    expect(isExclusiveCharmId("venus")).toBe(true);
    expect(isExclusiveCharmId("skull")).toBe(false);
  });

  it("permits owners and rejects others", () => {
    expect(canUseSkinFor("lotus", OWNER_UID)).toBe(true);
    expect(canUseSkinFor("lotus", "someone-else")).toBe(false);
    expect(canUseSkinFor("lotus", undefined)).toBe(false);
    expect(canUseCharmFor("venus", OWNER_UID)).toBe(true);
    expect(canUseCharmFor("venus", undefined)).toBe(false);
  });

  it("non-exclusive skin/charm always allowed", () => {
    expect(canUseSkinFor("cyan-core", undefined)).toBe(true);
    expect(canUseCharmFor("skull", undefined)).toBe(true);
  });

  it("createPlayer drops exclusive skin without UID", () => {
    const world = createWorld(123);
    const player = createPlayer(world, "human_a", "Alice", false, "lotus", "venus", "none");
    expect(player.skinId).not.toBe("lotus");
    expect(player.ropeAccessoryId).not.toBe("venus");
  });

  it("createPlayer keeps exclusive skin for the right UID", () => {
    const world = createWorld(456);
    const player = createPlayer(world, "human_b", "Bob", false, "lotus", "venus", "none", OWNER_UID);
    expect(player.skinId).toBe("lotus");
    expect(player.ropeAccessoryId).toBe("venus");
  });
});

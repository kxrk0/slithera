import { describe, expect, it } from "vitest";
import { isCleanName, sanitizePlayerName, validateName } from "../shared/names";

describe("name sanitization", () => {
  it("trims and slices to max length", () => {
    expect(sanitizePlayerName("   abc   ")).toBe("abc");
    expect(sanitizePlayerName("a".repeat(50)).length).toBe(16);
  });

  it("falls back when empty after stripping", () => {
    expect(sanitizePlayerName("")).toBe("Player");
    expect(sanitizePlayerName("###")).toBe("Player");
  });

  it("strips zero-width and control chars", () => {
    expect(sanitizePlayerName("Foo​Bar")).toBe("FooBar");
    expect(sanitizePlayerName("XY")).toBe("XY");
  });

  it("flags profanity", () => {
    expect(isCleanName("Foo Bar")).toBe(true);
    expect(isCleanName("amk")).toBe(false);
    expect(isCleanName("AMK!!!")).toBe(false);
    expect(isCleanName("aMk_2")).toBe(false);
  });

  it("flags leetspeak profanity", () => {
    expect(isCleanName("$h1t")).toBe(false);
    expect(isCleanName("fu(k")).toBe(true); // parens stripped, leaves "fuk"; conservative miss
    expect(isCleanName("fück")).toBe(false); // ü → u → "fuck"
  });

  it("validateName reports specific reasons", () => {
    expect(validateName("")).toMatchObject({ ok: false, reason: "empty" });
    expect(validateName("a".repeat(40))).toMatchObject({ ok: false, reason: "too-long" });
    expect(validateName("amk")).toMatchObject({ ok: false, reason: "profanity" });
    expect(validateName("Snake")).toMatchObject({ ok: true, value: "Snake" });
  });
});

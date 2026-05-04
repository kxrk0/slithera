// Shared name sanitization. The server is authoritative — clients can ALSO
// run this for instant UI feedback, but the value committed to the world is
// what `sanitizePlayerName` returns on the server.

const MAX_LEN = 16;
const MIN_LEN = 1;

// Conservative profanity list (English + Turkish). Token-based: matches
// substrings after normalization (lowercased, collapsed leetspeak).
const BAD_TOKENS: ReadonlyArray<string> = [
  "fuck", "shit", "bitch", "asshole", "cunt", "dick", "pussy", "slut",
  "whore", "bastard", "faggot", "nigger", "nigga", "retard", "rape",
  "amk", "amq", "amcik", "orospu", "pic", "siktir",
  "gotveren", "yarrak", "yarak", "ibne", "kahpe", "siko",
  "anasini"
];

// Map common leetspeak/diacritic substitutions to ascii.
const LEET_MAP: Record<string, string> = {
  "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s",
  "ç": "c", "ğ": "g", "ı": "i", "ö": "o", "ş": "s", "ü": "u",
  "Ç": "c", "Ğ": "g", "İ": "i", "Ö": "o", "Ş": "s", "Ü": "u"
};

function normalizeForFilter(value: string): string {
  let out = "";
  for (const ch of value.toLowerCase()) {
    out += LEET_MAP[ch] ?? ch;
  }
  return out.replace(/[^a-z0-9 ]/g, "");
}

export function isCleanName(name: string): boolean {
  const normalized = normalizeForFilter(name);
  for (const token of BAD_TOKENS) {
    if (normalized.includes(token)) return false;
  }
  return true;
}

// Strip control chars (U+0000–U+001F, U+007F), zero-width joiners (U+200B–U+200F, U+2060), and BOM (U+FEFF).
const STRIP_INVISIBLE = new RegExp("[\\u0000-\\u001F\\u007F\\u200B-\\u200F\\u2060\\uFEFF]", "g");

export function sanitizePlayerName(name: string, bot = false): string {
  const stripped = (name ?? "")
    .replace(STRIP_INVISIBLE, "")
    .replace(/[^\p{L}\p{N}\s_-]/gu, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, MAX_LEN);

  if (!isCleanName(stripped) || stripped.length < MIN_LEN) {
    return bot ? "Bot" : "Player";
  }
  return stripped;
}

export type NameValidationError =
  | "too-short"
  | "too-long"
  | "profanity"
  | "empty";

export function validateName(name: string): { ok: true; value: string } | { ok: false; reason: NameValidationError } {
  const trimmed = (name ?? "").trim();
  if (trimmed.length === 0) return { ok: false, reason: "empty" };
  if (trimmed.length > MAX_LEN) return { ok: false, reason: "too-long" };
  if (!isCleanName(trimmed)) return { ok: false, reason: "profanity" };
  const sanitized = sanitizePlayerName(trimmed);
  if (sanitized === "Player" && trimmed.toLowerCase() !== "player") {
    return { ok: false, reason: "profanity" };
  }
  if (sanitized.length < MIN_LEN) return { ok: false, reason: "too-short" };
  return { ok: true, value: sanitized };
}

// Pure color utilities used by the Pixi renderer.
// Kept dependency-free so they can be unit-tested without Pixi.

export function darkenColor(color: number, factor: number): number {
  const r = Math.floor(((color >> 16) & 0xff) * factor);
  const g = Math.floor(((color >> 8) & 0xff) * factor);
  const b = Math.floor((color & 0xff) * factor);
  return (r << 16) | (g << 8) | b;
}

export function parseHexColor(value: string | undefined): number {
  if (!value) return 0xffffff;
  const trimmed = value.trim().replace(/^#/, "");
  if (trimmed.length === 3) {
    const r = parseInt(trimmed[0] + trimmed[0], 16);
    const g = parseInt(trimmed[1] + trimmed[1], 16);
    const b = parseInt(trimmed[2] + trimmed[2], 16);
    return (r << 16) | (g << 8) | b;
  }
  if (trimmed.length === 6) {
    const n = parseInt(trimmed, 16);
    return Number.isFinite(n) ? n : 0xffffff;
  }
  return 0xffffff;
}

export function hslToHex(h: number, s: number, l: number): number {
  const sNorm = s / 100;
  const lNorm = l / 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = sNorm * Math.min(lNorm, 1 - lNorm);
  const f = (n: number) => {
    const x = lNorm - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
    return Math.round(255 * x);
  };
  return (f(0) << 16) | (f(8) << 8) | f(4);
}

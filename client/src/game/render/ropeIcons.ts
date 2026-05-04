import type { Graphics } from "pixi.js";

// Rope-charm icon renderers. Pure draw functions: receive a Graphics,
// position, radius, and accent color; emit primitives with no internal state.

export function drawRopeAccessory(graphics: Graphics, accessoryId: string, cx: number, cy: number, accent: number): void {
  graphics.circle(cx, cy, 12).fill({ color: 0x1a2030, alpha: 1 });
  graphics.circle(cx, cy, 12).stroke({ color: 0xc8dce8, alpha: 0.3, width: 1.2 });
  const r = 7;
  switch (accessoryId) {
    case "skull":   drawSkullIcon(graphics, cx, cy, r, accent); break;
    case "star":    graphics.poly(starIconPoints(cx, cy, r, r * 0.42)).fill({ color: accent, alpha: 1 }); break;
    case "diamond": graphics.poly([cx, cy - r, cx + r * 0.58, cy, cx, cy + r, cx - r * 0.58, cy]).fill({ color: accent, alpha: 1 }); break;
    case "bolt":    graphics.poly(boltIconPoints(cx, cy, r)).fill({ color: accent, alpha: 1 }); break;
    case "fire":    drawFireIcon(graphics, cx, cy, r, accent); break;
    case "eye":     drawEyeIcon(graphics, cx, cy, r, accent); break;
    case "heart":   drawHeartIcon(graphics, cx, cy, r, accent); break;
    case "moon":
      graphics.circle(cx, cy, r).fill({ color: accent, alpha: 1 });
      graphics.circle(cx + r * 0.35, cy - r * 0.1, r * 0.85).fill({ color: 0x1a2030, alpha: 1 });
      break;
    case "cube":
      graphics.rect(cx - r * 0.7, cy - r * 0.7, r * 1.4, r * 1.4).fill({ color: accent, alpha: 1 });
      break;
    case "key":
      graphics.circle(cx - r * 0.4, cy, r * 0.45).stroke({ color: accent, alpha: 1, width: 2 });
      graphics.rect(cx - r * 0.05, cy - r * 0.16, r * 0.9, r * 0.32).fill({ color: accent, alpha: 1 });
      break;
  }
}

function starIconPoints(cx: number, cy: number, outer: number, inner: number): number[] {
  const pts: number[] = [];
  for (let i = 0; i < 10; i += 1) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 === 0 ? outer : inner;
    pts.push(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
  }
  return pts;
}

function boltIconPoints(cx: number, cy: number, r: number): number[] {
  return [cx + 1.5, cy - r, cx - 2.5, cy - 0.5, cx + 2, cy - 0.5, cx - 1.5, cy + r, cx + 2.5, cy + 0.5, cx - 2, cy + 0.5];
}

function drawSkullIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  g.circle(cx, cy - r * 0.1, r * 0.78).fill({ color, alpha: 1 });
  g.circle(cx - r * 0.28, cy - r * 0.16, r * 0.28).fill({ color: 0x1a2030, alpha: 1 });
  g.circle(cx + r * 0.28, cy - r * 0.16, r * 0.28).fill({ color: 0x1a2030, alpha: 1 });
  const tw = r * 0.18, th = r * 0.28, ty = cy + r * 0.42;
  for (let i = -1; i <= 1; i += 1) {
    g.rect(cx + i * r * 0.28 - tw / 2, ty, tw, th).fill({ color, alpha: 1 });
  }
}

function drawFireIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  g.circle(cx, cy + r * 0.18, r * 0.62).fill({ color, alpha: 1 });
  g.circle(cx, cy - r * 0.08, r * 0.42).fill({ color, alpha: 0.85 });
  g.circle(cx, cy - r * 0.58, r * 0.24).fill({ color, alpha: 0.7 });
}

function drawEyeIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  g.circle(cx - r * 0.3, cy, r * 0.52).fill({ color, alpha: 1 });
  g.circle(cx + r * 0.3, cy, r * 0.52).fill({ color, alpha: 1 });
  g.rect(cx - r * 0.7, cy - r * 0.52, r * 1.4, r * 1.04).fill({ color, alpha: 1 });
  g.circle(cx, cy, r * 0.36).fill({ color: 0x1a2030, alpha: 1 });
  g.circle(cx + r * 0.1, cy - r * 0.1, r * 0.14).fill({ color: 0xffffff, alpha: 1 });
}

function drawHeartIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  g.circle(cx - r * 0.28, cy - r * 0.1, r * 0.42).fill({ color, alpha: 1 });
  g.circle(cx + r * 0.28, cy - r * 0.1, r * 0.42).fill({ color, alpha: 1 });
  g.poly([cx - r * 0.7, cy + r * 0.08, cx + r * 0.7, cy + r * 0.08, cx, cy + r]).fill({ color, alpha: 1 });
}

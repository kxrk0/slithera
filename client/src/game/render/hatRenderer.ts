import type { Graphics } from "pixi.js";

// Procedural hat draw functions. All hats are drawn centered at (cx, cy)
// with radius `r` (≈ half the hat width). `facing` is the snake's heading
// in radians (used to tilt the hat).

export function drawHat(g: Graphics, hatId: string, cx: number, cy: number, r: number): void {
  switch (hatId) {
    case "halo":       drawHalo(g, cx, cy, r); break;
    case "visor":      drawVisor(g, cx, cy, r); break;
    case "cap":        drawCap(g, cx, cy, r); break;
    case "bunny":      drawBunny(g, cx, cy, r); break;
    case "ninja":      drawNinja(g, cx, cy, r); break;
    case "flower":     drawFlower(g, cx, cy, r); break;
    case "party":      drawParty(g, cx, cy, r); break;
    case "mortar":     drawMortar(g, cx, cy, r); break;
    case "hardhat":    drawHardhat(g, cx, cy, r); break;
    case "cowboy":     drawCowboy(g, cx, cy, r); break;
    case "helm":       drawHelm(g, cx, cy, r); break;
    case "top-hat":    drawTopHat(g, cx, cy, r); break;
    case "wizard":     drawWizard(g, cx, cy, r); break;
    case "blade":      drawBlade(g, cx, cy, r); break;
    case "detective":  drawDetective(g, cx, cy, r); break;
    case "jester":     drawJester(g, cx, cy, r); break;
    case "horns":      drawHorns(g, cx, cy, r); break;
    case "angel":      drawAngel(g, cx, cy, r); break;
    case "ice-crown":  drawIceCrown(g, cx, cy, r); break;
    case "viking":     drawViking(g, cx, cy, r); break;
    case "crown":      drawCrown(g, cx, cy, r); break;
    case "pharaoh":    drawPharaoh(g, cx, cy, r); break;
    case "samurai":    drawSamurai(g, cx, cy, r); break;
    case "fire-crown": drawFireCrown(g, cx, cy, r); break;
    case "plague":     drawPlague(g, cx, cy, r); break;
    case "dark-crown": drawDarkCrown(g, cx, cy, r); break;
    case "santa":      drawSanta(g, cx, cy, r); break;
  }
}

// Returns estimated hat height in pixels for label offset
export function hatHeight(hatId: string, r: number): number {
  const tall: Record<string, number> = {
    "wizard": 2.8, "pharaoh": 2.6, "samurai": 2.2, "top-hat": 2.4,
    "mortar": 1.8, "party": 2.0, "jester": 2.2, "dark-crown": 1.8,
    "fire-crown": 2.0, "ice-crown": 1.8, "crown": 1.5, "santa": 1.8,
    "viking": 1.6, "plague": 2.4, "bunny": 2.6, "horns": 1.8,
    "angel": 1.4, "cowboy": 1.4, "blade": 1.8,
  };
  return r * (tall[hatId] ?? 1.2);
}

// ── Individual hat implementations ────────────────────────────────────────────

function drawHalo(g: Graphics, cx: number, cy: number, r: number): void {
  // Glowing golden ring
  g.ellipse(cx, cy, r * 1.1, r * 0.35).stroke({ color: 0xffe566, width: r * 0.28, alpha: 1 });
  g.ellipse(cx, cy, r * 1.1, r * 0.35).stroke({ color: 0xfff8c0, width: r * 0.1, alpha: 0.8 });
}

function drawVisor(g: Graphics, cx: number, cy: number, r: number): void {
  // Sleek half-dome visor
  g.ellipse(cx, cy + r * 0.1, r * 1.05, r * 0.55).fill({ color: 0x1a2a3a, alpha: 1 });
  g.rect(cx - r * 1.05, cy + r * 0.1, r * 2.1, r * 0.5).fill({ color: 0x1a2a3a, alpha: 1 });
  // Tinted visor glass
  g.ellipse(cx, cy + r * 0.05, r * 0.88, r * 0.4).fill({ color: 0x22aaff, alpha: 0.35 });
  g.ellipse(cx, cy + r * 0.05, r * 0.88, r * 0.4).stroke({ color: 0x44ccff, width: 1.2, alpha: 0.7 });
}

function drawCap(g: Graphics, cx: number, cy: number, r: number): void {
  // Baseball cap
  g.ellipse(cx, cy, r, r * 0.55).fill({ color: 0x1e3a5f, alpha: 1 });
  g.rect(cx - r, cy, r * 2, r * 0.52).fill({ color: 0x1e3a5f, alpha: 1 });
  // Brim
  g.ellipse(cx + r * 0.3, cy + r * 0.5, r * 0.85, r * 0.22).fill({ color: 0x16304e, alpha: 1 });
  // Vent button
  g.circle(cx, cy - r * 0.5, r * 0.12).fill({ color: 0xffffff, alpha: 0.6 });
}

function drawBunny(g: Graphics, cx: number, cy: number, r: number): void {
  // Fluffy rabbit ears
  const ew = r * 0.38, eh = r * 2.0;
  g.ellipse(cx - r * 0.45, cy - r * 0.9, ew, eh).fill({ color: 0xf5e8f5, alpha: 1 });
  g.ellipse(cx + r * 0.45, cy - r * 0.9, ew, eh).fill({ color: 0xf5e8f5, alpha: 1 });
  // Inner pink
  g.ellipse(cx - r * 0.45, cy - r * 0.9, ew * 0.55, eh * 0.75).fill({ color: 0xffb0cc, alpha: 1 });
  g.ellipse(cx + r * 0.45, cy - r * 0.9, ew * 0.55, eh * 0.75).fill({ color: 0xffb0cc, alpha: 1 });
  // Headband
  g.rect(cx - r * 0.9, cy - r * 0.1, r * 1.8, r * 0.3).fill({ color: 0xf5e8f5, alpha: 1 });
}

function drawNinja(g: Graphics, cx: number, cy: number, r: number): void {
  // Black headband with crescent symbol
  g.rect(cx - r * 1.1, cy - r * 0.18, r * 2.2, r * 0.42).fill({ color: 0x111111, alpha: 1 });
  g.rect(cx - r * 1.1, cy - r * 0.18, r * 2.2, r * 0.42).stroke({ color: 0x333333, width: 1, alpha: 0.6 });
  // Metal plate with circle symbol
  g.rect(cx - r * 0.35, cy - r * 0.2, r * 0.7, r * 0.46).fill({ color: 0x7a8a9a, alpha: 1 });
  g.circle(cx, cy + r * 0.02, r * 0.2).stroke({ color: 0x333333, width: 1.5, alpha: 1 });
  // Knot at the side
  g.circle(cx + r * 1.05, cy + r * 0.06, r * 0.18).fill({ color: 0x111111, alpha: 1 });
}

function drawFlower(g: Graphics, cx: number, cy: number, r: number): void {
  // Ring of petals
  const petalColors = [0xff6b9a, 0xff9a6b, 0xffd06b, 0x9aff6b, 0x6baeff, 0xc96bff];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const px = cx + Math.cos(a) * r * 0.8;
    const py = cy + Math.sin(a) * r * 0.8;
    g.circle(px, py, r * 0.38).fill({ color: petalColors[i], alpha: 1 });
  }
  g.circle(cx, cy, r * 0.28).fill({ color: 0xffe566, alpha: 1 });
}

function drawParty(g: Graphics, cx: number, cy: number, r: number): void {
  // Conical party hat
  g.poly([cx, cy - r * 1.8, cx - r * 0.9, cy + r * 0.15, cx + r * 0.9, cy + r * 0.15]).fill({ color: 0xee1166, alpha: 1 });
  // Polka dots
  for (let i = 0; i < 5; i++) {
    const dx = (Math.random() * 1.4 - 0.7) * r * 0.7;
    const dy = -r * 0.1 - (i / 5) * r * 1.4;
    g.circle(cx + dx * (i % 2 === 0 ? 0.5 : -0.3), cy + dy, r * 0.1).fill({ color: 0xffe566, alpha: 0.9 });
  }
  g.rect(cx - r * 0.9, cy + r * 0.05, r * 1.8, r * 0.2).fill({ color: 0xffffff, alpha: 0.4 });
  g.circle(cx, cy - r * 1.8, r * 0.15).fill({ color: 0xffe566, alpha: 1 });
}

function drawMortar(g: Graphics, cx: number, cy: number, r: number): void {
  // Graduation cap (square + tassel)
  g.rect(cx - r * 0.95, cy - r * 0.45, r * 1.9, r * 0.55).fill({ color: 0x111111, alpha: 1 });
  g.rect(cx - r * 1.05, cy - r * 0.52, r * 2.1, r * 0.18).fill({ color: 0x222222, alpha: 1 });
  // Tassel string and end
  g.rect(cx + r * 0.5, cy - r * 0.46, r * 0.08, r * 0.7).fill({ color: 0xffd24d, alpha: 1 });
  g.circle(cx + r * 0.54, cy + r * 0.22, r * 0.15).fill({ color: 0xffd24d, alpha: 1 });
}

function drawHardhat(g: Graphics, cx: number, cy: number, r: number): void {
  // Construction helmet dome
  g.ellipse(cx, cy - r * 0.12, r, r * 0.75).fill({ color: 0xffb800, alpha: 1 });
  g.rect(cx - r, cy + r * 0.28, r * 2, r * 0.24).fill({ color: 0xffb800, alpha: 1 });
  // Brim
  g.rect(cx - r * 1.15, cy + r * 0.38, r * 2.3, r * 0.14).fill({ color: 0xd48800, alpha: 1 });
  // Vent ridge
  g.rect(cx - r * 0.08, cy - r * 0.8, r * 0.16, r * 0.8).fill({ color: 0xd48800, alpha: 0.5 });
}

function drawCowboy(g: Graphics, cx: number, cy: number, r: number): void {
  // Wide-brim cowboy hat
  const hatColor = 0x8b5e3c, brimColor = 0x6e4a2e;
  g.ellipse(cx, cy, r * 0.75, r * 0.6).fill({ color: hatColor, alpha: 1 });
  g.rect(cx - r * 0.75, cy, r * 1.5, r * 0.5).fill({ color: hatColor, alpha: 1 });
  // Brim
  g.ellipse(cx, cy + r * 0.45, r * 1.3, r * 0.22).fill({ color: brimColor, alpha: 1 });
  // Band
  g.rect(cx - r * 0.74, cy + r * 0.04, r * 1.48, r * 0.18).fill({ color: 0x4a2e14, alpha: 1 });
  g.circle(cx, cy + r * 0.12, r * 0.13).fill({ color: 0xd4a827, alpha: 1 });
}

function drawHelm(g: Graphics, cx: number, cy: number, r: number): void {
  // Metal combat helmet
  g.ellipse(cx, cy - r * 0.1, r * 0.95, r * 0.82).fill({ color: 0x7a8898, alpha: 1 });
  g.rect(cx - r * 0.95, cy + r * 0.35, r * 1.9, r * 0.28).fill({ color: 0x6a7888, alpha: 1 });
  // Cheek guards
  g.rect(cx - r * 0.95, cy + r * 0.35, r * 0.3, r * 0.5).fill({ color: 0x5a6878, alpha: 1 });
  g.rect(cx + r * 0.65, cy + r * 0.35, r * 0.3, r * 0.5).fill({ color: 0x5a6878, alpha: 1 });
  // Metal highlight
  g.ellipse(cx - r * 0.2, cy - r * 0.3, r * 0.3, r * 0.18).fill({ color: 0xaabbcc, alpha: 0.4 });
}

function drawTopHat(g: Graphics, cx: number, cy: number, r: number): void {
  const c = 0x111111;
  // Cylinder
  g.rect(cx - r * 0.68, cy - r * 1.8, r * 1.36, r * 1.9).fill({ color: c, alpha: 1 });
  // Brim
  g.rect(cx - r * 1.05, cy + r * 0.1, r * 2.1, r * 0.2).fill({ color: 0x090909, alpha: 1 });
  // Hat band
  g.rect(cx - r * 0.68, cy - r * 0.15, r * 1.36, r * 0.22).fill({ color: 0x333333, alpha: 1 });
  // Highlight stripe
  g.rect(cx - r * 0.66, cy - r * 1.78, r * 0.15, r * 1.88).fill({ color: 0x2a2a2a, alpha: 0.7 });
}

function drawWizard(g: Graphics, cx: number, cy: number, r: number): void {
  // Tall conical wizard hat with stars
  g.poly([cx, cy - r * 2.4, cx - r * 0.95, cy + r * 0.1, cx + r * 0.95, cy + r * 0.1]).fill({ color: 0x1a0a4a, alpha: 1 });
  g.poly([cx, cy - r * 2.4, cx - r * 0.95, cy + r * 0.1, cx + r * 0.95, cy + r * 0.1]).stroke({ color: 0x5533bb, width: 1.5, alpha: 0.6 });
  g.rect(cx - r * 1.05, cy, r * 2.1, r * 0.2).fill({ color: 0x2a1066, alpha: 1 });
  // Stars
  g.circle(cx - r * 0.3, cy - r * 1.2, r * 0.1).fill({ color: 0xffe566, alpha: 1 });
  g.circle(cx + r * 0.45, cy - r * 0.7, r * 0.08).fill({ color: 0x99ccff, alpha: 1 });
  g.circle(cx - r * 0.1, cy - r * 1.8, r * 0.07).fill({ color: 0xffa0c0, alpha: 1 });
  // Crescent moon
  g.circle(cx + r * 0.18, cy - r * 0.45, r * 0.2).fill({ color: 0xffe566, alpha: 1 });
  g.circle(cx + r * 0.3, cy - r * 0.5, r * 0.17).fill({ color: 0x1a0a4a, alpha: 1 });
}

function drawBlade(g: Graphics, cx: number, cy: number, r: number): void {
  // Crossed swords above head
  const sw = r * 0.12, sl = r * 1.6;
  // Sword 1 (top-left to bottom-right)
  g.rect(cx - sl / 2, cy - sl / 2 - r * 0.1, sw, sl).fill({ color: 0xc8d8e8, alpha: 1 });
  g.rect(cx - sl * 0.38 - sw * 0.5, cy - r * 0.15, sl * 0.76, sw * 0.8).fill({ color: 0xffd24d, alpha: 1 });
  // Sword 2 (top-right to bottom-left, rotated)
  const cos45 = 0.707;
  const dx = sl / 2 * cos45, dy = sl / 2 * cos45;
  g.poly([cx - dx, cy - dy - r * 0.05, cx - dx + sw * cos45, cy - dy - r * 0.05 + sw * cos45,
          cx + dx, cy + dy - r * 0.05, cx + dx - sw * cos45, cy + dy - r * 0.05 - sw * cos45]).fill({ color: 0xc8d8e8, alpha: 1 });
}

function drawDetective(g: Graphics, cx: number, cy: number, r: number): void {
  // Dark fedora
  const c = 0x1e1e1e;
  g.ellipse(cx, cy - r * 0.1, r * 0.85, r * 0.65).fill({ color: c, alpha: 1 });
  g.rect(cx - r * 0.85, cy + r * 0.2, r * 1.7, r * 0.5).fill({ color: c, alpha: 1 });
  // Brim
  g.rect(cx - r * 1.1, cy + r * 0.56, r * 2.2, r * 0.18).fill({ color: 0x111111, alpha: 1 });
  // Dent in crown
  g.ellipse(cx, cy - r * 0.12, r * 0.42, r * 0.22).fill({ color: 0x151515, alpha: 1 });
  // Hat band
  g.rect(cx - r * 0.86, cy + r * 0.14, r * 1.72, r * 0.16).fill({ color: 0x333333, alpha: 1 });
}

function drawJester(g: Graphics, cx: number, cy: number, r: number): void {
  // Three-pronged jester hat with bells
  const colors = [0xee1166, 0xffd24d, 0x22bbff];
  // Base
  g.rect(cx - r * 0.9, cy - r * 0.02, r * 1.8, r * 0.2).fill({ color: colors[0], alpha: 1 });
  // Three drooping prongs
  for (let i = 0; i < 3; i++) {
    const bx = cx + (i - 1) * r * 0.75;
    g.poly([bx - r * 0.3, cy, bx, cy - r * 1.7, bx + r * 0.3, cy]).fill({ color: colors[i], alpha: 1 });
    // Bell
    g.circle(bx, cy - r * 1.7, r * 0.2).fill({ color: 0xd4a827, alpha: 1 });
    g.circle(bx, cy - r * 1.7, r * 0.08).fill({ color: 0x8b6a12, alpha: 1 });
  }
}

function drawHorns(g: Graphics, cx: number, cy: number, r: number): void {
  // Devil horns
  const hc = 0xcc1111;
  // Left horn
  g.poly([cx - r * 0.75, cy, cx - r * 1.1, cy - r * 1.5, cx - r * 0.35, cy - r * 0.3]).fill({ color: hc, alpha: 1 });
  g.poly([cx - r * 0.75, cy, cx - r * 1.1, cy - r * 1.5, cx - r * 0.35, cy - r * 0.3]).stroke({ color: 0xff4444, width: 1, alpha: 0.5 });
  // Right horn
  g.poly([cx + r * 0.75, cy, cx + r * 1.1, cy - r * 1.5, cx + r * 0.35, cy - r * 0.3]).fill({ color: hc, alpha: 1 });
  g.poly([cx + r * 0.75, cy, cx + r * 1.1, cy - r * 1.5, cx + r * 0.35, cy - r * 0.3]).stroke({ color: 0xff4444, width: 1, alpha: 0.5 });
  // Hot tips
  g.circle(cx - r * 1.1, cy - r * 1.5, r * 0.08).fill({ color: 0xff6666, alpha: 1 });
  g.circle(cx + r * 1.1, cy - r * 1.5, r * 0.08).fill({ color: 0xff6666, alpha: 1 });
}

function drawAngel(g: Graphics, cx: number, cy: number, r: number): void {
  // Glowing halo ring with shimmer
  g.ellipse(cx, cy, r * 1.05, r * 0.3).stroke({ color: 0xfff0a0, width: r * 0.22, alpha: 1 });
  g.ellipse(cx, cy, r * 1.05, r * 0.3).stroke({ color: 0xffffff, width: r * 0.08, alpha: 0.7 });
  // Glow
  g.ellipse(cx, cy, r * 1.15, r * 0.38).stroke({ color: 0xffe566, width: r * 0.06, alpha: 0.2 });
}

function drawIceCrown(g: Graphics, cx: number, cy: number, r: number): void {
  // Crystal spike crown
  const ic = 0x88ddff, dc = 0x3388bb;
  // Base ring
  g.rect(cx - r, cy - r * 0.1, r * 2, r * 0.4).fill({ color: ic, alpha: 0.9 });
  // Spikes (5)
  const spikeXs = [-0.85, -0.45, 0, 0.45, 0.85];
  const spikeH =  [ 1.0,   1.4,  1.8, 1.4,  1.0];
  for (let i = 0; i < 5; i++) {
    const sx = cx + spikeXs[i] * r;
    g.poly([sx - r * 0.18, cy, sx, cy - r * spikeH[i], sx + r * 0.18, cy]).fill({ color: ic, alpha: 0.95 });
    g.poly([sx - r * 0.18, cy, sx, cy - r * spikeH[i], sx + r * 0.18, cy]).stroke({ color: 0xccf4ff, width: 1, alpha: 0.7 });
  }
  g.rect(cx - r, cy - r * 0.1, r * 2, r * 0.4).stroke({ color: dc, width: 1.2, alpha: 0.6 });
}

function drawViking(g: Graphics, cx: number, cy: number, r: number): void {
  // Viking horned helmet
  const mc = 0x8899aa, dc = 0x556677;
  // Dome
  g.ellipse(cx, cy - r * 0.1, r, r * 0.78).fill({ color: mc, alpha: 1 });
  g.rect(cx - r, cy + r * 0.32, r * 2, r * 0.28).fill({ color: dc, alpha: 1 });
  // Nose guard
  g.rect(cx - r * 0.08, cy - r * 0.2, r * 0.16, r * 0.7).fill({ color: dc, alpha: 1 });
  // Horns
  g.poly([cx - r, cy - r * 0.05, cx - r * 1.5, cy - r * 1.1, cx - r * 0.7, cy - r * 0.5]).fill({ color: 0xeeddcc, alpha: 1 });
  g.poly([cx + r, cy - r * 0.05, cx + r * 1.5, cy - r * 1.1, cx + r * 0.7, cy - r * 0.5]).fill({ color: 0xeeddcc, alpha: 1 });
  // Metal rivets
  for (let i = -1; i <= 1; i++) {
    g.circle(cx + i * r * 0.55, cy + r * 0.35, r * 0.07).fill({ color: 0x667788, alpha: 1 });
  }
}

function drawCrown(g: Graphics, cx: number, cy: number, r: number): void {
  // Gold 5-point crown with gems
  const gc = 0xd4a827, sc = 0xffd24d;
  // Base band
  g.rect(cx - r * 0.95, cy - r * 0.12, r * 1.9, r * 0.55).fill({ color: gc, alpha: 1 });
  // Five points
  const pts = [
    [cx - r * 0.9, cy - r * 0.12], [cx - r * 0.9, cy - r * 1.1],
    [cx - r * 0.52, cy - r * 0.12], [cx - r * 0.52, cy - r * 0.65],
    [cx, cy - r * 0.12], [cx, cy - r * 1.35],
    [cx + r * 0.52, cy - r * 0.12], [cx + r * 0.52, cy - r * 0.65],
    [cx + r * 0.9, cy - r * 0.12], [cx + r * 0.9, cy - r * 1.1],
  ];
  for (let i = 0; i < pts.length - 2; i += 2) {
    const [ax, ay] = pts[i], [bx, by] = pts[i + 1], [ex, ey] = pts[i + 2];
    g.poly([ax, ay, bx, by, ex, ey]).fill({ color: gc, alpha: 1 });
  }
  // Jewels
  g.circle(cx - r * 0.9, cy - r * 1.12, r * 0.15).fill({ color: 0xff3355, alpha: 1 });
  g.circle(cx, cy - r * 1.37, r * 0.18).fill({ color: 0x22ccff, alpha: 1 });
  g.circle(cx + r * 0.9, cy - r * 1.12, r * 0.15).fill({ color: 0x22ff88, alpha: 1 });
  // Shine
  g.rect(cx - r * 0.92, cy - r * 0.08, r * 0.2, r * 0.4).fill({ color: sc, alpha: 0.35 });
}

function drawPharaoh(g: Graphics, cx: number, cy: number, r: number): void {
  // Nemes headdress with cobra
  const gc = 0xd4a827, bc = 0x1a3a6a;
  // Striped nemes cloth
  g.poly([cx - r * 0.85, cy, cx - r * 0.7, cy - r * 2.0, cx + r * 0.7, cy - r * 2.0, cx + r * 0.85, cy]).fill({ color: gc, alpha: 1 });
  // Stripes
  for (let i = 0; i < 5; i++) {
    const y = cy - r * 0.4 - i * r * 0.32;
    g.rect(cx - r * 0.83 + i * r * 0.06, y, r * 1.66 - i * r * 0.12, r * 0.14).fill({ color: bc, alpha: 0.7 });
  }
  // Cobra uraeus
  g.circle(cx, cy - r * 2.1, r * 0.22).fill({ color: gc, alpha: 1 });
  g.rect(cx - r * 0.08, cy - r * 2.5, r * 0.16, r * 0.4).fill({ color: gc, alpha: 1 });
  // Cobra hood fan
  g.ellipse(cx, cy - r * 2.55, r * 0.32, r * 0.15).fill({ color: 0xff3355, alpha: 0.9 });
}

function drawSamurai(g: Graphics, cx: number, cy: number, r: number): void {
  // Kabuto helmet
  const mc = 0x2a2a2a, rc = 0xcc1111;
  g.ellipse(cx, cy - r * 0.08, r * 0.95, r * 0.82).fill({ color: mc, alpha: 1 });
  g.rect(cx - r * 0.95, cy + r * 0.4, r * 1.9, r * 0.24).fill({ color: mc, alpha: 1 });
  // Neck guard flaps
  g.poly([cx - r * 0.95, cy + r * 0.4, cx - r * 1.1, cy + r * 0.9, cx - r * 0.3, cy + r * 0.9, cx - r * 0.3, cy + r * 0.4]).fill({ color: 0x1a1a1a, alpha: 1 });
  g.poly([cx + r * 0.95, cy + r * 0.4, cx + r * 1.1, cy + r * 0.9, cx + r * 0.3, cy + r * 0.9, cx + r * 0.3, cy + r * 0.4]).fill({ color: 0x1a1a1a, alpha: 1 });
  // Crest (maedate)
  g.poly([cx - r * 0.08, cy - r * 0.85, cx, cy - r * 2.0, cx + r * 0.08, cy - r * 0.85]).fill({ color: rc, alpha: 1 });
  // Gilded trim
  g.rect(cx - r * 0.95, cy + r * 0.38, r * 1.9, r * 0.08).fill({ color: 0xd4a827, alpha: 1 });
  g.ellipse(cx - r * 0.15, cy - r * 0.3, r * 0.22, r * 0.12).fill({ color: 0x3a3a3a, alpha: 0.7 });
}

function drawFireCrown(g: Graphics, cx: number, cy: number, r: number): void {
  // Crown with animated flame tips
  const gc = 0xd4a827;
  g.rect(cx - r * 0.92, cy - r * 0.1, r * 1.84, r * 0.48).fill({ color: gc, alpha: 1 });
  // 5 points
  const pts: [number, number, number, number][] = [
    [cx - r * 0.9, cy - r * 0.1, cx - r * 0.9, cy - r * 0.9],
    [cx - r * 0.46, cy - r * 0.1, cx - r * 0.46, cy - r * 0.55],
    [cx, cy - r * 0.1, cx, cy - r * 1.15],
    [cx + r * 0.46, cy - r * 0.1, cx + r * 0.46, cy - r * 0.55],
    [cx + r * 0.9, cy - r * 0.1, cx + r * 0.9, cy - r * 0.9],
  ];
  for (const [ax, ay, bx, by] of pts) {
    g.poly([ax - r * 0.16, ay, bx, by, ax + r * 0.16, ay]).fill({ color: gc, alpha: 1 });
  }
  // Flame tips
  const tips: [number, number][] = [[cx - r * 0.9, cy - r * 0.88], [cx, cy - r * 1.15], [cx + r * 0.9, cy - r * 0.88]];
  for (const [tx, ty] of tips) {
    g.circle(tx, ty, r * 0.18).fill({ color: 0xff6600, alpha: 1 });
    g.circle(tx, ty - r * 0.18, r * 0.12).fill({ color: 0xff9900, alpha: 1 });
    g.circle(tx, ty - r * 0.3, r * 0.07).fill({ color: 0xffee00, alpha: 0.9 });
  }
}

function drawPlague(g: Graphics, cx: number, cy: number, r: number): void {
  // Plague doctor mask + hat
  const mc = 0x111111, lc = 0x1a1a1a;
  // Wide-brim hat
  g.ellipse(cx, cy - r * 1.0, r * 0.65, r * 0.7).fill({ color: mc, alpha: 1 });
  g.rect(cx - r * 0.65, cy - r * 0.5, r * 1.3, r * 0.45).fill({ color: mc, alpha: 1 });
  g.rect(cx - r * 1.05, cy - r * 0.12, r * 2.1, r * 0.18).fill({ color: lc, alpha: 1 });
  // Beak / mask
  g.ellipse(cx, cy + r * 0.15, r * 0.55, r * 0.48).fill({ color: lc, alpha: 1 });
  g.poly([cx - r * 0.18, cy + r * 0.3, cx, cy + r * 1.1, cx + r * 0.18, cy + r * 0.3]).fill({ color: lc, alpha: 1 });
  // Glass goggles
  g.circle(cx - r * 0.25, cy, r * 0.22).fill({ color: 0x225533, alpha: 0.85 });
  g.circle(cx + r * 0.25, cy, r * 0.22).fill({ color: 0x225533, alpha: 0.85 });
  g.circle(cx - r * 0.25, cy, r * 0.22).stroke({ color: 0x444444, width: 1.5, alpha: 1 });
  g.circle(cx + r * 0.25, cy, r * 0.22).stroke({ color: 0x444444, width: 1.5, alpha: 1 });
  // Beak tip
  g.circle(cx, cy + r * 1.08, r * 0.1).fill({ color: 0x333333, alpha: 1 });
}

function drawDarkCrown(g: Graphics, cx: number, cy: number, r: number): void {
  // Obsidian crown with purple crystal tips
  const dc = 0x111118, pc = 0x8822cc;
  g.rect(cx - r, cy - r * 0.1, r * 2, r * 0.52).fill({ color: dc, alpha: 1 });
  // 7 sharp spikes
  const spikePos = [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9];
  const spikeH =  [ 1.0,  0.7,  1.1, 1.55, 1.1, 0.7, 1.0];
  for (let i = 0; i < spikePos.length; i++) {
    const sx = cx + spikePos[i] * r;
    g.poly([sx - r * 0.15, cy, sx, cy - r * spikeH[i], sx + r * 0.15, cy]).fill({ color: dc, alpha: 1 });
  }
  // Purple crystal tips
  const tipIdx = [0, 2, 3, 4, 6];
  for (const i of tipIdx) {
    const sx = cx + spikePos[i] * r;
    const tipH = spikeH[i];
    g.circle(sx, cy - r * tipH, r * 0.13).fill({ color: pc, alpha: 1 });
    g.circle(sx, cy - r * tipH, r * 0.07).fill({ color: 0xcc88ff, alpha: 0.7 });
  }
  // Glowing band edge
  g.rect(cx - r, cy - r * 0.1, r * 2, r * 0.52).stroke({ color: pc, width: 1, alpha: 0.4 });
}

function drawSanta(g: Graphics, cx: number, cy: number, r: number): void {
  // Santa hat — red with white pompom and trim
  g.poly([cx, cy - r * 1.6, cx - r * 0.95, cy + r * 0.1, cx + r * 0.95, cy + r * 0.1]).fill({ color: 0xdd1111, alpha: 1 });
  // White trim band
  g.rect(cx - r * 0.97, cy, r * 1.94, r * 0.28).fill({ color: 0xffffff, alpha: 1 });
  // Pompom tip
  g.circle(cx + r * 0.15, cy - r * 1.58, r * 0.28).fill({ color: 0xffffff, alpha: 1 });
  // Slight bend at top
  g.circle(cx + r * 0.38, cy - r * 1.2, r * 0.1).fill({ color: 0xff2222, alpha: 0.6 });
}

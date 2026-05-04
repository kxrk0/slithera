import type { Graphics } from "pixi.js";

// Rope-charm icon renderers. Pure draw functions: receive a Graphics,
// position, radius, and accent color; emit primitives with no internal state.

export function drawRopeAccessory(graphics: Graphics, accessoryId: string, cx: number, cy: number, accent: number): void {
  graphics.circle(cx, cy, 12).fill({ color: 0x1a2030, alpha: 1 });
  graphics.circle(cx, cy, 12).stroke({ color: 0xc8dce8, alpha: 0.3, width: 1.2 });
  const r = 7;
  switch (accessoryId) {
    // ── Original charms ──────────────────────────────────────────────────────
    case "skull":      drawSkullIcon(graphics, cx, cy, r, accent); break;
    case "star":       graphics.poly(starIconPoints(cx, cy, r, r * 0.42)).fill({ color: accent, alpha: 1 }); break;
    case "diamond":    graphics.poly([cx, cy - r, cx + r * 0.58, cy, cx, cy + r, cx - r * 0.58, cy]).fill({ color: accent, alpha: 1 }); break;
    case "bolt":       graphics.poly(boltIconPoints(cx, cy, r)).fill({ color: accent, alpha: 1 }); break;
    case "fire":       drawFireIcon(graphics, cx, cy, r, accent); break;
    case "eye":        drawEyeIcon(graphics, cx, cy, r, accent); break;
    case "heart":      drawHeartIcon(graphics, cx, cy, r, accent); break;
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

    // ── New charms ───────────────────────────────────────────────────────────
    case "arrow":      drawArrowIcon(graphics, cx, cy, r, accent); break;
    case "anchor":     drawAnchorIcon(graphics, cx, cy, r, accent); break;
    case "shield":     drawShieldIcon(graphics, cx, cy, r, accent); break;
    case "snowflake":  drawSnowflakeIcon(graphics, cx, cy, r, accent); break;
    case "gear":       drawGearIcon(graphics, cx, cy, r, accent); break;
    case "cross":      drawCrossIcon(graphics, cx, cy, r, accent); break;
    case "feather":    drawFeatherIcon(graphics, cx, cy, r, accent); break;
    case "clover":     drawCloverIcon(graphics, cx, cy, r, accent); break;
    case "trident":    drawTridentIcon(graphics, cx, cy, r, accent); break;
    case "sword":      drawSwordIcon(graphics, cx, cy, r, accent); break;
    case "infinity":   drawInfinityIcon(graphics, cx, cy, r, accent); break;
    case "hourglass":  drawHourglassIcon(graphics, cx, cy, r, accent); break;
    case "compass":    drawCompassIcon(graphics, cx, cy, r, accent); break;
    case "spiral":     drawSpiralIcon(graphics, cx, cy, r, accent); break;
    case "rune":       drawRuneIcon(graphics, cx, cy, r, accent); break;
    case "atom":       drawAtomIcon(graphics, cx, cy, r, accent); break;
    case "crystal":    drawCrystalIcon(graphics, cx, cy, r, accent); break;
    case "crown-charm":drawCrownCharmIcon(graphics, cx, cy, r, accent); break;
    case "dragon":     drawDragonIcon(graphics, cx, cy, r, accent); break;
    case "phoenix":    drawPhoenixIcon(graphics, cx, cy, r, accent); break;
    case "orb":        drawOrbIcon(graphics, cx, cy, r, accent); break;
  }
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

function starIconPoints(cx: number, cy: number, outer: number, inner: number): number[] {
  const pts: number[] = [];
  for (let i = 0; i < 10; i++) {
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
  for (let i = -1; i <= 1; i++) {
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

// ── New charm draw functions ──────────────────────────────────────────────────

function drawArrowIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  // Upward pointing arrow
  g.poly([cx, cy - r, cx + r * 0.5, cy - r * 0.2, cx + r * 0.2, cy - r * 0.2,
          cx + r * 0.2, cy + r, cx - r * 0.2, cy + r,
          cx - r * 0.2, cy - r * 0.2, cx - r * 0.5, cy - r * 0.2]).fill({ color, alpha: 1 });
}

function drawAnchorIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  // Circle top
  g.circle(cx, cy - r * 0.52, r * 0.28).stroke({ color, alpha: 1, width: r * 0.22 });
  // Vertical bar
  g.rect(cx - r * 0.12, cy - r * 0.52, r * 0.24, r * 1.52).fill({ color, alpha: 1 });
  // Horizontal bar
  g.rect(cx - r * 0.7, cy - r * 0.18, r * 1.4, r * 0.22).fill({ color, alpha: 1 });
  // Curves at bottom
  g.circle(cx - r * 0.6, cy + r * 0.7, r * 0.3).stroke({ color, alpha: 1, width: r * 0.22 });
  g.circle(cx + r * 0.6, cy + r * 0.7, r * 0.3).stroke({ color, alpha: 1, width: r * 0.22 });
}

function drawShieldIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  g.poly([cx - r * 0.7, cy - r, cx + r * 0.7, cy - r, cx + r * 0.7, cy + r * 0.2, cx, cy + r]).fill({ color, alpha: 1 });
  // Inner cross
  g.rect(cx - r * 0.08, cy - r * 0.7, r * 0.16, r * 1.3).fill({ color: 0x1a2030, alpha: 0.5 });
  g.rect(cx - r * 0.55, cy - r * 0.18, r * 1.1, r * 0.16).fill({ color: 0x1a2030, alpha: 0.5 });
}

function drawSnowflakeIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const ex = cx + Math.cos(a) * r, ey = cy + Math.sin(a) * r;
    g.moveTo(cx, cy).lineTo(ex, ey).stroke({ color, alpha: 1, width: 2 });
    // Small branches
    const bx1 = cx + Math.cos(a) * r * 0.55, by1 = cy + Math.sin(a) * r * 0.55;
    const ba = a + Math.PI / 2;
    g.moveTo(bx1, by1).lineTo(bx1 + Math.cos(ba) * r * 0.28, by1 + Math.sin(ba) * r * 0.28).stroke({ color, alpha: 0.7, width: 1.5 });
    g.moveTo(bx1, by1).lineTo(bx1 - Math.cos(ba) * r * 0.28, by1 - Math.sin(ba) * r * 0.28).stroke({ color, alpha: 0.7, width: 1.5 });
  }
  g.circle(cx, cy, r * 0.18).fill({ color, alpha: 1 });
}

function drawGearIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  // Outer gear teeth (8 teeth)
  g.circle(cx, cy, r).fill({ color, alpha: 1 });
  g.circle(cx, cy, r * 0.55).fill({ color: 0x1a2030, alpha: 1 });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const tx = cx + Math.cos(a) * r * 1.1;
    const ty = cy + Math.sin(a) * r * 1.1;
    g.circle(tx, ty, r * 0.22).fill({ color, alpha: 1 });
  }
  g.circle(cx, cy, r * 0.22).fill({ color: 0x1a2030, alpha: 1 });
}

function drawCrossIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  const w = r * 0.32;
  g.rect(cx - w / 2, cy - r, w, r * 2).fill({ color, alpha: 1 });
  g.rect(cx - r * 0.65, cy - r * 0.15, r * 1.3, w).fill({ color, alpha: 1 });
}

function drawFeatherIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  // Curved quill shape
  g.poly([cx, cy - r, cx + r * 0.6, cy - r * 0.2, cx + r * 0.8, cy + r * 0.5,
          cx, cy + r, cx - r * 0.2, cy + r * 0.3, cx + r * 0.3, cy - r * 0.1]).fill({ color, alpha: 0.9 });
  // Spine
  g.moveTo(cx, cy - r).lineTo(cx - r * 0.1, cy + r).stroke({ color: 0x1a2030, alpha: 0.5, width: 1.5 });
}

function drawCloverIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  // Four-leaf clover
  const dr = r * 0.5;
  g.circle(cx - dr * 0.6, cy - dr * 0.6, dr).fill({ color, alpha: 1 });
  g.circle(cx + dr * 0.6, cy - dr * 0.6, dr).fill({ color, alpha: 1 });
  g.circle(cx - dr * 0.6, cy + dr * 0.6, dr).fill({ color, alpha: 1 });
  g.circle(cx + dr * 0.6, cy + dr * 0.6, dr).fill({ color, alpha: 1 });
  g.circle(cx, cy, dr * 0.5).fill({ color, alpha: 1 });
  // Stem
  g.moveTo(cx, cy + r * 0.3).lineTo(cx, cy + r).stroke({ color, alpha: 0.9, width: 2 });
}

function drawTridentIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  const sw = r * 0.22;
  // Shaft
  g.rect(cx - sw / 2, cy - r * 0.3, sw, r * 1.3).fill({ color, alpha: 1 });
  // Center prong
  g.poly([cx - sw, cy - r * 0.3, cx + sw, cy - r * 0.3, cx + sw * 0.5, cy - r]).fill({ color, alpha: 1 });
  g.poly([cx - sw, cy - r * 0.3, cx + sw, cy - r * 0.3, cx - sw * 0.5, cy - r]).fill({ color, alpha: 1 });
  // Side prongs
  g.rect(cx - r * 0.7, cy - r * 0.3, sw, r * 0.7).fill({ color, alpha: 1 });
  g.poly([cx - r * 0.7, cy - r * 0.3, cx - r * 0.7 + sw, cy - r * 0.3, cx - r * 0.65 + sw / 2, cy - r * 0.85]).fill({ color, alpha: 1 });
  g.rect(cx + r * 0.7 - sw, cy - r * 0.3, sw, r * 0.7).fill({ color, alpha: 1 });
  g.poly([cx + r * 0.7 - sw, cy - r * 0.3, cx + r * 0.7, cy - r * 0.3, cx + r * 0.65 - sw / 2, cy - r * 0.85]).fill({ color, alpha: 1 });
  // Crossbar
  g.rect(cx - r * 0.7, cy - r * 0.32, r * 1.4, r * 0.2).fill({ color, alpha: 1 });
}

function drawSwordIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  // Blade (tapered)
  g.poly([cx - r * 0.12, cy - r, cx + r * 0.12, cy - r, cx + r * 0.04, cy + r * 0.5, cx - r * 0.04, cy + r * 0.5]).fill({ color, alpha: 1 });
  // Guard
  g.rect(cx - r * 0.7, cy - r * 0.08, r * 1.4, r * 0.24).fill({ color: 0xd4a827, alpha: 1 });
  // Handle
  g.rect(cx - r * 0.1, cy + r * 0.16, r * 0.2, r * 0.7).fill({ color: 0x8b4513, alpha: 1 });
  // Pommel
  g.circle(cx, cy + r * 0.9, r * 0.18).fill({ color: 0xd4a827, alpha: 1 });
  // Blade shine
  g.poly([cx - r * 0.04, cy - r, cx + r * 0.04, cy - r * 0.5, cx + r * 0.02, cy + r * 0.5]).fill({ color: 0xffffff, alpha: 0.3 });
}

function drawInfinityIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  // Two interlocked loops
  g.circle(cx - r * 0.48, cy, r * 0.46).stroke({ color, alpha: 1, width: r * 0.3 });
  g.circle(cx + r * 0.48, cy, r * 0.46).stroke({ color, alpha: 1, width: r * 0.3 });
  // Cover the overlap seam
  g.rect(cx - r * 0.2, cy - r * 0.15, r * 0.4, r * 0.3).fill({ color: 0x1a2030, alpha: 1 });
  g.rect(cx - r * 0.12, cy - r * 0.3, r * 0.24, r * 0.6).fill({ color: 0x1a2030, alpha: 0.5 });
}

function drawHourglassIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  // Top triangle
  g.poly([cx - r * 0.7, cy - r, cx + r * 0.7, cy - r, cx, cy]).fill({ color, alpha: 0.9 });
  // Bottom triangle
  g.poly([cx - r * 0.7, cy + r, cx + r * 0.7, cy + r, cx, cy]).fill({ color, alpha: 0.9 });
  // Outline
  g.poly([cx - r * 0.7, cy - r, cx + r * 0.7, cy - r, cx, cy]).stroke({ color: 0xc8dce8, alpha: 0.4, width: 1 });
  g.poly([cx - r * 0.7, cy + r, cx + r * 0.7, cy + r, cx, cy]).stroke({ color: 0xc8dce8, alpha: 0.4, width: 1 });
  // Sand dot
  g.circle(cx, cy + r * 0.55, r * 0.2).fill({ color, alpha: 0.7 });
  // Frame
  g.rect(cx - r * 0.72, cy - r, r * 1.44, r * 0.14).fill({ color, alpha: 1 });
  g.rect(cx - r * 0.72, cy + r - r * 0.14, r * 1.44, r * 0.14).fill({ color, alpha: 1 });
}

function drawCompassIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  g.circle(cx, cy, r).stroke({ color, alpha: 0.5, width: 1.5 });
  // N arrow (red)
  g.poly([cx, cy - r * 0.85, cx + r * 0.2, cy, cx, cy - r * 0.2, cx - r * 0.2, cy]).fill({ color: 0xff4444, alpha: 1 });
  // S arrow (white)
  g.poly([cx, cy + r * 0.85, cx - r * 0.2, cy, cx, cy + r * 0.2, cx + r * 0.2, cy]).fill({ color, alpha: 0.85 });
  g.circle(cx, cy, r * 0.15).fill({ color: 0x1a2030, alpha: 1 });
}

function drawSpiralIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  // Approximate golden spiral with arc segments
  const segs = 12;
  for (let i = 0; i < segs; i++) {
    const a1 = (i / segs) * Math.PI * 4;
    const a2 = ((i + 1) / segs) * Math.PI * 4;
    const rad = r * (0.15 + (i / segs) * 0.85);
    const x1 = cx + Math.cos(a1) * rad * (i / segs);
    const y1 = cy + Math.sin(a1) * rad * (i / segs);
    const x2 = cx + Math.cos(a2) * rad;
    const y2 = cy + Math.sin(a2) * rad;
    g.moveTo(x1, y1).lineTo(x2, y2).stroke({ color, alpha: 0.8, width: 1.8 - i * 0.1 });
  }
}

function drawRuneIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  // Runic symbol — Elder Futhark "Tiwaz" (arrow-up with double serifs)
  g.moveTo(cx, cy - r).lineTo(cx, cy + r * 0.6).stroke({ color, alpha: 1, width: 2.5 });
  g.moveTo(cx, cy - r).lineTo(cx - r * 0.5, cy - r * 0.3).stroke({ color, alpha: 1, width: 2.5 });
  g.moveTo(cx, cy - r).lineTo(cx + r * 0.5, cy - r * 0.3).stroke({ color, alpha: 1, width: 2.5 });
  g.moveTo(cx, cy - r * 0.2).lineTo(cx - r * 0.4, cy + r * 0.35).stroke({ color, alpha: 0.7, width: 1.5 });
  g.moveTo(cx, cy - r * 0.2).lineTo(cx + r * 0.4, cy + r * 0.35).stroke({ color, alpha: 0.7, width: 1.5 });
  g.rect(cx - r * 0.5, cy + r * 0.5, r, r * 0.2).fill({ color, alpha: 1 });
}

function drawAtomIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  // Nucleus
  g.circle(cx, cy, r * 0.2).fill({ color, alpha: 1 });
  // 3 orbital ellipses at different angles
  const angles = [0, Math.PI / 3, (Math.PI * 2) / 3];
  for (const a of angles) {
    const cos = Math.cos(a), sin = Math.sin(a);
    // Approximate tilted ellipse with stroked path
    const pts: number[] = [];
    for (let i = 0; i <= 32; i++) {
      const t = (i / 32) * Math.PI * 2;
      const lx = Math.cos(t) * r;
      const ly = Math.sin(t) * r * 0.35;
      pts.push(cx + lx * cos - ly * sin, cy + lx * sin + ly * cos);
    }
    for (let i = 0; i < pts.length - 2; i += 2) {
      g.moveTo(pts[i], pts[i + 1]).lineTo(pts[i + 2], pts[i + 3]).stroke({ color, alpha: 0.7, width: 1.5 });
    }
  }
}

function drawCrystalIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  // Gem crystal shape (hexagonal cross-section)
  g.poly([cx - r * 0.45, cy - r * 0.1, cx, cy - r, cx + r * 0.45, cy - r * 0.1,
          cx + r * 0.45, cy + r * 0.4, cx, cy + r, cx - r * 0.45, cy + r * 0.4]).fill({ color, alpha: 0.9 });
  // Facet lines
  g.moveTo(cx, cy - r).lineTo(cx - r * 0.45, cy + r * 0.4).stroke({ color: 0xffffff, alpha: 0.3, width: 1 });
  g.moveTo(cx, cy - r).lineTo(cx + r * 0.45, cy + r * 0.4).stroke({ color: 0xffffff, alpha: 0.3, width: 1 });
  g.moveTo(cx - r * 0.45, cy - r * 0.1).lineTo(cx + r * 0.45, cy - r * 0.1).stroke({ color: 0xffffff, alpha: 0.2, width: 1 });
  // Highlight
  g.circle(cx - r * 0.1, cy - r * 0.6, r * 0.12).fill({ color: 0xffffff, alpha: 0.5 });
}

function drawCrownCharmIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  g.rect(cx - r * 0.7, cy, r * 1.4, r * 0.5).fill({ color, alpha: 1 });
  g.poly([cx - r * 0.7, cy, cx - r * 0.7, cy - r * 0.72, cx - r * 0.35, cy - r * 0.35, cx, cy - r * 0.68, cx + r * 0.35, cy - r * 0.35, cx + r * 0.7, cy - r * 0.72, cx + r * 0.7, cy]).fill({ color, alpha: 1 });
  g.circle(cx, cy - r * 0.7, r * 0.14).fill({ color: 0x1a2030, alpha: 1 });
}

function drawDragonIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  // Dragon head silhouette (simplified)
  g.ellipse(cx + r * 0.1, cy, r * 0.7, r * 0.55).fill({ color, alpha: 1 });
  // Snout
  g.ellipse(cx + r * 0.7, cy + r * 0.1, r * 0.4, r * 0.28).fill({ color, alpha: 1 });
  // Horn
  g.poly([cx - r * 0.1, cy - r * 0.5, cx + r * 0.15, cy - r * 1.05, cx + r * 0.3, cy - r * 0.5]).fill({ color, alpha: 1 });
  // Eye
  g.circle(cx + r * 0.25, cy - r * 0.1, r * 0.12).fill({ color: 0xff3300, alpha: 1 });
  // Nostril
  g.circle(cx + r * 0.8, cy + r * 0.15, r * 0.08).fill({ color: 0x1a2030, alpha: 1 });
  // Spike row
  for (let i = 0; i < 3; i++) {
    g.poly([cx - r * 0.45 + i * r * 0.3, cy - r * 0.5, cx - r * 0.3 + i * r * 0.3, cy - r * 0.85, cx - r * 0.15 + i * r * 0.3, cy - r * 0.5]).fill({ color, alpha: 0.8 });
  }
}

function drawPhoenixIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  // Phoenix — central body + wing arcs + flame tail
  g.ellipse(cx, cy - r * 0.1, r * 0.3, r * 0.5).fill({ color, alpha: 1 });
  // Wings
  g.poly([cx, cy - r * 0.1, cx - r * 0.9, cy - r * 0.5, cx - r * 0.4, cy + r * 0.3]).fill({ color, alpha: 0.85 });
  g.poly([cx, cy - r * 0.1, cx + r * 0.9, cy - r * 0.5, cx + r * 0.4, cy + r * 0.3]).fill({ color, alpha: 0.85 });
  // Flame tail
  g.poly([cx - r * 0.2, cy + r * 0.4, cx, cy + r, cx + r * 0.2, cy + r * 0.4]).fill({ color: 0xff6600, alpha: 0.9 });
  g.poly([cx - r * 0.35, cy + r * 0.35, cx - r * 0.15, cy + r * 0.95, cx + r * 0.05, cy + r * 0.35]).fill({ color, alpha: 0.7 });
  g.poly([cx + r * 0.05, cy + r * 0.35, cx + r * 0.3, cy + r * 0.92, cx + r * 0.4, cy + r * 0.35]).fill({ color, alpha: 0.7 });
  // Head
  g.circle(cx, cy - r * 0.62, r * 0.22).fill({ color, alpha: 1 });
  g.circle(cx + r * 0.05, cy - r * 0.7, r * 0.08).fill({ color: 0x1a2030, alpha: 1 });
}

function drawOrbIcon(g: Graphics, cx: number, cy: number, r: number, color: number): void {
  // Glowing void orb with swirling inner energy
  g.circle(cx, cy, r).fill({ color: 0x0a0a1a, alpha: 1 });
  g.circle(cx, cy, r).stroke({ color, alpha: 0.6, width: 2 });
  // Inner glow rings
  g.circle(cx, cy, r * 0.65).stroke({ color, alpha: 0.4, width: 1.5 });
  g.circle(cx, cy, r * 0.35).fill({ color, alpha: 0.7 });
  // Reflection
  g.circle(cx - r * 0.25, cy - r * 0.25, r * 0.18).fill({ color: 0xffffff, alpha: 0.2 });
  // Outer glow
  g.circle(cx, cy, r * 0.35).stroke({ color: 0xffffff, alpha: 0.15, width: 3 });
}

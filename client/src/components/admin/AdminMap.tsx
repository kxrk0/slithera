import { useEffect, useRef } from "react";
import type { ServerSnapshot } from "../../../../shared/types";
import { WORLD_WIDTH, WORLD_HEIGHT, HEAD_RADIUS, BODY_RADIUS, FOOD_RADIUS } from "../../../../shared/constants";

type AdminMapProps = {
  snapshot: ServerSnapshot | null;
  selectedId: string | null;
  followMode: boolean;
  onSelectPlayer: (id: string | null) => void;
  onFollowToggle?: () => void;
};

const MIN_ZOOM = 0.06;
const MAX_ZOOM = 3.0;
const MM_W = 160;
const MM_H = 105;
const MM_PAD = 14;

export function AdminMap({ snapshot, selectedId, followMode, onSelectPlayer, onFollowToggle }: AdminMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);

  // Camera: x/y = world centre of viewport, zoom = world→screen scale
  const cam = useRef({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2, zoom: 0.135, tx: WORLD_WIDTH / 2, ty: WORLD_HEIGHT / 2, tz: 0.135 });

  // Interaction state
  const dragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, cx: 0, cy: 0 });
  const didDrag = useRef(false); // suppress click after drag
  const mouseWorld = useRef({ x: 0, y: 0 }); // cursor in world coords

  // Mirror props into refs so canvas loop uses latest values without re-registering listeners
  const snapRef = useRef(snapshot);
  const selRef = useRef(selectedId);
  const followRef = useRef(followMode);
  const onSelectRef = useRef(onSelectPlayer);
  const onFollowRef = useRef(onFollowToggle);

  useEffect(() => { snapRef.current = snapshot; }, [snapshot]);
  useEffect(() => { selRef.current = selectedId; }, [selectedId]);
  useEffect(() => { followRef.current = followMode; }, [followMode]);
  useEffect(() => { onSelectRef.current = onSelectPlayer; }, [onSelectPlayer]);
  useEffect(() => { onFollowRef.current = onFollowToggle; }, [onFollowToggle]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    // ── Helpers ──────────────────────────────────────────────────────────────
    const wx2 = (wx: number, w: number) => (wx - cam.current.x) * cam.current.zoom + w / 2;
    const wy2 = (wy: number, h: number) => (wy - cam.current.y) * cam.current.zoom + h / 2;
    const sx2wx = (sx: number, w: number) => (sx - w / 2) / cam.current.zoom + cam.current.x;
    const sy2wy = (sy: number, h: number) => (sy - h / 2) / cam.current.zoom + cam.current.y;

    // ── Event handlers ────────────────────────────────────────────────────────
    const onMouseDown = (e: MouseEvent) => {
      if (followRef.current) return;
      dragging.current = true;
      didDrag.current = false;
      dragStart.current = { mx: e.clientX, my: e.clientY, cx: cam.current.x, cy: cam.current.y };
      canvas.style.cursor = "grabbing";
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      mouseWorld.current = { x: sx2wx(e.clientX - rect.left, w), y: sy2wy(e.clientY - rect.top, h) };

      if (dragging.current) {
        const dx = (e.clientX - dragStart.current.mx) / cam.current.zoom;
        const dy = (e.clientY - dragStart.current.my) / cam.current.zoom;
        if (Math.abs(dx) + Math.abs(dy) > 2) didDrag.current = true;
        cam.current.x = dragStart.current.cx - dx;
        cam.current.y = dragStart.current.cy - dy;
        cam.current.tx = cam.current.x;
        cam.current.ty = cam.current.y;
      }
    };

    const onMouseUp = () => {
      dragging.current = false;
      canvas.style.cursor = followRef.current ? "crosshair" : "grab";
    };

    const onMouseLeave = () => { dragging.current = false; };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 0.89;
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, cam.current.zoom * factor));
      const rect = canvas.getBoundingClientRect();
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      // World position under cursor stays fixed
      const wx = sx2wx(mx, w);
      const wy = sy2wy(my, h);
      cam.current.zoom = newZoom;
      cam.current.x = wx - (mx - w / 2) / newZoom;
      cam.current.y = wy - (my - h / 2) / newZoom;
      cam.current.tx = cam.current.x;
      cam.current.ty = cam.current.y;
      cam.current.tz = newZoom;
    };

    const onClick = (e: MouseEvent) => {
      if (didDrag.current) return;
      const rect = canvas.getBoundingClientRect();
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const snap = snapRef.current;

      // Check if clicking minimap
      const mmX = MM_PAD;
      const mmY = h - MM_H - MM_PAD;
      if (cam.current.zoom > 0.22 && cx >= mmX - 2 && cx <= mmX + MM_W + 2 && cy >= mmY - 2 && cy <= mmY + MM_H + 2) {
        // Click inside minimap → teleport camera
        const mmScale = Math.min(MM_W / WORLD_WIDTH, MM_H / WORLD_HEIGHT);
        const mmOffX = mmX + (MM_W - WORLD_WIDTH * mmScale) / 2;
        const mmOffY = mmY + (MM_H - WORLD_HEIGHT * mmScale) / 2;
        cam.current.tx = (cx - mmOffX) / mmScale;
        cam.current.ty = (cy - mmOffY) / mmScale;
        return;
      }

      if (!snap) return;
      const worldX = sx2wx(cx, w);
      const worldY = sy2wy(cy, h);
      let closest: string | null = null;
      let closestDist = 48 / cam.current.zoom;
      for (const p of snap.players) {
        if (p.bot || !p.alive || !p.segments[0]) continue;
        const dx = p.segments[0].x - worldX;
        const dy = p.segments[0].y - worldY;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < closestDist) { closestDist = d; closest = p.id; }
      }
      onSelectRef.current(closest);
    };

    const onDblClick = (e: MouseEvent) => {
      // Double-click → follow selected / toggle follow
      if (selRef.current) onFollowRef.current?.();
      e.preventDefault();
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseLeave);
    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("dblclick", onDblClick);

    // ── Render loop ───────────────────────────────────────────────────────────
    let t = 0;
    const frame = () => {
      t++;

      // Resize
      if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }
      const w = canvas.width;
      const h = canvas.height;
      const c = cam.current;
      const snap = snapRef.current;
      const sel = selRef.current;
      const follow = followRef.current;

      // Follow mode: smoothly track selected player
      if (follow && sel && snap) {
        const p = snap.players.find(pl => pl.id === sel);
        if (p?.alive && p.segments[0]) {
          c.tx = p.segments[0].x;
          c.ty = p.segments[0].y;
          c.tz = Math.max(c.zoom, 0.45); // keep current zoom if already zoomed in more
        }
      }
      // Lerp camera
      c.x += (c.tx - c.x) * 0.08;
      c.y += (c.ty - c.y) * 0.08;
      c.zoom += (c.tz - c.zoom) * 0.08;

      const zoom = c.zoom;
      const _wx2 = (wx: number) => wx2(wx, w);
      const _wy2 = (wy: number) => wy2(wy, h);

      // ── Background ──────────────────────────────────────────────────────────
      ctx.fillStyle = "#09080a";
      ctx.fillRect(0, 0, w, h);

      // Subtle scanlines (very faint, only noticeable when zoomed in)
      if (zoom > 0.25) {
        ctx.save();
        ctx.globalAlpha = 0.025;
        ctx.fillStyle = "#000";
        for (let y = 0; y < h; y += 3) {
          ctx.fillRect(0, y, w, 1);
        }
        ctx.restore();
      }

      // ── Grid ───────────────────────────────────────────────────────────────
      const gridStep = zoom > 0.5 ? 200 : zoom > 0.2 ? 400 : 800;
      ctx.lineWidth = 0.5;
      ctx.strokeStyle = "rgba(212,168,67,0.055)";
      for (let gx = 0; gx <= WORLD_WIDTH; gx += gridStep) {
        ctx.beginPath(); ctx.moveTo(_wx2(gx), 0); ctx.lineTo(_wx2(gx), h); ctx.stroke();
      }
      for (let gy = 0; gy <= WORLD_HEIGHT; gy += gridStep) {
        ctx.beginPath(); ctx.moveTo(0, _wy2(gy)); ctx.lineTo(w, _wy2(gy)); ctx.stroke();
      }

      // Grid coordinate labels
      if (zoom > 0.18) {
        ctx.save();
        ctx.font = `9px "JetBrains Mono", monospace`;
        ctx.fillStyle = "rgba(212,168,67,0.25)";
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        for (let gx = gridStep; gx < WORLD_WIDTH; gx += gridStep) {
          const sx = _wx2(gx);
          if (sx > 20 && sx < w - 20) ctx.fillText(`${gx}`, sx + 3, 4);
        }
        ctx.textAlign = "left";
        for (let gy = gridStep; gy < WORLD_HEIGHT; gy += gridStep) {
          const sy = _wy2(gy);
          if (sy > 20 && sy < h - 20) ctx.fillText(`${gy}`, 4, sy + 2);
        }
        ctx.restore();
      }

      // ── World border ────────────────────────────────────────────────────────
      ctx.strokeStyle = "rgba(212,168,67,0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(_wx2(0), _wy2(0), WORLD_WIDTH * zoom, WORLD_HEIGHT * zoom);

      // Corner ticks
      ctx.strokeStyle = "rgba(212,168,67,0.5)";
      ctx.lineWidth = 1.5;
      for (const [cx2, cy2] of [[0, 0], [WORLD_WIDTH, 0], [0, WORLD_HEIGHT], [WORLD_WIDTH, WORLD_HEIGHT]] as [number, number][]) {
        const sx = _wx2(cx2); const sy = _wy2(cy2);
        const dx = cx2 === 0 ? 1 : -1; const dy = cy2 === 0 ? 1 : -1;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + dx * 14, sy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy + dy * 14); ctx.stroke();
      }

      if (!snap) { rafRef.current = requestAnimationFrame(frame); return; }

      // ── Food ───────────────────────────────────────────────────────────────
      for (const food of snap.food) {
        const fx = _wx2(food.x); const fy = _wy2(food.y);
        // Cull off-screen
        if (fx < -10 || fx > w + 10 || fy < -10 || fy > h + 10) continue;
        const pulse = 0.6 + 0.4 * Math.sin(t * 0.04 + (food.x + food.y) * 0.002);
        const r = Math.max(1.2, FOOD_RADIUS * zoom * 0.55);
        ctx.save();
        ctx.globalAlpha = 0.55 + 0.25 * pulse;
        ctx.shadowBlur = 7 * pulse;
        ctx.shadowColor = food.color;
        ctx.beginPath(); ctx.arc(fx, fy, r, 0, Math.PI * 2);
        ctx.fillStyle = food.color;
        ctx.fill();
        ctx.restore();
      }

      // ── Snakes ─────────────────────────────────────────────────────────────
      const sorted = [...snap.players].sort((a, b) => {
        const rank = (p: typeof a) => (p.alive ? 1 : 0) * 2 + (p.bot ? 0 : 1);
        return rank(a) - rank(b);
      });

      for (const p of sorted) {
        if (!p.segments[0]) continue;
        const isSelected = p.id === sel;
        const isDead = !p.alive;
        const isBot = p.bot;
        const baseAlpha = isDead ? 0.15 : isBot ? 0.5 : 1;

        // Cull if head off-screen with margin
        const hsx = _wx2(p.segments[0].x);
        const hsy = _wy2(p.segments[0].y);
        const cullMargin = Math.max(200, p.segments.length * BODY_RADIUS) * zoom;
        if (hsx < -cullMargin || hsx > w + cullMargin || hsy < -cullMargin || hsy > h + cullMargin) continue;

        const bodyWidth = Math.max(1.5, BODY_RADIUS * 2 * zoom * 0.88);
        const headRadius = Math.max(2, HEAD_RADIUS * zoom);

        // ── Body (smooth stroke path) ─────────────────────────────────
        if (p.segments.length > 1) {
          const step = zoom < 0.15 ? 4 : zoom < 0.25 ? 2 : 1;
          ctx.save();
          ctx.globalAlpha = baseAlpha;
          ctx.lineWidth = bodyWidth;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          ctx.strokeStyle = isDead ? "#2a2a2a" : (p.accent || p.color);
          if (isSelected && !isDead) {
            ctx.shadowBlur = 18;
            ctx.shadowColor = "#d4a843";
          } else if (!isDead) {
            ctx.shadowBlur = zoom > 0.3 ? 8 : 4;
            ctx.shadowColor = p.color;
          }
          ctx.beginPath();
          let started = false;
          for (let i = p.segments.length - 1; i >= 0; i -= step) {
            const sx = _wx2(p.segments[i].x);
            const sy = _wy2(p.segments[i].y);
            if (!started) { ctx.moveTo(sx, sy); started = true; }
            else ctx.lineTo(sx, sy);
          }
          ctx.stroke();
          ctx.restore();
        }

        // ── Head ──────────────────────────────────────────────────────
        ctx.save();
        ctx.globalAlpha = baseAlpha;
        ctx.shadowBlur = isSelected ? 20 : (isDead ? 0 : zoom > 0.3 ? 10 : 5);
        ctx.shadowColor = isSelected ? "#d4a843" : p.color;
        ctx.beginPath();
        ctx.arc(hsx, hsy, headRadius, 0, Math.PI * 2);
        ctx.fillStyle = isDead ? "#333" : p.color;
        ctx.fill();

        // Bright specular dot on head
        if (!isDead && zoom > 0.15) {
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.arc(hsx - headRadius * 0.28, hsy - headRadius * 0.28, headRadius * 0.22, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,255,255,0.35)";
          ctx.fill();
        }
        ctx.restore();

        // ── Selection ring ────────────────────────────────────────────
        if (isSelected && p.alive) {
          const pulse = 0.65 + 0.35 * Math.sin(t * 0.1);
          ctx.save();
          ctx.strokeStyle = `rgba(212,168,67,${pulse})`;
          ctx.lineWidth = 1.5;
          ctx.shadowBlur = 22;
          ctx.shadowColor = "#d4a843";
          ctx.beginPath();
          ctx.arc(hsx, hsy, headRadius + 7, 0, Math.PI * 2);
          ctx.stroke();
          // Second outer ring
          ctx.globalAlpha = pulse * 0.35;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(hsx, hsy, headRadius + 13, 0, Math.PI * 2);
          ctx.stroke();
          ctx.restore();
        }

        // ── Name label ────────────────────────────────────────────────
        if (!isBot && !isDead && zoom > 0.16) {
          const fontSize = Math.max(9, Math.round(10 * zoom));
          ctx.save();
          ctx.font = `600 ${fontSize}px "JetBrains Mono", monospace`;
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#000";
          ctx.fillStyle = isSelected ? "#f0c850" : "#f5e6c8";
          ctx.globalAlpha = 0.92;
          ctx.fillText(p.name, hsx, hsy - headRadius - 5);
          if (p.isDev && zoom > 0.3) {
            ctx.font = `600 ${Math.max(7, Math.round(7 * zoom))}px "JetBrains Mono", monospace`;
            ctx.fillStyle = "#e05252";
            ctx.fillText("DEV", hsx, hsy - headRadius - 5 - fontSize - 1);
          }
          ctx.restore();
        }
      }

      // ── Vignette ───────────────────────────────────────────────────────────
      const vg = ctx.createRadialGradient(w / 2, h / 2, h * 0.35, w / 2, h / 2, h * 0.85);
      vg.addColorStop(0, "transparent");
      vg.addColorStop(1, "rgba(4,3,5,0.55)");
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);

      // ── Minimap ────────────────────────────────────────────────────────────
      if (zoom > 0.22) {
        const mmX = MM_PAD;
        const mmY = h - MM_H - MM_PAD;
        const mmScale = Math.min(MM_W / WORLD_WIDTH, MM_H / WORLD_HEIGHT);
        const mmOffX = mmX + (MM_W - WORLD_WIDTH * mmScale) / 2;
        const mmOffY = mmY + (MM_H - WORLD_HEIGHT * mmScale) / 2;

        ctx.save();

        // Minimap bg
        ctx.fillStyle = "rgba(7, 5, 9, 0.88)";
        ctx.strokeStyle = "rgba(212,168,67,0.22)";
        ctx.lineWidth = 1;
        ctx.fillRect(mmX - 2, mmY - 2, MM_W + 4, MM_H + 4);
        ctx.strokeRect(mmX - 2, mmY - 2, MM_W + 4, MM_H + 4);

        // Clip to minimap
        ctx.beginPath();
        ctx.rect(mmX, mmY, MM_W, MM_H);
        ctx.clip();

        // World background on minimap
        ctx.fillStyle = "rgba(18,12,8,0.6)";
        ctx.fillRect(mmOffX, mmOffY, WORLD_WIDTH * mmScale, WORLD_HEIGHT * mmScale);

        // Food density dots (sparse)
        ctx.fillStyle = "rgba(212,168,67,0.2)";
        for (const food of snap.food) {
          const fx = mmOffX + food.x * mmScale;
          const fy = mmOffY + food.y * mmScale;
          ctx.fillRect(fx, fy, 1, 1);
        }

        // Player dots on minimap
        for (const p of snap.players) {
          if (!p.alive || !p.segments[0]) continue;
          const px = mmOffX + p.segments[0].x * mmScale;
          const py = mmOffY + p.segments[0].y * mmScale;
          const r = p.id === sel ? 3.5 : (p.bot ? 1.5 : 2.5);
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fillStyle = p.id === sel ? "#f0c850" : (p.bot ? "#444" : p.color);
          ctx.shadowBlur = p.id === sel ? 6 : 0;
          ctx.shadowColor = "#d4a843";
          ctx.fill();
        }

        // Viewport rectangle
        const vpX = mmOffX + (c.x - w / (2 * zoom)) * mmScale;
        const vpY = mmOffY + (c.y - h / (2 * zoom)) * mmScale;
        const vpW = (w / zoom) * mmScale;
        const vpH = (h / zoom) * mmScale;
        ctx.strokeStyle = "rgba(212,168,67,0.55)";
        ctx.lineWidth = 1;
        ctx.shadowBlur = 0;
        ctx.strokeRect(vpX, vpY, vpW, vpH);

        ctx.restore();

        // Minimap label
        ctx.save();
        ctx.font = '8px "JetBrains Mono", monospace';
        ctx.fillStyle = "rgba(212,168,67,0.35)";
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText("OVERVIEW", mmX, mmY - 3);
        ctx.restore();
      }

      // ── HUD overlays ────────────────────────────────────────────────────────
      ctx.save();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = "rgba(212,168,67,0.4)";

      // Zoom level — top right
      ctx.textAlign = "right";
      ctx.textBaseline = "top";
      ctx.fillText(`${zoom.toFixed(2)}×`, w - 12, 10);

      // Cursor world coordinates — bottom right
      ctx.textBaseline = "bottom";
      const mw = mouseWorld.current;
      ctx.fillText(`${Math.round(mw.x)}, ${Math.round(mw.y)}`, w - 12, h - 10);

      // Player count — top left (offset if minimap shown)
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const humans = snap.players.filter(p => !p.bot && p.alive).length;
      const bots = snap.players.filter(p => p.bot && p.alive).length;
      ctx.fillText(`${humans} humans · ${bots} bots`, 12, 10);

      ctx.restore();

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);

    // Update cursor when follow mode changes
    canvas.style.cursor = "grab";

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseLeave);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("click", onClick);
      canvas.removeEventListener("dblclick", onDblClick);
    };
  }, []);

  // Sync cursor style when follow mode changes
  useEffect(() => {
    if (canvasRef.current) {
      canvasRef.current.style.cursor = followMode ? "crosshair" : "grab";
    }
  }, [followMode]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

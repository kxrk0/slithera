import { useEffect, useRef } from "react";
import type { ServerSnapshot } from "../../../../shared/types";
import { WORLD_WIDTH, WORLD_HEIGHT, HEAD_RADIUS, BODY_RADIUS, FOOD_RADIUS } from "../../../../shared/constants";

type AdminMapProps = {
  snapshot: ServerSnapshot | null;
  selectedId: string | null;
  followMode: boolean;
  onSelectPlayer: (id: string | null) => void;
};

export function AdminMap({ snapshot, selectedId, followMode, onSelectPlayer }: AdminMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef(0);
  const camRef = useRef({ x: WORLD_WIDTH / 2, y: WORLD_HEIGHT / 2, zoom: 0.135, tx: WORLD_WIDTH / 2, ty: WORLD_HEIGHT / 2, tz: 0.135 });

  const snapshotRef = useRef(snapshot);
  const selectedRef = useRef(selectedId);
  const followRef = useRef(followMode);
  const onSelectRef = useRef(onSelectPlayer);

  useEffect(() => { snapshotRef.current = snapshot; }, [snapshot]);
  useEffect(() => { selectedRef.current = selectedId; }, [selectedId]);
  useEffect(() => { followRef.current = followMode; }, [followMode]);
  useEffect(() => { onSelectRef.current = onSelectPlayer; }, [onSelectPlayer]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const onClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const snap = snapshotRef.current;
      if (!snap) return;
      const { x: camX, y: camY, zoom } = camRef.current;
      const wx = (cx - canvas.width / 2) / zoom + camX;
      const wy = (cy - canvas.height / 2) / zoom + camY;
      let closest: string | null = null;
      let closestDist = 40 / zoom;
      for (const p of snap.players) {
        if (p.bot || !p.alive || !p.segments[0]) continue;
        const dx = p.segments[0].x - wx;
        const dy = p.segments[0].y - wy;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < closestDist) { closestDist = d; closest = p.id; }
      }
      onSelectRef.current(closest);
    };

    canvas.addEventListener("click", onClick);

    let t = 0;
    const frame = () => {
      t++;
      // resize canvas to match CSS size
      if (canvas.width !== canvas.offsetWidth || canvas.height !== canvas.offsetHeight) {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
      }

      const c = camRef.current;
      const snap = snapshotRef.current;
      const sel = selectedRef.current;
      const follow = followRef.current;

      // Update camera target
      if (follow && sel && snap) {
        const p = snap.players.find((pl) => pl.id === sel);
        if (p?.alive && p.segments[0]) {
          c.tx = p.segments[0].x; c.ty = p.segments[0].y; c.tz = 0.5;
        }
      } else {
        c.tx = WORLD_WIDTH / 2; c.ty = WORLD_HEIGHT / 2; c.tz = 0.135;
      }
      c.x += (c.tx - c.x) * 0.07;
      c.y += (c.ty - c.y) * 0.07;
      c.zoom += (c.tz - c.zoom) * 0.07;

      const { x: camX, y: camY, zoom } = c;
      const w = canvas.width;
      const h = canvas.height;
      const wx2 = (wx: number) => (wx - camX) * zoom + w / 2;
      const wy2 = (wy: number) => (wy - camY) * zoom + h / 2;

      // Background
      ctx.fillStyle = "#09080a";
      ctx.fillRect(0, 0, w, h);

      // Grid lines
      const gridStep = 400;
      ctx.strokeStyle = "rgba(212,168,67,0.06)";
      ctx.lineWidth = 0.5;
      for (let gx = 0; gx <= WORLD_WIDTH; gx += gridStep) {
        ctx.beginPath(); ctx.moveTo(wx2(gx), 0); ctx.lineTo(wx2(gx), h); ctx.stroke();
      }
      for (let gy = 0; gy <= WORLD_HEIGHT; gy += gridStep) {
        ctx.beginPath(); ctx.moveTo(0, wy2(gy)); ctx.lineTo(w, wy2(gy)); ctx.stroke();
      }

      // World border
      ctx.strokeStyle = "rgba(212,168,67,0.25)";
      ctx.lineWidth = 1;
      ctx.strokeRect(wx2(0), wy2(0), WORLD_WIDTH * zoom, WORLD_HEIGHT * zoom);

      // Corner tick marks
      ctx.strokeStyle = "rgba(212,168,67,0.4)";
      ctx.lineWidth = 1.5;
      const corners: [number, number][] = [[0, 0], [WORLD_WIDTH, 0], [0, WORLD_HEIGHT], [WORLD_WIDTH, WORLD_HEIGHT]];
      const tickLen = 12;
      for (const [cx2, cy2] of corners) {
        const sx = wx2(cx2); const sy = wy2(cy2);
        const dx = cx2 === 0 ? 1 : -1; const dy = cy2 === 0 ? 1 : -1;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx + dx * tickLen, sy); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx, sy + dy * tickLen); ctx.stroke();
      }

      if (!snap) { rafRef.current = requestAnimationFrame(frame); return; }

      // Food pellets
      for (const food of snap.food) {
        const fx = wx2(food.x); const fy = wy2(food.y);
        const r = Math.max(1.5, FOOD_RADIUS * zoom * 0.6);
        ctx.save();
        ctx.shadowBlur = 6; ctx.shadowColor = food.color;
        ctx.beginPath(); ctx.arc(fx, fy, r, 0, Math.PI * 2);
        ctx.fillStyle = food.color; ctx.globalAlpha = 0.75;
        ctx.fill(); ctx.restore();
      }

      // Players — draw back to front (dead first, then bots, then humans)
      const sorted = [...snap.players].sort((a, b) => {
        const score = (p: typeof a) => (p.alive ? 1 : 0) + (p.bot ? 0 : 2);
        return score(a) - score(b);
      });

      for (const p of sorted) {
        if (!p.segments[0]) continue;
        const isSelected = p.id === sel;
        const isBot = p.bot;
        const isDead = !p.alive;
        const baseAlpha = isDead ? 0.18 : isBot ? 0.45 : 1;

        // Segment rendering — step by 2 or 3 when zoomed out for perf
        const step = zoom < 0.2 ? 3 : zoom < 0.35 ? 2 : 1;
        for (let i = p.segments.length - 1; i >= 0; i -= step) {
          const seg = p.segments[i];
          const sx = wx2(seg.x); const sy = wy2(seg.y);
          const isHead = i === 0;
          const r = Math.max(1, (isHead ? HEAD_RADIUS : BODY_RADIUS) * zoom * 0.9);

          ctx.save();
          ctx.globalAlpha = baseAlpha;
          if (isSelected && !isDead) { ctx.shadowBlur = 10; ctx.shadowColor = "#d4a843"; }
          ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fillStyle = isDead ? "#444" : (isHead ? p.color : (p.accent || p.color));
          ctx.fill(); ctx.restore();
        }

        // Head ring for selected
        if (isSelected && p.alive && p.segments[0]) {
          const hx = wx2(p.segments[0].x); const hy = wy2(p.segments[0].y);
          const pulse = 0.7 + 0.3 * Math.sin(t * 0.08);
          ctx.save();
          ctx.strokeStyle = `rgba(212,168,67,${pulse})`;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 20; ctx.shadowColor = "#d4a843";
          ctx.beginPath(); ctx.arc(hx, hy, HEAD_RADIUS * zoom + 8, 0, Math.PI * 2);
          ctx.stroke(); ctx.restore();
        }

        // Name labels — only for humans when zoom is big enough
        if (!isBot && !isDead && zoom > 0.18 && p.segments[0]) {
          const hx = wx2(p.segments[0].x); const hy = wy2(p.segments[0].y);
          const fontSize = Math.max(9, Math.round(11 * zoom));
          ctx.save();
          ctx.font = `500 ${fontSize}px "JetBrains Mono", monospace`;
          ctx.textAlign = "center"; ctx.textBaseline = "bottom";
          ctx.shadowBlur = 8; ctx.shadowColor = "#000";
          ctx.fillStyle = isSelected ? "#d4a843" : "#f5e6c8";
          ctx.globalAlpha = 0.9;
          ctx.fillText(p.name, hx, hy - HEAD_RADIUS * zoom - 4);
          ctx.restore();
        }
      }

      // HUD: player count overlay in corner
      ctx.save();
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = "rgba(212,168,67,0.35)";
      ctx.textAlign = "right"; ctx.textBaseline = "bottom";
      const humans = snap.players.filter(p => !p.bot && p.alive).length;
      const bots = snap.players.filter(p => p.bot && p.alive).length;
      ctx.fillText(`${humans}H · ${bots}B`, w - 12, h - 10);
      ctx.restore();

      rafRef.current = requestAnimationFrame(frame);
    };

    rafRef.current = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(rafRef.current); canvas.removeEventListener("click", onClick); };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: "100%", display: "block", cursor: "crosshair" }}
    />
  );
}

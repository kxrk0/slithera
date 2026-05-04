import { useEffect, useMemo, useState } from "react";
import { Crown, Expand, Pause, Play, RotateCcw, Settings } from "lucide-react";
import { BOOST_MAX, HAT_OPTIONS, ROPE_ACCESSORIES, SNAKE_SKINS, WORLD_HEIGHT, WORLD_WIDTH } from "../../../shared/constants";
import type { PlayerState, ServerSnapshot } from "../../../shared/types";
import type { RecentEvent } from "../game/useGameClient";
import { useLocale } from "../lib/i18n";
import { SettingsModal } from "./menu/SettingsModal";

const HAT_GLYPH: Record<string, string> = HAT_OPTIONS.reduce((acc, h) => {
  acc[h.id] = h.mark;
  return acc;
}, {} as Record<string, string>);
const SKIN_BY_ID: Record<string, typeof SNAKE_SKINS[number]> = SNAKE_SKINS.reduce((acc, s) => {
  acc[s.id] = s;
  return acc;
}, {} as Record<string, typeof SNAKE_SKINS[number]>);
const HAT_BY_ID: Record<string, typeof HAT_OPTIONS[number]> = HAT_OPTIONS.reduce((acc, h) => {
  acc[h.id] = h;
  return acc;
}, {} as Record<string, typeof HAT_OPTIONS[number]>);
const CHARM_BY_ID: Record<string, typeof ROPE_ACCESSORIES[number]> = ROPE_ACCESSORIES.reduce((acc, r) => {
  acc[r.id] = r;
  return acc;
}, {} as Record<string, typeof ROPE_ACCESSORIES[number]>);

type GameHudProps = {
  status: string;
  latency: number;
  player?: PlayerState;
  playerId?: string;
  snapshot?: ServerSnapshot;
  paused: boolean;
  perf: { fps: number; renderer: string };
  recentEvents?: RecentEvent[];
  rewards?: { coins: number; xp: number } | null;
  onPause: () => void;
  onPlay: () => void;
  onRespawn: () => void;
  onMainMenu: () => void;
  onBoost: (boosting: boolean) => void;
};

export function GameHud({
  status,
  latency,
  player,
  playerId,
  snapshot,
  perf,
  paused,
  recentEvents,
  rewards,
  onPause,
  onPlay,
  onRespawn,
  onMainMenu,
  onBoost
}: GameHudProps) {
  const online = snapshot?.players.filter((item) => !item.bot).length ?? 0;
  const active = snapshot?.players.filter((item) => item.alive).length ?? 0;
  const leaderboard = snapshot?.leaderboard ?? [];
  const score = player?.score ?? 0;
  const length = player?.segments.length ?? 0;
  const boostPct = player ? Math.max(0, Math.min(100, (player.boost / BOOST_MAX) * 100)) : 0;
  const isBoosting = Boolean(player?.boosting);
  const killerName = player && !player.alive ? player.lastKillerName ?? null : null;
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { t } = useLocale();
  // Killfeed: derive from server-broadcast death events, resolve names + cosmetics from snapshot
  const killfeed = useMemo(() => {
    if (!recentEvents || !snapshot) return [];
    const now = performance.now();
    const playerById = new Map(snapshot.players.map((p) => [p.id, p] as const));
    return recentEvents
      .filter((e) => e.event.type === "death" && now - e.at < 4000)
      .slice(-5)
      .map((entry) => {
        const death = entry.event as Extract<typeof entry.event, { type: "death" }>;
        const victim = playerById.get(death.id);
        const killer = death.killerId ? playerById.get(death.killerId) : undefined;
        return {
          key: death.id + "-" + entry.at,
          victimId: death.id,
          victimName: victim?.name ?? "Unknown",
          victimColor: victim?.color ?? "#ff4f93",
          victimHat: victim?.hatId,
          killerId: death.killerId,
          killerName: killer?.name ?? (death.killerId ? "—" : null),
          killerColor: killer?.color ?? "#22d8ff",
          killerHat: killer?.hatId,
          age: now - entry.at
        };
      });
  }, [recentEvents, snapshot]);

  // Force re-render so killfeed entries fade out when their TTL expires
  const [, forceTick] = useState(0);
  useEffect(() => {
    if (killfeed.length === 0) return;
    const id = window.setInterval(() => forceTick((n) => n + 1), 500);
    return () => window.clearInterval(id);
  }, [killfeed.length]);

  return (
    <div className="wg-hud" aria-live="polite">
      {/* Top-left: settings + arena status */}
      <section className="wg-hud-topleft">
        <button className="wg-hud-settings" type="button" aria-label={t("menu.settings")} onClick={() => setSettingsOpen(true)}>
          <Settings size={16} />
        </button>
        <div className="wg-hud-arena">
          <span className={`wg-hud-status-dot ${status}`} />
          <div>
            <strong>{t("hud.arena")}</strong>
            <span>{t("hud.online", { count: Math.max(active, online), ms: latency || "--" })}</span>
          </div>
        </div>
      </section>

      {/* Top-center: brand */}
      <section className="wg-hud-brand" aria-label="Slithera">
        <h1>Slither<span className="amp">&amp;</span>a</h1>
      </section>

      {/* Top-right: leaderboard */}
      <section className="wg-hud-leaderboard" aria-label="Leaderboard">
        <header>
          <Crown size={14} fill="currentColor" />
          <span>{t("hud.theHall")}</span>
        </header>
        <ol>
          {leaderboard.slice(0, 8).map((entry, index) => {
            const hatGlyph = entry.hatId && entry.hatId !== "none" ? HAT_GLYPH[entry.hatId] : null;
            return (
              <li className={entry.id === playerId ? "you" : ""} key={entry.id}>
                <span className="rank">{toRoman(index + 1)}</span>
                <span className="dot" style={{ background: entry.color }} />
                <span className="name">
                  {entry.isDev ? <span className="lb-dev-tag" aria-label="Developer">DEV</span> : null}
                  {hatGlyph ? <span className="lb-hat" aria-hidden="true">{hatGlyph}</span> : null}
                  {entry.name}
                </span>
                <span className="points">{formatScore(entry.score)}</span>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Killfeed */}
      {killfeed.length > 0 ? (
        <section className="wg-killfeed" aria-label="Recent eliminations">
          {killfeed.map((row) => {
            const killerHatGlyph = row.killerHat && row.killerHat !== "none" ? HAT_GLYPH[row.killerHat] : null;
            const victimHatGlyph = row.victimHat && row.victimHat !== "none" ? HAT_GLYPH[row.victimHat] : null;
            return (
              <div className="wg-killfeed-row" key={row.key}>
                {row.killerName ? (
                  <>
                    <span className="kf-dot" style={{ background: row.killerColor }} />
                    <span className={`killer ${row.killerId === playerId ? "you" : ""}`}>
                      {killerHatGlyph ? <span className="kf-hat" aria-hidden="true">{killerHatGlyph}</span> : null}
                      {row.killerName}
                    </span>
                    <span className="arrow">→</span>
                  </>
                ) : (
                  <span className="arrow">✕</span>
                )}
                <span className="kf-dot" style={{ background: row.victimColor, opacity: 0.55 }} />
                <span className={`victim ${row.victimId === playerId ? "you" : ""}`}>
                  {victimHatGlyph ? <span className="kf-hat" aria-hidden="true">{victimHatGlyph}</span> : null}
                  {row.victimName}
                </span>
              </div>
            );
          })}
        </section>
      ) : null}

      {/* Bottom-left: score */}
      <section className="wg-hud-score">
        <span className="lbl">{t("hud.length")}</span>
        <strong>{formatScore(length)}</strong>
      </section>

      {/* Bottom-right: minimap + perf */}
      <section className="wg-hud-perf" aria-label="Performance">
        <strong>{perf.fps || "--"}</strong>
        <span>FPS · {perf.renderer.toUpperCase()}</span>
      </section>

      <section className="wg-hud-minimap" aria-label="Minimap">
        <div className="wg-hud-minimap-grid">
          {snapshot?.food.slice(0, 26).map((food) => (
            <i
              key={food.id}
              style={{
                left: `${(food.x / WORLD_WIDTH) * 100}%`,
                top: `${(food.y / WORLD_HEIGHT) * 100}%`,
                background: food.color
              }}
            />
          ))}
          {snapshot?.players.map((item) => {
            const head = item.segments[0];
            if (!head || !item.alive) return null;
            return (
              <b
                className={item.id === playerId ? "me" : ""}
                key={item.id}
                style={{
                  left: `${(head.x / WORLD_WIDTH) * 100}%`,
                  top: `${(head.y / WORLD_HEIGHT) * 100}%`,
                  borderColor: item.color
                }}
              />
            );
          })}
        </div>
      </section>

      {/* Boost meter (visible while alive) */}
      {player && player.alive ? (
        <div
          className={`wg-boost-meter${boostPct < 1 ? " empty" : ""}${isBoosting ? " boosting" : ""}`}
          aria-label="Boost meter"
        >
          <i style={{ width: `${boostPct}%` }} />
        </div>
      ) : null}

      {/* Death overlay (full screen) */}
      {player && !player.alive ? (
        <DeathScreen
          score={score}
          length={length}
          kills={player.kills}
          killerName={killerName}
          rewards={rewards ?? null}
          onMainMenu={onMainMenu}
          onRespawn={onRespawn}
        />
      ) : null}

      {/* Pause overlay (only while alive) */}
      {paused && player && player.alive ? (
        <PauseScreen
          skinId={player.skinId}
          hatId={player.hatId}
          charmId={player.ropeAccessoryId}
          onResume={onPlay}
          onMainMenu={onMainMenu}
        />
      ) : null}

      {/* Pause/Resume toggle (visible while alive) */}
      {player && player.alive ? (
        <button
          className="wg-hud-pause"
          type="button"
          aria-label={paused ? "Resume" : "Pause"}
          onClick={onPause}
        >
          {paused ? <Play size={14} fill="currentColor" /> : <Pause size={14} fill="currentColor" />}
        </button>
      ) : null}

      <button className="wg-hud-fullscreen" type="button" aria-label="Fullscreen" onClick={toggleFullscreen}>
        <Expand size={14} />
      </button>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

type DeathScreenProps = {
  score: number;
  length: number;
  kills: number;
  killerName: string | null;
  rewards: { coins: number; xp: number } | null;
  onMainMenu: () => void;
  onRespawn: () => void;
};

type PauseScreenProps = {
  skinId: string;
  hatId?: string;
  charmId?: string;
  onResume: () => void;
  onMainMenu: () => void;
};

function PauseScreen({ skinId, hatId, charmId, onResume, onMainMenu }: PauseScreenProps) {
  const { t } = useLocale();
  const skin = SKIN_BY_ID[skinId] ?? SNAKE_SKINS[0];
  const hat = hatId ? HAT_BY_ID[hatId] : undefined;
  const charm = charmId ? CHARM_BY_ID[charmId] : undefined;
  return (
    <div className="wg-pause-overlay" role="dialog" aria-modal="true">
      <div className="wg-pause-card">
        <div className="wg-pause-eyebrow">· · · {t("pause.eyebrow")} · · ·</div>
        <h1 className="wg-pause-title">{t("pause.title")}</h1>
        <div className="wg-pause-loadout">
          <div className="wg-pause-loadout-row">
            <span className="wg-pause-swatch" style={{ background: `linear-gradient(135deg, ${skin.color}, ${skin.shadow})` }} />
            <span className="lbl">{t("pause.skin")}</span>
            <span className="val">{skin.name}</span>
          </div>
          <div className="wg-pause-loadout-row">
            <span className="wg-pause-swatch" aria-hidden="true">{hat && hat.id !== "none" ? hat.mark : "—"}</span>
            <span className="lbl">{t("pause.hat")}</span>
            <span className="val">{hat && hat.id !== "none" ? hat.name : t("pause.bare")}</span>
          </div>
          <div className="wg-pause-loadout-row">
            <span className="wg-pause-swatch" aria-hidden="true">{charm && charm.id !== "none" ? "•" : "—"}</span>
            <span className="lbl">{t("pause.charm")}</span>
            <span className="val">{charm && charm.id !== "none" ? charm.name : t("pause.none")}</span>
          </div>
        </div>
        <div className="wg-pause-hint">{t("pause.hint")}</div>
        <div className="wg-pause-actions">
          <button className="wg-cancel-btn" type="button" onClick={onMainMenu}>{t("death.mainMenu")}</button>
          <button className="wg-equip-btn" type="button" onClick={onResume}>{t("pause.resume")}</button>
        </div>
      </div>
    </div>
  );
}

function DeathScreen({ score, length, kills, killerName, rewards, onMainMenu, onRespawn }: DeathScreenProps) {
  const { t } = useLocale();
  return (
    <div className="wg-death-overlay" role="alert">
      <div className="wg-death-card">
        <div className="wg-death-eyebrow">· · · {t("death.eyebrow")} · · ·</div>
        <h1 className="wg-death-title">{t("death.titleLead")} <span className="accent">{t("death.titleAccent")}</span></h1>
        <div className="wg-death-killer">
          {killerName ? (
            <>
              {t("death.killerPrefix")}<strong>{killerName}</strong>{t("death.killerSuffix")}
            </>
          ) : t("death.byOwn")}
        </div>
        <div className="wg-death-stats">
          <div className="wg-death-stat">
            <strong>{formatScore(length)}</strong>
            <span>{t("death.length")}</span>
          </div>
          <div className="wg-death-stat">
            <strong>{kills}</strong>
            <span>{t("death.kills")}</span>
          </div>
          <div className="wg-death-stat">
            <strong>{formatScore(score)}</strong>
            <span>{t("death.food")}</span>
          </div>
          <div className="wg-death-stat">
            <strong>{rewards ? formatScore(rewards.coins) : "—"}</strong>
            <span>{t("death.coins")}</span>
          </div>
        </div>
        {rewards ? (
          <div className="wg-death-rewards">{t("death.xpEarned", { xp: rewards.xp.toLocaleString() })}</div>
        ) : null}
        <div className="wg-death-actions">
          <button className="wg-cancel-btn" type="button" onClick={onMainMenu}>{t("death.mainMenu")}</button>
          <button className="wg-cancel-btn wg-death-respawn" type="button" onClick={onRespawn}>
            <RotateCcw size={14} style={{ verticalAlign: "-2px", marginRight: 8 }} />
            {t("death.respawn")}
          </button>
        </div>
      </div>
    </div>
  );
}

function toggleFullscreen() {
  if (document.fullscreenElement) {
    void document.exitFullscreen();
  } else {
    void document.documentElement.requestFullscreen();
  }
}

function formatScore(value: number): string {
  return Math.floor(value).toLocaleString("en-US");
}

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
function toRoman(n: number): string {
  return ROMAN[Math.max(0, Math.min(ROMAN.length - 1, n - 1))];
}

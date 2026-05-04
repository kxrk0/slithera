import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../lib/auth";
import { useSpectatorClient } from "../game/useSpectatorClient";
import { AdminMap } from "../components/admin/AdminMap";
import { DEV_UIDS } from "../../../shared/exclusive";
import "../components/admin/admin.css";

export function AdminDashboard() {
  const { user } = useAuth();
  const isAuthorized = user != null && DEV_UIDS.includes(user.id);
  const { connected, snapshot, kick, banPlayer, broadcast, setMinions, lastResult } = useSpectatorClient(isAuthorized ? user?.id : undefined);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [followMode, setFollowMode] = useState(false);
  const [broadcastText, setBroadcastText] = useState("");
  const [minionInput, setMinionInput] = useState("0");
  const [toast, setToast] = useState<{ msg: string; key: number } | null>(null);

  const showToast = (msg: string) => setToast({ msg, key: Date.now() });

  useEffect(() => {
    if (!lastResult) return;
    showToast(lastResult.ok ? `ok: ${lastResult.action}` : `error: ${lastResult.error ?? "unknown"}`);
  }, [lastResult]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSelectPlayer = useCallback((id: string | null) => {
    setSelectedId(id);
    if (!id) setFollowMode(false);
  }, []);

  const selectedPlayer = snapshot?.players.find(p => p.id === selectedId) ?? null;
  const humans = snapshot?.players.filter(p => !p.bot) ?? [];
  const bots = snapshot?.players.filter(p => p.bot && p.alive && !p.isMinion) ?? [];
  const activeMinions = (selectedId && snapshot)
    ? snapshot.players.filter(p => p.isMinion && p.ownerId === selectedId && p.alive).length
    : 0;

  // Sync minion input box when selecting a different player
  useEffect(() => { setMinionInput("0"); }, [selectedId]);

  const handleKick = () => {
    if (!selectedId) return;
    if (!confirm(`Kick "${selectedPlayer?.name}"?`)) return;
    kick(selectedId);
  };

  const handleBan = () => {
    if (!selectedId) return;
    if (!confirm(`Ban "${selectedPlayer?.name}" permanently? This cannot be undone until server restart.`)) return;
    banPlayer(selectedId);
  };

  const handleBroadcast = () => {
    const text = broadcastText.trim();
    if (!text) return;
    broadcast(text);
    setBroadcastText("");
  };

  const handleSetMinions = () => {
    if (!selectedId) return;
    const n = Math.max(0, Math.min(500, Math.floor(Number(minionInput) || 0)));
    setMinions(selectedId, n);
  };

  if (!user) {
    return (
      <div className="ad-denied">
        <div className="ad-denied-icon">⊘</div>
        <div className="ad-denied-title">Not Signed In</div>
        <div className="ad-denied-sub">Sign in with your developer account to access the control panel.</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="ad-denied">
        <div className="ad-denied-icon">⊘</div>
        <div className="ad-denied-title">Access Denied</div>
        <div className="ad-denied-sub">This panel is restricted to authorized developer accounts.</div>
      </div>
    );
  }

  const humanCount = humans.filter(p => p.alive).length;
  const botCount = bots.length;

  return (
    <div className="ad-root">
      {/* Header */}
      <header className="ad-header">
        <div className="ad-logo">
          Slithera<span className="ad-logo-slash"> // </span>Control
        </div>
        <div className="ad-separator" />
        <div className={`ad-live${connected ? "" : " ad-live--offline"}`}>
          <div className="ad-live-dot" />
          {connected ? "LIVE" : "CONNECTING"}
        </div>
        <div className="ad-header-stats">
          <span><span className="ad-stat-val">{humanCount}</span> humans</span>
          <span><span className="ad-stat-val">{botCount}</span> bots</span>
          <span>tick <span className="ad-stat-val">{snapshot?.tick ?? "—"}</span></span>
        </div>
        <div className="ad-header-user">
          {user.name ?? user.email ?? "dev"}
        </div>
      </header>

      {/* Body */}
      <div className="ad-body">
        {/* Roster */}
        <aside className="ad-roster">
          <div className="ad-panel-head">
            <div className="ad-panel-title">Players</div>
            <div className="ad-count-badge">{humanCount}</div>
          </div>
          <div className="ad-roster-list">
            {humans
              .sort((a, b) => (b.alive ? 1 : 0) - (a.alive ? 1 : 0) || b.score - a.score)
              .map(p => (
                <div
                  key={p.id}
                  className={`ad-player-row${p.id === selectedId ? " ad-player-row--selected" : ""}${!p.alive ? " ad-player-row--dead" : ""}`}
                  onClick={() => handleSelectPlayer(p.id === selectedId ? null : p.id)}
                >
                  <div className="ad-player-dot" style={{ background: p.color, boxShadow: `0 0 6px ${p.color}` }} />
                  <div className="ad-player-name">{p.name}</div>
                  {p.isDev && <div className="ad-dev-tag">DEV</div>}
                  <div className="ad-player-score">{Math.floor(p.score)}</div>
                </div>
              ))}
            {bots.length > 0 && (
              <>
                <div className="ad-bot-sep">Bots · {botCount}</div>
                {bots.slice(0, 8).map(p => (
                  <div key={p.id} className="ad-player-row ad-player-row--dead" style={{ opacity: 0.25 }}>
                    <div className="ad-player-dot" style={{ background: p.color }} />
                    <div className="ad-player-name" style={{ fontSize: 11 }}>{p.name}</div>
                    <div className="ad-player-score">{Math.floor(p.score)}</div>
                  </div>
                ))}
              </>
            )}
          </div>
        </aside>

        {/* Map */}
        <div className="ad-mapwrap">
          <AdminMap
            snapshot={snapshot}
            selectedId={selectedId}
            followMode={followMode}
            onSelectPlayer={handleSelectPlayer}
          />

          {/* Map controls */}
          <div className="ad-map-controls">
            <button
              className={`ad-map-btn${!selectedId || !followMode ? " ad-map-btn--active" : ""}`}
              type="button"
              onClick={() => { setFollowMode(false); setSelectedId(null); }}
            >Overview</button>
            <button
              className={`ad-map-btn${followMode ? " ad-map-btn--active" : ""}`}
              type="button"
              disabled={!selectedId}
              onClick={() => setFollowMode(f => !f)}
            >Follow</button>
          </div>

          {/* Broadcast bar */}
          <div className="ad-broadcast-bar">
            <input
              className="ad-broadcast-input"
              type="text"
              placeholder="Broadcast to all players..."
              value={broadcastText}
              maxLength={160}
              onChange={e => setBroadcastText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleBroadcast(); }}
            />
            <button
              className="ad-broadcast-btn"
              type="button"
              disabled={!broadcastText.trim()}
              onClick={handleBroadcast}
            >Send</button>
          </div>
        </div>

        {/* Detail panel */}
        <aside className={`ad-detail${selectedPlayer ? " ad-detail--open" : ""}`}>
          {selectedPlayer && (
            <div className="ad-detail-inner">
              <div className="ad-detail-top">
                <div className="ad-detail-name">{selectedPlayer.name}</div>
                <div className="ad-detail-badges">
                  <span className={`ad-badge ad-badge--${selectedPlayer.alive ? "alive" : "dead"}`}>
                    {selectedPlayer.alive ? "alive" : "dead"}
                  </span>
                  {selectedPlayer.boosting && <span className="ad-badge ad-badge--boosting">boosting</span>}
                  {selectedPlayer.isDev && <span className="ad-badge ad-badge--dev">dev</span>}
                  {selectedPlayer.partyId && <span className="ad-badge ad-badge--party">party</span>}
                </div>
              </div>

              <div className="ad-detail-stats">
                <div className="ad-stat-grid">
                  <div className="ad-stat-block">
                    <div className="ad-stat-block-label">Score</div>
                    <div className="ad-stat-block-val">{Math.floor(selectedPlayer.score)}</div>
                  </div>
                  <div className="ad-stat-block">
                    <div className="ad-stat-block-label">Kills</div>
                    <div className="ad-stat-block-val">{selectedPlayer.kills}</div>
                  </div>
                  <div className="ad-stat-block">
                    <div className="ad-stat-block-label">Length</div>
                    <div className="ad-stat-block-val">{selectedPlayer.segments.length}</div>
                  </div>
                  <div className="ad-stat-block">
                    <div className="ad-stat-block-label">Boost</div>
                    <div className="ad-stat-block-val">{Math.floor(selectedPlayer.boost)}%</div>
                  </div>
                </div>
              </div>

              <div className="ad-detail-uid">
                <div className="ad-uid-label">Player ID</div>
                <div className="ad-uid-val">{selectedPlayer.id}</div>
              </div>

              <div className="ad-minion-block">
                <div className="ad-minion-head">
                  <span className="ad-minion-title">Minion Subscription</span>
                  <span className="ad-minion-active">{activeMinions} active</span>
                </div>
                <div className="ad-minion-row">
                  <input
                    className="ad-minion-input"
                    type="number"
                    min={0}
                    max={500}
                    value={minionInput}
                    onChange={e => setMinionInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") handleSetMinions(); }}
                    placeholder="0"
                  />
                  <button className="ad-minion-btn" type="button" onClick={handleSetMinions}>Set</button>
                  <button
                    className="ad-minion-btn ad-minion-btn--clear"
                    type="button"
                    onClick={() => { setMinionInput("0"); setMinions(selectedPlayer.id, 0); }}
                  >Clear</button>
                </div>
                <div className="ad-minion-hint">Bots that walk to this player and feed themselves on contact (+30 score each). Refills continuously.</div>
              </div>

              <div className="ad-detail-actions">
                <button
                  type="button"
                  className={`ad-action-btn ad-action-btn--follow${followMode ? " active" : ""}`}
                  onClick={() => setFollowMode(f => !f)}
                >
                  {followMode ? "Following" : "Follow Player"}
                </button>
                <button type="button" className="ad-action-btn ad-action-btn--kick" onClick={handleKick}>
                  Kick Player
                </button>
                <button type="button" className="ad-action-btn ad-action-btn--ban" onClick={handleBan}>
                  Ban Player
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* Toast */}
      {toast && (
        <div key={toast.key} className="ad-toast ad-toast--show">{toast.msg}</div>
      )}
    </div>
  );
}

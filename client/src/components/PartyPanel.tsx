import { useState } from "react";
import { Copy, LogIn, LogOut, Shield, Users, X } from "lucide-react";
import type { PartyInvite, PartyState } from "../game/useGameClient";

type PartyPanelProps = {
  playerId?: string;
  party: PartyState | null;
  partyInvites: PartyInvite[];
  onCreateParty: () => void;
  onJoinParty: (code: string) => void;
  onLeaveParty: () => void;
  onKick: (targetId: string) => void;
  onAcceptInvite: (code: string) => void;
  onDismissInvite: (code: string) => void;
};

export function PartyPanel({
  playerId,
  party,
  partyInvites,
  onCreateParty,
  onJoinParty,
  onLeaveParty,
  onKick,
  onAcceptInvite,
  onDismissInvite
}: PartyPanelProps) {
  const [joinCode, setJoinCode] = useState("");
  const [showJoinInput, setShowJoinInput] = useState(false);
  const [copied, setCopied] = useState(false);

  const isLeader = party && playerId === party.members[0]?.id;

  const copyCode = () => {
    if (!party) return;
    void navigator.clipboard.writeText(party.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleJoin = () => {
    if (joinCode.trim().length >= 4) {
      onJoinParty(joinCode.trim());
      setJoinCode("");
      setShowJoinInput(false);
    }
  };

  return (
    <div className="wg-party-panel">
      {/* Pending invites */}
      {partyInvites.map((inv) => (
        <div className="wg-party-invite" key={inv.code}>
          <span className="wg-party-invite-dot" style={{ background: inv.fromColor }} />
          <span className="wg-party-invite-text">
            <strong>{inv.fromName}</strong> invited you
          </span>
          <button
            className="wg-party-invite-accept"
            type="button"
            onClick={() => { onAcceptInvite(inv.code); onDismissInvite(inv.code); }}
          >
            Join
          </button>
          <button
            className="wg-party-invite-dismiss"
            type="button"
            aria-label="Dismiss invite"
            onClick={() => onDismissInvite(inv.code)}
          >
            <X size={10} />
          </button>
        </div>
      ))}

      {/* Main panel */}
      <div className="wg-party-card">
        <div className="wg-party-header">
          <div className="wg-party-title">
            <Users size={12} />
            <span>Party</span>
          </div>
          {party ? (
            <div className="wg-party-code-row">
              <span className="wg-party-code">{party.code}</span>
              <button className="wg-party-icon-btn" type="button" onClick={copyCode} title="Copy code">
                <Copy size={10} />
                {copied ? <span className="wg-party-copied">Copied!</span> : null}
              </button>
              <button className="wg-party-icon-btn wg-party-leave-btn" type="button" onClick={onLeaveParty} title="Leave party">
                <LogOut size={10} />
              </button>
            </div>
          ) : null}
        </div>

        {party ? (
          <ol className="wg-party-members">
            {party.members.map((member, index) => (
              <li key={member.id} className={`wg-party-member${member.id === playerId ? " you" : ""}${!member.alive ? " dead" : ""}`}>
                <span className="wg-party-rank">{index + 1}.</span>
                <span className="wg-party-member-dot" style={{ background: member.color }} />
                <span className="wg-party-member-name">
                  {index === 0 ? <Shield size={9} className="wg-party-leader-icon" /> : null}
                  {member.name}
                </span>
                <span className="wg-party-member-score">{member.score.toLocaleString("en-US")}</span>
                {isLeader && member.id !== playerId ? (
                  <button
                    className="wg-party-kick-btn"
                    type="button"
                    title="Kick"
                    onClick={() => onKick(member.id)}
                  >
                    <X size={9} />
                  </button>
                ) : null}
              </li>
            ))}
          </ol>
        ) : (
          <div className="wg-party-empty">
            <p className="wg-party-empty-hint">Play together, pass through each other</p>
            <div className="wg-party-actions">
              <button className="wg-party-action-btn" type="button" onClick={onCreateParty}>
                <Shield size={11} />
                Create
              </button>
              <button
                className="wg-party-action-btn secondary"
                type="button"
                onClick={() => setShowJoinInput((v) => !v)}
              >
                <LogIn size={11} />
                Join
              </button>
            </div>
            {showJoinInput ? (
              <div className="wg-party-join-row">
                <input
                  className="wg-party-join-input"
                  type="text"
                  placeholder="XXXX"
                  value={joinCode}
                  maxLength={8}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                  autoFocus
                />
                <button className="wg-party-action-btn" type="button" onClick={handleJoin}>
                  Go
                </button>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

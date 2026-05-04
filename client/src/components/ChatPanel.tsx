import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import type { ChatMessage, ChatScope } from "../../../shared/types";

type ChatPanelProps = {
  messages: ChatMessage[];
  inParty: boolean;
  onSend: (text: string, scope: ChatScope) => void;
};

export function ChatPanel({ messages, inParty, onSend }: ChatPanelProps) {
  const [activeTab, setActiveTab] = useState<ChatScope>("global");
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  const filtered = messages.filter((m) => m.scope === activeTab);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [filtered.length]);

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text, activeTab);
    setDraft("");
  };

  const canSend = !(activeTab === "party" && !inParty);

  return (
    <div className="wg-chat-panel">
      <div className="wg-chat-tabs">
        <button
          className={`wg-chat-tab${activeTab === "global" ? " active" : ""}`}
          type="button"
          onClick={() => setActiveTab("global")}
        >
          Global
        </button>
        <button
          className={`wg-chat-tab${activeTab === "party" ? " active" : ""}${!inParty ? " disabled" : ""}`}
          type="button"
          disabled={!inParty}
          onClick={() => setActiveTab("party")}
        >
          Party
        </button>
      </div>

      <div className="wg-chat-messages" ref={listRef}>
        {filtered.length === 0 ? (
          <div className="wg-chat-empty">
            {activeTab === "party" && !inParty ? "Join a party to chat here" : "No messages yet"}
          </div>
        ) : (
          filtered.map((msg) => (
            <div className="wg-chat-msg" key={msg.id}>
              <span className="wg-chat-msg-dot" style={{ background: msg.color }} />
              <span className="wg-chat-msg-meta">
                {msg.isDev ? <span className="wg-chat-dev-tag">DEV</span> : null}
                <span className="wg-chat-msg-name" style={{ color: msg.color }}>{msg.name}</span>
              </span>
              <span className="wg-chat-msg-text">{msg.text}</span>
            </div>
          ))
        )}
      </div>

      <div className="wg-chat-input-row">
        <input
          className="wg-chat-input"
          type="text"
          placeholder={canSend ? "Message…" : "Join a party first…"}
          value={draft}
          maxLength={120}
          disabled={!canSend}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); handleSend(); }
          }}
        />
        <button
          className="wg-chat-send-btn"
          type="button"
          disabled={!draft.trim() || !canSend}
          onClick={handleSend}
        >
          <Send size={13} />
        </button>
      </div>
    </div>
  );
}

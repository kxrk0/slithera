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
  const inputRef = useRef<HTMLInputElement>(null);

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
        {(["global", "party"] as ChatScope[]).map((scope) => (
          <button
            key={scope}
            className={`wg-chat-tab${activeTab === scope ? " active" : ""}${scope === "party" && !inParty ? " disabled" : ""}`}
            type="button"
            disabled={scope === "party" && !inParty}
            onClick={() => setActiveTab(scope)}
          >
            {scope === "global" ? "GLOBAL" : "PARTY"}
          </button>
        ))}
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
              <span className="wg-chat-msg-name" style={{ color: msg.color }}>{msg.name}</span>
              <span className="wg-chat-msg-text">{msg.text}</span>
            </div>
          ))
        )}
      </div>

      <div className="wg-chat-input-row">
        <input
          ref={inputRef}
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
          <Send size={12} />
        </button>
      </div>
    </div>
  );
}

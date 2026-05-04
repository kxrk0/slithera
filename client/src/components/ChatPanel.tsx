import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import type { ChatMessage, ChatScope } from "../../../shared/types";

type ChatPanelProps = {
  messages: ChatMessage[];
  inParty: boolean;
  onSend: (text: string, scope: ChatScope) => void;
};

const SCOPE_LABELS: Record<ChatScope, string> = {
  global: "GLOBAL",
  party: "PARTY"
};

export function ChatPanel({ messages, inParty, onSend }: ChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<ChatScope>("global");
  const [draft, setDraft] = useState("");
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = messages.filter((m) => m.scope === activeTab);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [filtered.length, open]);

  // Focus input when panel opens
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Keyboard shortcut: Enter to open/focus chat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Enter" && !open && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const unreadGlobal = messages.filter((m) => m.scope === "global").length;
  const unreadParty = messages.filter((m) => m.scope === "party").length;

  const handleSend = () => {
    const text = draft.trim();
    if (!text) return;
    onSend(text, activeTab);
    setDraft("");
  };

  return (
    <div className={`wg-chat-panel${open ? " open" : ""}`}>
      {/* Toggle button */}
      <button
        className="wg-chat-toggle"
        type="button"
        aria-label={open ? "Close chat" : "Open chat"}
        onClick={() => setOpen((v) => !v)}
      >
        <MessageSquare size={13} />
        {!open && (unreadGlobal > 0 || unreadParty > 0) ? (
          <span className="wg-chat-badge" />
        ) : null}
      </button>

      {open ? (
        <div className="wg-chat-body">
          {/* Tab bar */}
          <div className="wg-chat-tabs">
            {(["global", "party"] as ChatScope[]).map((scope) => (
              <button
                key={scope}
                className={`wg-chat-tab${activeTab === scope ? " active" : ""}${scope === "party" && !inParty ? " disabled" : ""}`}
                type="button"
                disabled={scope === "party" && !inParty}
                onClick={() => setActiveTab(scope)}
              >
                {SCOPE_LABELS[scope]}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="wg-chat-messages" ref={listRef}>
            {filtered.length === 0 ? (
              <div className="wg-chat-empty">
                {activeTab === "party" && !inParty
                  ? "Join a party to chat here"
                  : "No messages yet"}
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

          {/* Input row */}
          <div className="wg-chat-input-row">
            <input
              ref={inputRef}
              className="wg-chat-input"
              type="text"
              placeholder={activeTab === "party" && !inParty ? "Join a party first…" : "Message…"}
              value={draft}
              maxLength={120}
              disabled={activeTab === "party" && !inParty}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.preventDefault(); handleSend(); }
                if (e.key === "Escape") setOpen(false);
              }}
            />
            <button
              className="wg-chat-send-btn"
              type="button"
              disabled={!draft.trim() || (activeTab === "party" && !inParty)}
              onClick={handleSend}
            >
              <Send size={12} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

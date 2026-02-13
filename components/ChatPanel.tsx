"use client";
import { useState, useRef, useEffect } from "react";
import type { ChatMsg } from "@/hooks/useWebSocket";

interface Props {
  messages: ChatMsg[];
  onSend: (text: string) => void;
}

const PREFIX: Record<string, string> = {
  user: "YOU",
  assistant: "AETERNUM",
  system: "SYSTEM",
};

export default function ChatPanel({ messages, onSend }: Props) {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const hasStreaming = messages.some((m) => m.streaming);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function submit() {
    const text = input.trim();
    if (!text) return;
    onSend(text);
    setInput("");
  }

  return (
    <div className="chat-section">
      <div className="chat-messages">
        {messages.map((m) => (
          <div key={m.id} className={`message ${m.role}-message${m.streaming ? " streaming" : ""}`}>
            <span className="msg-prefix">{PREFIX[m.role] || "SYSTEM"}</span>
            <span className="msg-text">{m.text}</span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {hasStreaming && (
        <div className="streaming-indicator">
          <div className="typing-dots">
            <span /><span /><span />
          </div>
        </div>
      )}

      <div className="chat-input-container">
        <input
          type="text"
          className="chat-input"
          placeholder="Enter command..."
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
        />
        <button className="send-btn" title="Send" onClick={submit}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

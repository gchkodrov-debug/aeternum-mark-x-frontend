"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/hooks/useWebSocket";
import type { MicState } from "@/hooks/useMicrophone";
import StatusLine from "./StatusLine";
import CommandInput from "./CommandInput";

interface ChatPanelProps {
  messages: ChatMessage[];
  streamingText: string;
  isStreaming: boolean;
  onSend: (text: string) => void;
  onMicToggle?: () => void;
  micActive?: boolean;
  micState?: MicState;
}

const ROLE_PREFIX: Record<string, string> = {
  user: "YOU",
  assistant: "AETERNUM",
  system: "SYSTEM",
};

export default function ChatPanel({
  messages,
  streamingText,
  isStreaming,
  onSend,
  onMicToggle,
  micActive,
  micState,
}: ChatPanelProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  return (
    <div className="chat-section">
      <div className="chat-messages">
        {messages.map((msg) => (
          <div className={`message ${msg.role}-message`} key={msg.id}>
            <span className="msg-prefix">{ROLE_PREFIX[msg.role] || "SYSTEM"}</span>
            <span className="msg-text">{msg.text}</span>
          </div>
        ))}

        {/* Streaming message */}
        {isStreaming && streamingText && (
          <div className="message assistant-message">
            <span className="msg-prefix">AETERNUM</span>
            <span className="msg-text">{streamingText}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <StatusLine isStreaming={isStreaming} />

      <CommandInput
        onSend={onSend}
        onMicToggle={onMicToggle}
        micActive={micActive}
        micState={micState}
      />
    </div>
  );
}

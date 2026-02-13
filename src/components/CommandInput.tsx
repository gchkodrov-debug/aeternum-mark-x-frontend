"use client";

import { useState, useCallback, type KeyboardEvent } from "react";
import { sanitizeInput } from "@/utils/sanitize";

interface CommandInputProps {
  onSend: (text: string) => void;
  onMicToggle?: () => void;
  micActive?: boolean;
}

export default function CommandInput({
  onSend,
  onMicToggle,
  micActive = false,
}: CommandInputProps) {
  const [value, setValue] = useState("");

  const handleSend = useCallback(() => {
    const sanitized = sanitizeInput(value);
    if (sanitized) {
      onSend(sanitized);
      setValue("");
    }
  }, [value, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <div className="chat-input-container">
      <input
        type="text"
        className="chat-input"
        placeholder="Enter command..."
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        maxLength={5000}
      />
      <button
        className="send-btn"
        title="Send"
        onClick={handleSend}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
      </button>
      <button
        className={`mic-btn${micActive ? " active" : ""}`}
        title="Push to Talk"
        onClick={onMicToggle}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
          <line x1="12" y1="19" x2="12" y2="23" />
          <line x1="8" y1="23" x2="16" y2="23" />
        </svg>
      </button>
    </div>
  );
}

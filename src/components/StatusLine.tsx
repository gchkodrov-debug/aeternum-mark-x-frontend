"use client";

interface StatusLineProps {
  isStreaming: boolean;
}

/**
 * Streaming indicator - shows typing dots when assistant is generating a response.
 */
export default function StatusLine({ isStreaming }: StatusLineProps) {
  if (!isStreaming) return null;

  return (
    <div className="streaming-indicator">
      <div className="typing-dots">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

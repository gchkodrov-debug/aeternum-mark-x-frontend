"use client";
import type { AvatarState } from "@/hooks/useWebSocket";

interface AvatarProps {
  state: AvatarState;
}

const LABELS: Record<AvatarState, string> = {
  idle: "AETERNUM MARK X",
  listening: "◉ LISTENING...",
  thinking: "◈ PROCESSING...",
  speaking: "◆ SPEAKING...",
};

export default function Avatar({ state }: AvatarProps) {
  return (
    <div className="avatar-section">
      <div className={`avatar-container ${state}`}>
        <div className="avatar-ring ring-outer" />
        <div className="avatar-ring ring-middle" />
        <div className="avatar-ring ring-inner" />
        <div className="avatar-core">
          <div className="core-glow" />
          <span className="core-text">{state.toUpperCase()}</span>
        </div>
      </div>
      <div className="avatar-label">{LABELS[state]}</div>
    </div>
  );
}

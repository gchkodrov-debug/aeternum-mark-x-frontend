"use client";

import type { AvatarState } from "@/hooks/useWebSocket";

interface CenterRingProps {
  avatarState: AvatarState;
}

const AVATAR_LABELS: Record<AvatarState, string> = {
  idle: "AETERNUM MARK X",
  listening: "◉ LISTENING...",
  thinking: "◈ PROCESSING...",
  speaking: "◆ SPEAKING...",
};

export default function CenterRing({ avatarState }: CenterRingProps) {
  return (
    <div className="avatar-section">
      <div className={`avatar-container ${avatarState}`}>
        <div className="avatar-ring ring-outer" />
        <div className="avatar-ring ring-middle" />
        <div className="avatar-ring ring-inner" />
        <div className="avatar-core">
          <div className="core-glow" />
          <span className="core-text">{avatarState.toUpperCase()}</span>
        </div>
      </div>
      <div className="avatar-label">
        {AVATAR_LABELS[avatarState] || "AETERNUM MARK X"}
      </div>
    </div>
  );
}

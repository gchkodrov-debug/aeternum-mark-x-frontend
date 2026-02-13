"use client";

import type { AvatarState } from "@/hooks/useWebSocket";
import CenterRing from "./CenterRing";

interface AvatarProps {
  avatarState: AvatarState;
}

/**
 * Avatar wrapper component.
 * Renders the animated ring avatar with state-dependent visuals.
 */
export default function Avatar({ avatarState }: AvatarProps) {
  return <CenterRing avatarState={avatarState} />;
}

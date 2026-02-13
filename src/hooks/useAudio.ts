"use client";

import { useEffect, useRef, useCallback } from "react";

/**
 * Hook to handle TTS audio playback from base64-encoded data.
 * Listens for custom "aeternum-audio" events dispatched by the WebSocket hook.
 */
export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUnlockedRef = useRef(false);

  // Unlock audio on first user interaction (browser autoplay policy)
  const unlockAudio = useCallback(() => {
    if (audioUnlockedRef.current) return;
    try {
      const ctx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext)();
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start();
      audioUnlockedRef.current = true;
    } catch {
      // Silently fail - audio will work after next interaction
    }
  }, []);

  const playAudio = useCallback((base64Data: string, format: string) => {
    try {
      const binaryString = atob(base64Data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: `audio/${format || "wav"}` });
      const url = URL.createObjectURL(blob);

      if (!audioRef.current) {
        audioRef.current = new Audio();
      }

      const audio = audioRef.current;
      audio.src = url;
      audio.play().catch((e) => {
        console.log("Audio autoplay blocked:", e.message);
      });

      audio.onended = () => {
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.error("Audio playback error:", e);
    }
  }, []);

  useEffect(() => {
    // Listen for audio events from WebSocket hook
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.data) {
        playAudio(detail.data, detail.format);
      }
    };

    window.addEventListener("aeternum-audio", handler);

    // Unlock audio on first click
    document.addEventListener("click", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("aeternum-audio", handler);
      document.removeEventListener("click", unlockAudio);
    };
  }, [playAudio, unlockAudio]);

  return { playAudio };
}

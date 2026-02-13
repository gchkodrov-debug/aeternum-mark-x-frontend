"use client";
import { useEffect, useRef } from "react";

export function useAudio() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);

  // Unlock audio on first click
  useEffect(() => {
    function unlock() {
      if (unlockedRef.current) return;
      unlockedRef.current = true;
      try {
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start();
      } catch { /* ignore */ }
    }
    document.addEventListener("click", unlock, { once: true });
    return () => document.removeEventListener("click", unlock);
  }, []);

  // Listen for audio events from WebSocket hook
  useEffect(() => {
    function onAudio(e: Event) {
      const { data, format } = (e as CustomEvent).detail;
      try {
        const bin = atob(data);
        const bytes = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
        const blob = new Blob([bytes], { type: `audio/${format || "wav"}` });
        const url = URL.createObjectURL(blob);

        if (!audioRef.current) {
          audioRef.current = new Audio();
        }
        const audio = audioRef.current;
        audio.src = url;
        audio.play().catch(() => {});
        audio.onended = () => URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Audio playback error:", err);
      }
    }
    window.addEventListener("aeternum-audio", onAudio);
    return () => window.removeEventListener("aeternum-audio", onAudio);
  }, []);
}

"use client";

import { useState, useRef, useCallback, useEffect } from "react";

export type MicState = "idle" | "recording" | "processing";

interface VoiceResponse {
  text: string;
  audio?: string;
  format?: string;
}

interface UseMicrophoneReturn {
  micState: MicState;
  startRecording: () => void;
  stopRecording: () => void;
  transcript: string;
  isSupported: boolean;
}

function getVoiceWsUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
  const wsBase = base.replace(/^http/, "ws");
  return `${wsBase}/ws/aeternum/voice`;
}

export function useMicrophone(): UseMicrophoneReturn {
  const [micState, setMicState] = useState<MicState>("idle");
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const mountedRef = useRef(true);

  // Check browser support on mount
  useEffect(() => {
    mountedRef.current = true;
    const supported =
      typeof navigator !== "undefined" &&
      typeof navigator.mediaDevices !== "undefined" &&
      typeof navigator.mediaDevices.getUserMedia === "function" &&
      typeof MediaRecorder !== "undefined";
    setIsSupported(supported);
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const connectVoiceWs = useCallback((): WebSocket | null => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      return wsRef.current;
    }
    try {
      const ws = new WebSocket(getVoiceWsUrl());
      ws.binaryType = "arraybuffer";

      ws.onmessage = (event) => {
        try {
          const data: VoiceResponse = JSON.parse(event.data as string);
          if (mountedRef.current) {
            if (data.text) setTranscript(data.text);
            setMicState("idle");
            // Play TTS audio if provided
            if (data.audio) {
              window.dispatchEvent(
                new CustomEvent("aeternum-audio", {
                  detail: { data: data.audio, format: data.format || "wav" },
                })
              );
            }
          }
        } catch (err) {
          console.error("Voice WS parse error:", err);
          if (mountedRef.current) setMicState("idle");
        }
      };

      ws.onerror = () => {
        console.error("Voice WebSocket error");
        if (mountedRef.current) setMicState("idle");
      };

      ws.onclose = () => {
        wsRef.current = null;
      };

      wsRef.current = ws;
      return ws;
    } catch (err) {
      console.error("Voice WS connection failed:", err);
      return null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    if (!isSupported || micState !== "idle") return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 16000 },
      });
      streamRef.current = stream;

      const ws = connectVoiceWs();

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0 && ws && ws.readyState === WebSocket.OPEN) {
          ws.send(event.data);
        }
      };

      recorder.onstop = () => {
        if (mountedRef.current) setMicState("processing");
      };

      recorder.start(250); // Send chunks every 250ms
      setMicState("recording");
    } catch (err) {
      console.error("Microphone access denied:", err);
      setMicState("idle");
    }
  }, [isSupported, micState, connectVoiceWs]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRecording();
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [stopRecording]);

  return { micState, startRecording, stopRecording, transcript, isSupported };
}

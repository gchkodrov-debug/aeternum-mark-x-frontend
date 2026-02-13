"use client";

import { useEffect, useRef, useCallback, useState } from "react";

export type AvatarState = "idle" | "listening" | "thinking" | "speaking";

export interface SystemStatus {
  llm?: string | boolean;
  stt?: string | boolean;
  tts?: string | boolean;
  memory?: string | boolean;
  backend?: string | boolean;
  rag?: string | boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  text: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  message: string;
  level: "info" | "success" | "warning" | "error";
  time: string;
}

export interface ActionLogEntry {
  id: string;
  action: string;
  result: string;
  success: boolean;
  time: string;
}

interface WSMessage {
  type: string;
  [key: string]: unknown;
}

const MAX_MESSAGES = 200;
const MAX_NOTIFICATIONS = 30;
const MAX_LOG_ENTRIES = 50;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const reconnectAttemptRef = useRef(0);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const lastPingRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  const [connected, setConnected] = useState(false);
  const [connectionLabel, setConnectionLabel] = useState("CONNECTING");
  const [latency, setLatency] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({});
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "init-0",
      role: "system",
      text: "AETERNUM MARK X online. All systems nominal.",
      timestamp: Date.now(),
    },
  ]);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "notif-init",
      message: "Awaiting connection...",
      level: "info",
      time: "--:--",
    },
  ]);
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([
    {
      id: "log-init",
      action: "init",
      result: "System initialized...",
      success: true,
      time: "--:--:--",
    },
  ]);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  const getTimeStr = useCallback(() => {
    return new Date().toLocaleTimeString("en-US", { hour12: false });
  }, []);

  const addNotification = useCallback(
    (message: string, level: Notification["level"] = "info") => {
      setNotifications((prev) => {
        const next = [
          {
            id: `notif-${Date.now()}-${Math.random()}`,
            message,
            level,
            time: new Date().toLocaleTimeString("en-US", { hour12: false }),
          },
          ...prev,
        ];
        return next.slice(0, MAX_NOTIFICATIONS);
      });
    },
    []
  );

  const addMessage = useCallback(
    (role: ChatMessage["role"], text: string) => {
      setMessages((prev) => {
        const next = [
          ...prev,
          {
            id: `msg-${Date.now()}-${Math.random()}`,
            role,
            text,
            timestamp: Date.now(),
          },
        ];
        return next.slice(-MAX_MESSAGES);
      });
    },
    []
  );

  const addLogEntry = useCallback(
    (action: string, result: string, success: boolean) => {
      setActionLog((prev) => {
        const truncResult =
          result.length > 80 ? result.substring(0, 80) + "..." : result;
        const next = [
          {
            id: `log-${Date.now()}-${Math.random()}`,
            action,
            result: truncResult,
            success,
            time: new Date().toLocaleTimeString("en-US", { hour12: false }),
          },
          ...prev,
        ];
        return next.slice(0, MAX_LOG_ENTRIES);
      });
    },
    []
  );

  const handleMessage = useCallback(
    (data: WSMessage) => {
      switch (data.type) {
        case "init":
          setAvatarState((data.avatar_state as AvatarState) || "idle");
          break;

        case "message": {
          const role = data.role as string;
          const text = data.text as string;
          if (role === "assistant") {
            // Finalize any streaming
            setIsStreaming(false);
            setStreamingText("");
            addMessage("assistant", text);
          } else if (role !== "user") {
            addMessage("system", text);
          }
          break;
        }

        case "text_chunk":
          setIsStreaming(true);
          setStreamingText((prev) => prev + (data.chunk as string));
          break;

        case "audio":
          // Dispatch custom event for audio hook
          window.dispatchEvent(
            new CustomEvent("aeternum-audio", {
              detail: {
                data: data.data as string,
                format: (data.format as string) || "wav",
              },
            })
          );
          break;

        case "avatar_state":
          setAvatarState((data.state as AvatarState) || "idle");
          break;

        case "action_result":
          addLogEntry(
            data.action as string,
            data.result as string,
            data.success as boolean
          );
          break;

        case "system_status":
          setSystemStatus((data.status as SystemStatus) || {});
          break;

        case "notification":
          addNotification(
            data.message as string,
            (data.level as Notification["level"]) || "info"
          );
          break;

        case "pong":
          setLatency(Date.now() - lastPingRef.current);
          break;

        case "status":
          setClientCount((data.clients as number) || 0);
          break;

        default:
          console.log("Unknown message type:", data.type, data);
      }
    },
    [addMessage, addNotification, addLogEntry]
  );

  const connect = useCallback(() => {
    const wsUrl =
      process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8765";

    if (
      wsRef.current &&
      (wsRef.current.readyState === WebSocket.OPEN ||
        wsRef.current.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        setConnectionLabel("ONLINE");
        reconnectAttemptRef.current = 0;
        addNotification("Connected to AETERNUM MARK X", "success");

        // Start ping interval
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            lastPingRef.current = Date.now();
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 10000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleMessage(data);
        } catch (e) {
          console.error("Failed to parse message:", e);
        }
      };

      ws.onclose = () => {
        setConnected(false);
        setConnectionLabel("OFFLINE");
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

        // Exponential backoff reconnect
        const attempt = reconnectAttemptRef.current;
        const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
        reconnectAttemptRef.current = attempt + 1;

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };

      ws.onerror = () => {
        setConnectionLabel("ERROR");
      };
    } catch (e) {
      console.error("WebSocket connection error:", e);
      setConnectionLabel("ERROR");
    }
  }, [handleMessage, addNotification]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        addNotification("Not connected to server", "error");
        return;
      }

      wsRef.current.send(
        JSON.stringify({ type: "user_message", text })
      );
      addMessage("user", text);
    },
    [addMessage, addNotification]
  );

  const sendQuickAction = useCallback(
    (command: string) => {
      sendMessage(command);
    },
    [sendMessage]
  );

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current)
        clearTimeout(reconnectTimeoutRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  const getUptime = useCallback(() => {
    const ms = Date.now() - startTimeRef.current;
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }, []);

  return {
    connected,
    connectionLabel,
    latency,
    clientCount,
    avatarState,
    systemStatus,
    messages,
    notifications,
    actionLog,
    streamingText,
    isStreaming,
    sendMessage,
    sendQuickAction,
    getUptime,
    getTimeStr,
    wsUrl: process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8765",
  };
}

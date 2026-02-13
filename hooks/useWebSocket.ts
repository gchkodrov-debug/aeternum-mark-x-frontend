"use client";
import { useEffect, useRef, useCallback, useState } from "react";

export type MessageRole = "user" | "assistant" | "system";
export type AvatarState = "idle" | "listening" | "thinking" | "speaking";
export type NotifLevel = "info" | "success" | "warning" | "error";

export interface ChatMsg {
  id: string;
  role: MessageRole;
  text: string;
  streaming?: boolean;
}

export interface ActionLogEntry {
  time: string;
  action: string;
  result: string;
  success: boolean;
}

export interface Notification {
  id: string;
  time: string;
  message: string;
  level: NotifLevel;
}

export interface SystemStatusData {
  llm?: string | boolean;
  stt?: string | boolean;
  tts?: string | boolean;
  memory?: string | boolean;
  backend?: string | boolean;
  rag?: string | boolean;
  [key: string]: unknown;
}

interface UseWebSocketReturn {
  connected: boolean;
  messages: ChatMsg[];
  avatarState: AvatarState;
  systemStatus: SystemStatusData;
  actionLog: ActionLogEntry[];
  notifications: Notification[];
  latency: number;
  clientCount: number;
  sendMessage: (text: string) => void;
}

let msgCounter = 0;
function uid(): string {
  return `msg-${Date.now()}-${++msgCounter}`;
}

function timeStr(): string {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

export function useWebSocket(): UseWebSocketReturn {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { id: uid(), role: "system", text: "AETERNUM MARK X online. All systems nominal." },
  ]);
  const [avatarState, setAvatarState] = useState<AvatarState>("idle");
  const [systemStatus, setSystemStatus] = useState<SystemStatusData>({});
  const [actionLog, setActionLog] = useState<ActionLogEntry[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([
    { id: uid(), time: "--:--", message: "Awaiting connection...", level: "info" },
  ]);
  const [latency, setLatency] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const pingTimeRef = useRef(0);
  const streamRef = useRef<{ id: string; text: string } | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addNotification = useCallback((message: string, level: NotifLevel) => {
    setNotifications((prev) => [
      { id: uid(), time: timeStr(), message, level },
      ...prev.slice(0, 29),
    ]);
  }, []);

  const handleMessage = useCallback(
    (data: Record<string, unknown>) => {
      switch (data.type) {
        case "init":
          setAvatarState((data.avatar_state as AvatarState) || "idle");
          break;

        case "message": {
          const role = data.role as MessageRole;
          if (role === "assistant") {
            // Finalize any streaming
            if (streamRef.current) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === streamRef.current!.id ? { ...m, streaming: false } : m
                )
              );
              streamRef.current = null;
            }
            setMessages((prev) => [
              ...prev.filter((m) => !m.streaming),
              { id: uid(), role: "assistant", text: data.text as string },
            ]);
          } else if (role !== "user") {
            setMessages((prev) => [
              ...prev,
              { id: uid(), role: "system", text: data.text as string },
            ]);
          }
          break;
        }

        case "text_chunk": {
          const chunk = data.chunk as string;
          if (!streamRef.current) {
            const id = uid();
            streamRef.current = { id, text: chunk };
            setMessages((prev) => [
              ...prev,
              { id, role: "assistant", text: chunk, streaming: true },
            ]);
          } else {
            streamRef.current.text += chunk;
            const newText = streamRef.current.text;
            const sid = streamRef.current.id;
            setMessages((prev) =>
              prev.map((m) => (m.id === sid ? { ...m, text: newText } : m))
            );
          }
          break;
        }

        case "audio":
          // Dispatch custom event for audio hook
          window.dispatchEvent(
            new CustomEvent("aeternum-audio", {
              detail: { data: data.data, format: data.format },
            })
          );
          break;

        case "avatar_state":
          setAvatarState(data.state as AvatarState);
          break;

        case "action_result":
          setActionLog((prev) => [
            {
              time: timeStr(),
              action: data.action as string,
              result: data.result as string,
              success: data.success as boolean,
            },
            ...prev.slice(0, 49),
          ]);
          break;

        case "system_status":
          setSystemStatus(data.status as SystemStatusData);
          break;

        case "notification":
          addNotification(data.message as string, (data.level as NotifLevel) || "info");
          break;

        case "pong":
          setLatency(Date.now() - pingTimeRef.current);
          break;

        case "status":
          setClientCount((data.clients as number) || 0);
          break;

        default:
          console.log("Unknown message type:", data.type, data);
      }
    },
    [addNotification]
  );

  // Connect
  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8765";

    function connect() {
      if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) return;

      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setConnected(true);
        addNotification("Connected to AETERNUM MARK X", "success");
        pingIntervalRef.current = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) {
            pingTimeRef.current = Date.now();
            socket.send(JSON.stringify({ type: "ping" }));
          }
        }, 10000);
      };

      socket.onmessage = (event) => {
        try {
          handleMessage(JSON.parse(event.data));
        } catch (e) {
          console.error("Failed to parse message:", e);
        }
      };

      socket.onclose = () => {
        setConnected(false);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        reconnectRef.current = setTimeout(connect, 3000);
      };

      socket.onerror = () => {
        setConnected(false);
      };
    }

    connect();

    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [handleMessage, addNotification]);

  const sendMessage = useCallback(
    (text: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        addNotification("Not connected to server", "error");
        return;
      }
      wsRef.current.send(JSON.stringify({ type: "text_input", text }));
      setMessages((prev) => [...prev, { id: uid(), role: "user", text }]);
    },
    [addNotification]
  );

  return {
    connected,
    messages,
    avatarState,
    systemStatus,
    actionLog,
    notifications,
    latency,
    clientCount,
    sendMessage,
  };
}

"use client";

import type { SystemStatus, ActionLogEntry } from "@/hooks/useWebSocket";

interface SideHudLeftProps {
  systemStatus: SystemStatus;
  actionLog: ActionLogEntry[];
}

function statusValueClass(value: string | boolean | undefined): string {
  if (value === undefined) return "";
  if (value === true || value === "online" || value === "ok") return "online";
  if (value === false || value === "offline" || value === "error") return "offline";
  return "";
}

function formatValue(value: string | boolean | undefined): string {
  if (value === undefined) return "--";
  if (typeof value === "boolean") return value ? "ONLINE" : "OFFLINE";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

const STATUS_FIELDS: { key: keyof SystemStatus; label: string }[] = [
  { key: "llm", label: "LLM" },
  { key: "stt", label: "STT" },
  { key: "tts", label: "TTS" },
  { key: "memory", label: "MEMORY" },
  { key: "backend", label: "BACKEND" },
  { key: "rag", label: "RAG" },
];

export default function SideHudLeft({ systemStatus, actionLog }: SideHudLeftProps) {
  return (
    <aside className="panel left-panel">
      <div className="panel-header">
        <span className="panel-icon">◈</span> SYSTEM STATUS
      </div>
      <div className="panel-body">
        {STATUS_FIELDS.map(({ key, label }) => (
          <div className="status-row" key={key}>
            <span className="status-label-text">{label}</span>
            <span className={`status-value ${statusValueClass(systemStatus[key])}`}>
              {formatValue(systemStatus[key])}
            </span>
          </div>
        ))}
      </div>

      <div className="panel-header" style={{ marginTop: 16 }}>
        <span className="panel-icon">◈</span> ACTIONS LOG
      </div>
      <div className="panel-body action-log">
        {actionLog.map((entry) => (
          <div
            className={`log-entry ${entry.success ? "success" : "error"}`}
            key={entry.id}
          >
            [{entry.time}] {entry.action}: {entry.result}
          </div>
        ))}
      </div>
    </aside>
  );
}

"use client";
import type { SystemStatusData, ActionLogEntry } from "@/hooks/useWebSocket";

interface Props {
  status: SystemStatusData;
  actionLog: ActionLogEntry[];
}

const FIELDS = ["llm", "stt", "tts", "memory", "backend", "rag"] as const;

function statusClass(v: unknown): string {
  if (v === true || v === "online" || v === "ok") return "online";
  if (v === false || v === "offline" || v === "error") return "offline";
  return "";
}

function display(v: unknown): string {
  if (v === undefined || v === null) return "--";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export default function SystemStatus({ status, actionLog }: Props) {
  return (
    <aside className="panel left-panel">
      <div className="panel-header">
        <span className="panel-icon">{"◈"}</span> SYSTEM STATUS
      </div>
      <div className="panel-body">
        {FIELDS.map((f) => (
          <div className="status-row" key={f}>
            <span className="status-label">{f.toUpperCase()}</span>
            <span className={`status-value ${statusClass(status[f])}`}>
              {display(status[f])}
            </span>
          </div>
        ))}
      </div>

      <div className="panel-header" style={{ marginTop: 16 }}>
        <span className="panel-icon">{"◈"}</span> ACTIONS LOG
      </div>
      <div className="panel-body action-log">
        {actionLog.length === 0 ? (
          <div className="log-entry">System initialized...</div>
        ) : (
          actionLog.map((e) => (
            <div className={`log-entry ${e.success ? "success" : "error"}`} key={e.time + e.action}>
              [{e.time}] {e.action}: {e.result.length > 80 ? e.result.slice(0, 80) + "..." : e.result}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}

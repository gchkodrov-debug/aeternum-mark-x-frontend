"use client";

import type { SystemStatus, ActionLogEntry } from "@/hooks/useWebSocket";
import type { AgentState } from "@/hooks/useAgents";

interface SideHudLeftProps {
  systemStatus: SystemStatus;
  actionLog: ActionLogEntry[];
  agents?: AgentState[];
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

const AGENT_STATUS_CLASS: Record<AgentState["status"], string> = {
  active: "agent-active",
  idle: "agent-idle",
  error: "agent-error",
  disabled: "agent-disabled",
};

export default function SideHudLeft({ systemStatus, actionLog, agents }: SideHudLeftProps) {
  const topAgents = agents ? agents.slice(0, 5) : [];

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

      {topAgents.length > 0 && (
        <>
          <div className="panel-header" style={{ marginTop: 16 }}>
            <span className="panel-icon">◈</span> AGENT CORE
          </div>
          <div className="panel-body agent-core-section">
            {topAgents.map((agent) => (
              <div className="status-row" key={agent.name}>
                <span className="status-label-text">
                  {agent.name.toUpperCase()}
                </span>
                <span className={`agent-core-value ${AGENT_STATUS_CLASS[agent.status]}`}>
                  <span className={`status-dot-inline ${agent.status}`} />
                  {Math.round(agent.confidence * 100)}%
                </span>
              </div>
            ))}
          </div>
        </>
      )}

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

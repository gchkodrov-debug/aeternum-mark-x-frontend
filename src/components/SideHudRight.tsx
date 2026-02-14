"use client";

import type { Notification } from "@/hooks/useWebSocket";
import { escapeHtml } from "@/utils/sanitize";

interface SideHudRightProps {
  notifications: Notification[];
  onQuickAction: (command: string) => void;
  onAgentAnalyze?: (name: string) => void;
}

const QUICK_ACTIONS = [
  { label: "System Status", command: "system status" },
  { label: "Health Check", command: "health check" },
  { label: "Oracle Signals", command: "oracle signals" },
  { label: "Market Regime", command: "market regime" },
  { label: "Dashboard", command: "open dashboard" },
];

const DANGER_ACTIONS = [
  { label: "Run Backtest", command: "run backtest" },
];

interface AgentAction {
  label: string;
  agent: string;
}

const AGENT_ACTIONS: AgentAction[] = [
  { label: "Oracle Analysis", agent: "oracle" },
  { label: "Risk Check", agent: "risk" },
  { label: "Regime Scan", agent: "regime" },
];

export default function SideHudRight({
  notifications,
  onQuickAction,
  onAgentAnalyze,
}: SideHudRightProps) {
  const handleAllAgents = () => {
    if (!onAgentAnalyze) return;
    AGENT_ACTIONS.forEach(({ agent }) => onAgentAnalyze(agent));
  };

  return (
    <aside className="panel right-panel">
      <div className="panel-header">
        <span className="panel-icon">◈</span> NOTIFICATIONS
      </div>
      <div className="panel-body notifications">
        {notifications.map((notif) => (
          <div className={`notification ${notif.level}`} key={notif.id}>
            <span className="notif-time">{notif.time}</span>
            <span className="notif-text">{escapeHtml(notif.message)}</span>
          </div>
        ))}
      </div>

      <div className="panel-header" style={{ marginTop: 16 }}>
        <span className="panel-icon">◈</span> QUICK ACTIONS
      </div>
      <div className="panel-body quick-actions">
        {QUICK_ACTIONS.map(({ label, command }) => (
          <button
            className="action-btn"
            key={command}
            onClick={() => onQuickAction(command)}
          >
            {label}
          </button>
        ))}
        {DANGER_ACTIONS.map(({ label, command }) => (
          <button
            className="action-btn danger"
            key={command}
            onClick={() => onQuickAction(command)}
          >
            {label}
          </button>
        ))}
      </div>

      {onAgentAnalyze && (
        <>
          <div className="panel-header" style={{ marginTop: 16 }}>
            <span className="panel-icon">◈</span> AGENT ACTIONS
          </div>
          <div className="panel-body quick-actions">
            {AGENT_ACTIONS.map(({ label, agent }) => (
              <button
                className="action-btn agent-action-btn"
                key={agent}
                onClick={() => onAgentAnalyze(agent)}
              >
                {label}
              </button>
            ))}
            <button
              className="action-btn danger"
              onClick={handleAllAgents}
            >
              Full Consensus
            </button>
          </div>
        </>
      )}
    </aside>
  );
}

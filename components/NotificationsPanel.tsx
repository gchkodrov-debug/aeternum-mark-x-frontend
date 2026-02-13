"use client";
import type { Notification } from "@/hooks/useWebSocket";

interface Props {
  notifications: Notification[];
  onQuickAction: (cmd: string) => void;
}

const QUICK_ACTIONS = [
  { label: "System Status", cmd: "system status" },
  { label: "Health Check", cmd: "health check" },
  { label: "Oracle Signals", cmd: "oracle signals" },
  { label: "Market Regime", cmd: "market regime" },
  { label: "Dashboard", cmd: "open dashboard" },
];

export default function NotificationsPanel({ notifications, onQuickAction }: Props) {
  return (
    <aside className="panel right-panel">
      <div className="panel-header">
        <span className="panel-icon">{"◈"}</span> NOTIFICATIONS
      </div>
      <div className="panel-body notifications">
        {notifications.map((n) => (
          <div className={`notification ${n.level}`} key={n.id}>
            <span className="notif-time">{n.time}</span>
            <span className="notif-text">{n.message}</span>
          </div>
        ))}
      </div>

      <div className="panel-header" style={{ marginTop: 16 }}>
        <span className="panel-icon">{"◈"}</span> QUICK ACTIONS
      </div>
      <div className="panel-body quick-actions">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a.cmd}
            className="action-btn"
            onClick={() => onQuickAction(a.cmd)}
          >
            {a.label}
          </button>
        ))}
        <button
          className="action-btn danger"
          onClick={() => onQuickAction("run backtest")}
        >
          Run Backtest
        </button>
      </div>
    </aside>
  );
}

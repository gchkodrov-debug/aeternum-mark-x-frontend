"use client";

import { useOrganismVitals } from "@/hooks/useChartData";

function CircularGauge({ value, label, color }: { value: number; label: string; color: string }) {
  const radius = 28;
  const stroke = 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div style={{ textAlign: "center" }}>
      <svg width={72} height={72} viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#1a1a1a" strokeWidth={stroke} />
        <circle
          cx="36" cy="36" r={radius} fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
        <text x="36" y="36" textAnchor="middle" dominantBaseline="middle"
          fill={color} fontSize="12" fontFamily="var(--font-mono)">
          {value.toFixed(0)}%
        </text>
      </svg>
      <div style={{ fontSize: "9px", color: "#7a8ba0", fontFamily: "var(--font-mono)", marginTop: "-4px" }}>
        {label}
      </div>
    </div>
  );
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  return `${h}h ${m}m`;
}

export default function OrganismPanel() {
  const vitals = useOrganismVitals();

  const status = vitals ? "active" : "loading";

  return (
    <div className="hud-panel">
      <div className="hud-panel-header">
        <span className="hud-panel-dot" data-status={status} />
        <span className="hud-panel-title">ORGANISM HEALTH</span>
        {vitals && (
          <span className="hud-panel-time">⬆ {formatUptime(vitals.uptime_seconds)}</span>
        )}
      </div>
      <div className="hud-panel-body">
        {vitals ? (
          <>
            {/* Gauges */}
            <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "8px" }}>
              <CircularGauge value={vitals.cpu_percent} label="CPU" color={vitals.cpu_percent > 80 ? "#ff0044" : vitals.cpu_percent > 60 ? "#ffaa00" : "#00ff88"} />
              <CircularGauge value={vitals.memory_percent} label="MEM" color={vitals.memory_percent > 80 ? "#ff0044" : vitals.memory_percent > 60 ? "#ffaa00" : "#00ff88"} />
              <CircularGauge value={vitals.disk_percent} label="DISK" color={vitals.disk_percent > 80 ? "#ff0044" : vitals.disk_percent > 60 ? "#ffaa00" : "#00ff88"} />
            </div>

            {/* Agent heartbeat grid */}
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "9px", color: "#7a8ba0", fontFamily: "var(--font-mono)", marginBottom: "4px" }}>AGENT HEARTBEATS</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "3px" }}>
                {Object.entries(vitals.agent_heartbeats).map(([name, state]) => (
                  <div
                    key={name}
                    title={name}
                    style={{
                      width: "100%",
                      aspectRatio: "1",
                      borderRadius: "50%",
                      background: state === "green" ? "#00ff88" : state === "yellow" ? "#ffaa00" : "#ff0044",
                      boxShadow: `0 0 4px ${state === "green" ? "rgba(0,255,136,0.5)" : state === "yellow" ? "rgba(255,170,0,0.5)" : "rgba(255,0,68,0.5)"}`,
                      maxWidth: "12px",
                      maxHeight: "12px",
                      margin: "0 auto",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* WebSocket quality */}
            <div className="hud-metric">
              <span className="hud-metric-label">WS Quality</span>
              <span className={`hud-metric-value ${vitals.websocket_quality === "excellent" ? "hud-metric-value--positive" : ""}`}>
                {vitals.websocket_quality.toUpperCase()} ({vitals.websocket_latency_ms.toFixed(0)}ms)
              </span>
            </div>

            {/* Connections */}
            <div className="hud-metric">
              <span className="hud-metric-label">Connections</span>
              <span className="hud-metric-value">{vitals.active_connections}</span>
            </div>

            {/* Req/min */}
            <div className="hud-metric">
              <span className="hud-metric-label">Req/min</span>
              <span className="hud-metric-value">{vitals.requests_per_minute.toFixed(0)}</span>
            </div>

            {/* Last error */}
            {vitals.last_error && (
              <div style={{
                marginTop: "6px",
                padding: "4px 6px",
                background: "rgba(255,0,68,0.1)",
                border: "1px solid rgba(255,0,68,0.3)",
                borderRadius: "3px",
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                color: "#ff6688",
              }}>
                ⚠ {vitals.last_error.message}
              </div>
            )}
          </>
        ) : (
          <div className="hud-metric"><span className="hud-metric-label">Loading...</span></div>
        )}
      </div>
    </div>
  );
}

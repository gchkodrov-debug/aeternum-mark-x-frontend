"use client";

import { useState, useEffect, useCallback } from "react";

interface Gate {
  name: string;
  status: "pass" | "fail" | "warn";
  score: number;
}

interface PanelData {
  gates: Gate[];
  gates_passed: number;
  gates_failed: number;
  gates_warned: number;
  overall_approved: boolean;
  guardian_score: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function RiskGuardianPanel() {
  const [data, setData] = useState<PanelData | null>(null);
  const [status, setStatus] = useState<"active" | "loading" | "error">("loading");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/aeternum/agents/risk_guardian/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ market_data: {} }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json.analysis.data);
      setStatus("active");
      setLastUpdate(new Date().toLocaleTimeString());
    } catch {
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="hud-panel">
      <div className="hud-panel-header">
        <span className="hud-panel-dot" data-status={status} />
        <span className="hud-panel-title">RISK GUARDIAN</span>
        <span className="hud-panel-time">{lastUpdate}</span>
      </div>
      <div className="hud-panel-body">
        {data ? (
          <>
            <div className="hud-metric">
              <span className="hud-metric-label">Guardian Score</span>
              <span
                className={`hud-metric-value ${
                  data.guardian_score >= 70
                    ? "hud-metric-value--positive"
                    : data.guardian_score < 40
                    ? "hud-metric-value--negative"
                    : "hud-metric-value--warning"
                }`}
              >
                {data.guardian_score.toFixed(1)}%
              </span>
            </div>
            <div className="hud-bar">
              <div className="hud-bar-fill" style={{ width: `${data.guardian_score}%` }} />
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">Pass / Fail / Warn</span>
              <span className="hud-metric-value">
                <span className="hud-metric-value--positive">{data.gates_passed}</span>{" / "}
                <span className="hud-metric-value--negative">{data.gates_failed}</span>{" / "}
                <span className="hud-metric-value--warning">{data.gates_warned}</span>
              </span>
            </div>
            <span className={data.overall_approved ? "hud-tag hud-tag--bullish" : "hud-tag hud-tag--bearish"}>
              {data.overall_approved ? "APPROVED" : "DENIED"}
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
              {data.gates.map((g, i) => (
                <div
                  key={i}
                  className={`hud-gate ${
                    g.status === "pass" ? "hud-gate--pass" : g.status === "fail" ? "hud-gate--fail" : "hud-gate--warn"
                  }`}
                  title={`${g.name}: ${g.score.toFixed(1)}`}
                >
                  {g.name}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="hud-metric"><span className="hud-metric-label">Loading...</span></div>
        )}
      </div>
    </div>
  );
}

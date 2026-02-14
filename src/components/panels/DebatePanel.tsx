"use client";

import { useState, useEffect, useCallback } from "react";

interface Debater {
  role: string;
  argument: string;
  confidence: number;
  evidence_points: number;
}

interface PanelData {
  debaters: Debater[];
  rounds_completed: number;
  current_winner: string;
  consensus_reached: boolean;
  final_verdict: string;
  debate_quality_score: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function DebatePanel() {
  const [data, setData] = useState<PanelData | null>(null);
  const [status, setStatus] = useState<"active" | "loading" | "error">("loading");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/aeternum/agents/debate/analyze`, {
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

  const roleClass = (role: string) => {
    const r = role.toLowerCase();
    if (r.includes("bull")) return "hud-tag--bullish";
    if (r.includes("bear")) return "hud-tag--bearish";
    return "hud-tag--neutral";
  };

  return (
    <div className="hud-panel">
      <div className="hud-panel-header">
        <span className="hud-panel-dot" data-status={status} />
        <span className="hud-panel-title">AGENT DEBATE</span>
        <span className="hud-panel-time">{lastUpdate}</span>
      </div>
      <div className="hud-panel-body">
        {data ? (
          <>
            <div className="hud-metric">
              <span className="hud-metric-label">Rounds</span>
              <span className="hud-metric-value">{data.rounds_completed}</span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">Quality Score</span>
              <span
                className={`hud-metric-value ${
                  data.debate_quality_score >= 0.7
                    ? "hud-metric-value--positive"
                    : data.debate_quality_score < 0.4
                    ? "hud-metric-value--negative"
                    : "hud-metric-value--warning"
                }`}
              >
                {(data.debate_quality_score * 100).toFixed(0)}%
              </span>
            </div>
            <div className="hud-list">
              {data.debaters.map((d, i) => (
                <div
                  key={i}
                  className="hud-list-item"
                  style={{
                    borderLeft: d.role.toLowerCase() === data.current_winner.toLowerCase()
                      ? "3px solid #00ff88"
                      : "3px solid transparent",
                    paddingLeft: "8px",
                  }}
                >
                  <div>
                    <span className={`hud-tag ${roleClass(d.role)}`}>{d.role.toUpperCase()}</span>
                    {d.role.toLowerCase() === data.current_winner.toLowerCase() && (
                      <span className="hud-tag hud-tag--bullish" style={{ marginLeft: "4px" }}>★ LEADING</span>
                    )}
                  </div>
                  <div style={{ margin: "4px 0", fontSize: "0.85em" }}>{d.argument}</div>
                  <div className="hud-metric">
                    <span className="hud-metric-label">Confidence</span>
                    <span className="hud-metric-value">{(d.confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="hud-metric">
                    <span className="hud-metric-label">Evidence</span>
                    <span className="hud-metric-value">{d.evidence_points} pts</span>
                  </div>
                </div>
              ))}
            </div>
            <span
              className={`hud-tag ${
                data.final_verdict.toLowerCase().includes("bull")
                  ? "hud-tag--bullish"
                  : data.final_verdict.toLowerCase().includes("bear")
                  ? "hud-tag--bearish"
                  : "hud-tag--neutral"
              }`}
            >
              VERDICT: {data.final_verdict.toUpperCase()}
            </span>
            {data.consensus_reached && (
              <span className="hud-tag hud-tag--bullish" style={{ marginLeft: "4px" }}>CONSENSUS</span>
            )}
          </>
        ) : (
          <div className="hud-metric"><span className="hud-metric-label">Loading...</span></div>
        )}
      </div>
    </div>
  );
}

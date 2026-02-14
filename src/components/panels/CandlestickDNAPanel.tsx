"use client";

import { useState, useEffect, useCallback } from "react";

interface PanelData {
  patterns_by_timeframe: Record<string, string[]>;
  total_patterns: number;
  dominant_signal: string;
  pattern_confluence_score: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function CandlestickDNAPanel() {
  const [data, setData] = useState<PanelData | null>(null);
  const [status, setStatus] = useState<"active" | "loading" | "error">("loading");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/aeternum/agents/candlestick_dna/analyze`, {
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

  const signalClass = data
    ? data.dominant_signal === "bullish"
      ? "hud-tag--bullish"
      : data.dominant_signal === "bearish"
      ? "hud-tag--bearish"
      : "hud-tag--neutral"
    : "hud-tag--neutral";

  return (
    <div className="hud-panel">
      <div className="hud-panel-header">
        <span className="hud-panel-dot" data-status={status} />
        <span className="hud-panel-title">CANDLESTICK DNA</span>
        <span className="hud-panel-time">{lastUpdate}</span>
      </div>
      <div className="hud-panel-body">
        {data ? (
          <>
            <div className="hud-metric">
              <span className="hud-metric-label">Total Patterns</span>
              <span className="hud-metric-value">{data.total_patterns}</span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">Confluence Score</span>
              <span
                className={`hud-metric-value ${
                  data.pattern_confluence_score >= 0.7
                    ? "hud-metric-value--positive"
                    : data.pattern_confluence_score < 0.4
                    ? "hud-metric-value--negative"
                    : "hud-metric-value--warning"
                }`}
              >
                {(data.pattern_confluence_score * 100).toFixed(1)}%
              </span>
            </div>
            <div className="hud-bar">
              <div className="hud-bar-fill" style={{ width: `${data.pattern_confluence_score * 100}%` }} />
            </div>
            <span className={`hud-tag ${signalClass}`}>
              {data.dominant_signal.toUpperCase()}
            </span>
            <div className="hud-list">
              {Object.entries(data.patterns_by_timeframe).map(([tf, patterns]) => (
                <div key={tf} className="hud-list-item">
                  <strong>{tf}:</strong> {Array.isArray(patterns) ? patterns.join(", ") : String(patterns)}
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

"use client";

import { useState, useEffect, useCallback } from "react";

interface Strategy {
  name: string;
  win_rate: number;
  profit_factor: number;
  sharpe: number;
  asset_class: string;
  timeframe: string;
}

interface PanelData {
  total_strategies: number;
  active_strategies: number;
  top_strategies: Strategy[];
  filters_applied: string[];
  last_backtest_date: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function StrategyPanel() {
  const [data, setData] = useState<PanelData | null>(null);
  const [status, setStatus] = useState<"active" | "loading" | "error">("loading");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/aeternum/agents/strategy/analyze`, {
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
        <span className="hud-panel-title">STRATEGY LIBRARY</span>
        <span className="hud-panel-time">{lastUpdate}</span>
      </div>
      <div className="hud-panel-body">
        {data ? (
          <>
            <div className="hud-metric">
              <span className="hud-metric-label">Total / Active</span>
              <span className="hud-metric-value">
                {data.total_strategies.toLocaleString()} / {data.active_strategies.toLocaleString()}
              </span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">Last Backtest</span>
              <span className="hud-metric-value">{data.last_backtest_date}</span>
            </div>
            <div className="hud-list">
              {data.top_strategies.slice(0, 5).map((s, i) => (
                <div key={i} className="hud-list-item">
                  <div><strong>{s.name}</strong> <span className="hud-tag hud-tag--neutral">{s.asset_class} · {s.timeframe}</span></div>
                  <div className="hud-metric">
                    <span className="hud-metric-label">WR</span>
                    <span className={`hud-metric-value ${s.win_rate >= 0.5 ? "hud-metric-value--positive" : "hud-metric-value--negative"}`}>
                      {(s.win_rate * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="hud-metric">
                    <span className="hud-metric-label">PF</span>
                    <span className={`hud-metric-value ${s.profit_factor >= 1.5 ? "hud-metric-value--positive" : "hud-metric-value--warning"}`}>
                      {s.profit_factor.toFixed(2)}
                    </span>
                  </div>
                  <div className="hud-metric">
                    <span className="hud-metric-label">Sharpe</span>
                    <span className={`hud-metric-value ${s.sharpe >= 1.0 ? "hud-metric-value--positive" : "hud-metric-value--warning"}`}>
                      {s.sharpe.toFixed(2)}
                    </span>
                  </div>
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

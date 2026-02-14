"use client";

import { useState, useEffect, useCallback } from "react";

interface PanelData {
  total_pnl: number;
  daily_pnl: number;
  win_rate: number;
  profit_factor: number;
  sharpe_ratio: number;
  max_drawdown: number;
  current_drawdown: number;
  total_trades: number;
  challenge_compliant: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

function fmtCurrency(n: number): string {
  const sign = n >= 0 ? "+" : "";
  return `${sign}$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function PerformancePanel() {
  const [data, setData] = useState<PanelData | null>(null);
  const [status, setStatus] = useState<"active" | "loading" | "error">("loading");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/aeternum/agents/performance/analyze`, {
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
        <span className="hud-panel-title">P&amp;L TRACKER</span>
        <span className="hud-panel-time">{lastUpdate}</span>
      </div>
      <div className="hud-panel-body">
        {data ? (
          <>
            <div className="hud-metric">
              <span className="hud-metric-label">Total P&amp;L</span>
              <span
                className={`hud-metric-value ${
                  data.total_pnl >= 0 ? "hud-metric-value--positive" : "hud-metric-value--negative"
                }`}
              >
                {fmtCurrency(data.total_pnl)}
              </span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">Daily P&amp;L</span>
              <span
                className={`hud-metric-value ${
                  data.daily_pnl >= 0 ? "hud-metric-value--positive" : "hud-metric-value--negative"
                }`}
              >
                {fmtCurrency(data.daily_pnl)}
              </span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">Win Rate</span>
              <span
                className={`hud-metric-value ${
                  data.win_rate >= 0.5 ? "hud-metric-value--positive" : "hud-metric-value--negative"
                }`}
              >
                {(data.win_rate * 100).toFixed(1)}%
              </span>
            </div>
            <div className="hud-bar">
              <div className="hud-bar-fill" style={{ width: `${data.win_rate * 100}%` }} />
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">Profit Factor</span>
              <span
                className={`hud-metric-value ${
                  data.profit_factor >= 1.5 ? "hud-metric-value--positive" : data.profit_factor >= 1.0 ? "hud-metric-value--warning" : "hud-metric-value--negative"
                }`}
              >
                {data.profit_factor.toFixed(2)}
              </span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">Sharpe Ratio</span>
              <span
                className={`hud-metric-value ${
                  data.sharpe_ratio >= 1.0 ? "hud-metric-value--positive" : "hud-metric-value--warning"
                }`}
              >
                {data.sharpe_ratio.toFixed(2)}
              </span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">Max Drawdown</span>
              <span className="hud-metric-value hud-metric-value--negative">
                {(data.max_drawdown * 100).toFixed(2)}%
              </span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">Current Drawdown</span>
              <span
                className={`hud-metric-value ${
                  data.current_drawdown > 0.05 ? "hud-metric-value--negative" : "hud-metric-value--warning"
                }`}
              >
                {(data.current_drawdown * 100).toFixed(2)}%
              </span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">Total Trades</span>
              <span className="hud-metric-value">{data.total_trades.toLocaleString()}</span>
            </div>
            <span
              className={data.challenge_compliant ? "hud-tag hud-tag--bullish" : "hud-tag hud-tag--bearish"}
            >
              {data.challenge_compliant ? "✅ COMPLIANT" : "⛔ NON-COMPLIANT"}
            </span>
          </>
        ) : (
          <div className="hud-metric"><span className="hud-metric-label">Loading...</span></div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";

interface RollingTrade {
  date: string;
  symbol: string;
  side: string;
}

interface PanelData {
  day_trades_used: number;
  day_trades_remaining: number;
  max_day_trades: number;
  account_value: number;
  pdt_restricted: boolean;
  rolling_trades: RollingTrade[];
  next_trade_available_date: string;
  warning_level: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function PDTGuardianPanel() {
  const [data, setData] = useState<PanelData | null>(null);
  const [status, setStatus] = useState<"active" | "loading" | "error">("loading");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/aeternum/agents/pdt_guardian/analyze`, {
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

  const warningClass = (level: string) =>
    level === "critical" || level === "high"
      ? "hud-metric-value--negative"
      : level === "medium" || level === "warning"
      ? "hud-metric-value--warning"
      : "hud-metric-value--positive";

  return (
    <div className="hud-panel">
      <div className="hud-panel-header">
        <span className="hud-panel-dot" data-status={status} />
        <span className="hud-panel-title">PDT GUARDIAN</span>
        <span className="hud-panel-time">{lastUpdate}</span>
      </div>
      <div className="hud-panel-body">
        {data ? (
          <>
            <div className="hud-metric">
              <span className="hud-metric-label">Day Trades Used</span>
              <span
                className={`hud-metric-value ${
                  data.day_trades_used >= data.max_day_trades
                    ? "hud-metric-value--negative"
                    : data.day_trades_used >= data.max_day_trades - 1
                    ? "hud-metric-value--warning"
                    : "hud-metric-value--positive"
                }`}
              >
                {data.day_trades_used} / {data.max_day_trades}
              </span>
            </div>
            <div className="hud-bar">
              <div
                className="hud-bar-fill"
                style={{ width: `${(data.day_trades_used / data.max_day_trades) * 100}%` }}
              />
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">Remaining</span>
              <span className="hud-metric-value">{data.day_trades_remaining}</span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">Account Value</span>
              <span className="hud-metric-value">${data.account_value.toLocaleString()}</span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">Warning Level</span>
              <span className={`hud-metric-value ${warningClass(data.warning_level)}`}>
                {data.warning_level.toUpperCase()}
              </span>
            </div>
            <span className={data.pdt_restricted ? "hud-tag hud-tag--bearish" : "hud-tag hud-tag--bullish"}>
              {data.pdt_restricted ? "⛔ PDT RESTRICTED" : "✅ CLEAR"}
            </span>
            {data.next_trade_available_date && (
              <div className="hud-metric">
                <span className="hud-metric-label">Next Trade Available</span>
                <span className="hud-metric-value">{data.next_trade_available_date}</span>
              </div>
            )}
            <div className="hud-list">
              {data.rolling_trades.map((t, i) => (
                <div key={i} className="hud-list-item">
                  {t.date} · {t.symbol} · {t.side}
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

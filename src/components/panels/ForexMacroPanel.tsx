"use client";

import { useState, useEffect, useCallback } from "react";

interface ForexPair {
  pair: string;
  bid: number;
  ask: number;
  change_pct: number;
}

interface MacroIndicators {
  dxy: number;
  vix: number;
  us10y: number;
  fed_funds_rate: number;
}

interface PanelData {
  pairs: ForexPair[];
  macro_indicators: MacroIndicators;
  dxy_trend: string;
  risk_sentiment: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function ForexMacroPanel() {
  const [data, setData] = useState<PanelData | null>(null);
  const [status, setStatus] = useState<"active" | "loading" | "error">("loading");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/aeternum/agents/forex_macro/analyze`, {
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

  const changeClass = (v: number) =>
    v > 0 ? "hud-metric-value--positive" : v < 0 ? "hud-metric-value--negative" : "";

  return (
    <div className="hud-panel">
      <div className="hud-panel-header">
        <span className="hud-panel-dot" data-status={status} />
        <span className="hud-panel-title">FOREX &amp; MACRO</span>
        <span className="hud-panel-time">{lastUpdate}</span>
      </div>
      <div className="hud-panel-body">
        {data ? (
          <>
            <div className="hud-list">
              {data.pairs.map((p, i) => (
                <div key={i} className="hud-list-item">
                  <div className="hud-metric">
                    <span className="hud-metric-label">{p.pair}</span>
                    <span className="hud-metric-value">
                      {p.bid.toFixed(4)} / {p.ask.toFixed(4)}
                    </span>
                  </div>
                  <span className={`hud-metric-value ${changeClass(p.change_pct)}`}>
                    {p.change_pct > 0 ? "+" : ""}{p.change_pct.toFixed(2)}%
                  </span>
                </div>
              ))}
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">DXY</span>
              <span className="hud-metric-value">{data.macro_indicators.dxy.toFixed(2)}</span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">VIX</span>
              <span className={`hud-metric-value ${data.macro_indicators.vix > 25 ? "hud-metric-value--negative" : data.macro_indicators.vix > 18 ? "hud-metric-value--warning" : "hud-metric-value--positive"}`}>
                {data.macro_indicators.vix.toFixed(2)}
              </span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">US 10Y</span>
              <span className="hud-metric-value">{data.macro_indicators.us10y.toFixed(3)}%</span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">Fed Funds</span>
              <span className="hud-metric-value">{data.macro_indicators.fed_funds_rate.toFixed(2)}%</span>
            </div>
            <span className={`hud-tag ${data.risk_sentiment === "risk-on" ? "hud-tag--bullish" : data.risk_sentiment === "risk-off" ? "hud-tag--bearish" : "hud-tag--neutral"}`}>
              {data.risk_sentiment.toUpperCase()}
            </span>
          </>
        ) : (
          <div className="hud-metric"><span className="hud-metric-label">Loading...</span></div>
        )}
      </div>
    </div>
  );
}

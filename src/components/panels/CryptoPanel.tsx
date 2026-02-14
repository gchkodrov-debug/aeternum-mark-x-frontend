"use client";

import { useState, useEffect, useCallback } from "react";

interface CryptoAsset {
  symbol: string;
  price: number;
  change_24h: number;
  volume_24h_b: number;
  market_cap_b: number;
}

interface PanelData {
  assets: CryptoAsset[];
  fear_greed_index: number;
  btc_dominance: number;
  total_market_cap_b: number;
  trending_tokens: string[];
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

function fmtNum(n: number, decimals = 2): string {
  return n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

export default function CryptoPanel() {
  const [data, setData] = useState<PanelData | null>(null);
  const [status, setStatus] = useState<"active" | "loading" | "error">("loading");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/aeternum/agents/crypto/analyze`, {
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

  const fgLabel = (v: number) =>
    v <= 25 ? "Extreme Fear" : v <= 45 ? "Fear" : v <= 55 ? "Neutral" : v <= 75 ? "Greed" : "Extreme Greed";

  return (
    <div className="hud-panel">
      <div className="hud-panel-header">
        <span className="hud-panel-dot" data-status={status} />
        <span className="hud-panel-title">CRYPTO</span>
        <span className="hud-panel-time">{lastUpdate}</span>
      </div>
      <div className="hud-panel-body">
        {data ? (
          <>
            <div className="hud-metric">
              <span className="hud-metric-label">Fear &amp; Greed</span>
              <span
                className={`hud-metric-value ${
                  data.fear_greed_index <= 25
                    ? "hud-metric-value--negative"
                    : data.fear_greed_index >= 75
                    ? "hud-metric-value--positive"
                    : "hud-metric-value--warning"
                }`}
              >
                {data.fear_greed_index} — {fgLabel(data.fear_greed_index)}
              </span>
            </div>
            <div className="hud-bar">
              <div className="hud-bar-fill" style={{ width: `${data.fear_greed_index}%` }} />
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">BTC Dominance</span>
              <span className="hud-metric-value">{fmtNum(data.btc_dominance, 1)}%</span>
            </div>
            <div className="hud-bar">
              <div className="hud-bar-fill" style={{ width: `${data.btc_dominance}%` }} />
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">Total Market Cap</span>
              <span className="hud-metric-value">${fmtNum(data.total_market_cap_b, 1)}B</span>
            </div>
            <div className="hud-list">
              {data.assets.map((a, i) => (
                <div key={i} className="hud-list-item">
                  <div className="hud-metric">
                    <span className="hud-metric-label">{a.symbol}</span>
                    <span className="hud-metric-value">${fmtNum(a.price)}</span>
                  </div>
                  <span className={`hud-metric-value ${changeClass(a.change_24h)}`}>
                    {a.change_24h > 0 ? "+" : ""}{fmtNum(a.change_24h, 1)}%
                  </span>
                  <span className="hud-metric-value" style={{ fontSize: "0.75em", opacity: 0.7 }}>
                    Vol ${fmtNum(a.volume_24h_b, 1)}B · MCap ${fmtNum(a.market_cap_b, 1)}B
                  </span>
                </div>
              ))}
            </div>
            {data.trending_tokens && data.trending_tokens.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "8px" }}>
                {data.trending_tokens.map((t, i) => (
                  <span key={i} className="hud-tag hud-tag--neutral">🔥 {t}</span>
                ))}
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

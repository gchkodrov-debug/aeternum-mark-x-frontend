"use client";

import { useState, useEffect, useCallback } from "react";

interface Headline {
  title: string;
  source: string;
  sentiment: string;
  impact_score: number;
  timestamp: string;
}

interface PanelData {
  headlines: Headline[];
  overall_sentiment: string;
  sentiment_score: number;
  sources_active: number;
  breaking_alerts: number;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function NewsPanel() {
  const [data, setData] = useState<PanelData | null>(null);
  const [status, setStatus] = useState<"active" | "loading" | "error">("loading");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/aeternum/agents/news/analyze`, {
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

  const sentimentClass = (s: string) =>
    s === "positive" || s === "bullish" ? "hud-tag--bullish" : s === "negative" || s === "bearish" ? "hud-tag--bearish" : "hud-tag--neutral";

  return (
    <div className="hud-panel">
      <div className="hud-panel-header">
        <span className="hud-panel-dot" data-status={status} />
        <span className="hud-panel-title">NEWS FEED</span>
        <span className="hud-panel-time">{lastUpdate}</span>
      </div>
      <div className="hud-panel-body">
        {data ? (
          <>
            <div className="hud-metric">
              <span className="hud-metric-label">Overall Sentiment</span>
              <span className={`hud-tag ${sentimentClass(data.overall_sentiment)}`}>
                {data.overall_sentiment.toUpperCase()} ({(data.sentiment_score * 100).toFixed(0)}%)
              </span>
            </div>
            <div className="hud-bar">
              <div className="hud-bar-fill" style={{ width: `${Math.abs(data.sentiment_score) * 100}%` }} />
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">Sources Active</span>
              <span className="hud-metric-value">{data.sources_active}</span>
            </div>
            {data.breaking_alerts > 0 && (
              <span className="hud-tag hud-tag--bearish">⚡ {data.breaking_alerts} BREAKING</span>
            )}
            <div className="hud-list" style={{ maxHeight: "200px", overflowY: "auto" }}>
              {data.headlines.map((h, i) => (
                <div key={i} className="hud-list-item">
                  <div>
                    <span className={`hud-tag ${sentimentClass(h.sentiment)}`}>
                      {h.impact_score >= 0.8 ? "HIGH" : h.impact_score >= 0.5 ? "MED" : "LOW"}
                    </span>
                    {" "}{h.title}
                  </div>
                  <div style={{ fontSize: "0.75em", opacity: 0.7 }}>
                    {h.source} · {h.timestamp}
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

"use client";

import { useState, useEffect, useCallback } from "react";

interface PanelData {
  [key: string]: unknown;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    if (Math.abs(value) < 1 && value !== 0) return (value * 100).toFixed(1) + "%";
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function valueClass(value: unknown): string {
  if (typeof value === "number") {
    if (value > 0) return "hud-metric-value--positive";
    if (value < 0) return "hud-metric-value--negative";
  }
  return "";
}

export default function BookmapPanel() {
  const [data, setData] = useState<PanelData | null>(null);
  const [status, setStatus] = useState<"active" | "loading" | "error">("loading");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/aeternum/agents/bookmap/analyze`, {
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
        <span className="hud-panel-title">ORDER FLOW</span>
        <span className="hud-panel-time">{lastUpdate}</span>
      </div>
      <div className="hud-panel-body">
        {data ? (
          <div className="hud-list">
            {Object.entries(data)
              .filter(([, v]) => typeof v !== "object" || v === null)
              .map(([key, value]) => (
                <div key={key} className="hud-metric">
                  <span className="hud-metric-label">{formatLabel(key)}</span>
                  <span className={`hud-metric-value ${valueClass(value)}`}>
                    {formatValue(value)}
                  </span>
                </div>
              ))}
            {Object.entries(data)
              .filter(([, v]) => typeof v === "object" && v !== null && !Array.isArray(v))
              .map(([key, value]) => (
                <div key={key}>
                  <div className="hud-metric">
                    <span className="hud-metric-label" style={{ fontWeight: "bold" }}>{formatLabel(key)}</span>
                  </div>
                  {Object.entries(value as Record<string, unknown>).map(([subKey, subVal]) => (
                    <div key={subKey} className="hud-metric" style={{ paddingLeft: "12px" }}>
                      <span className="hud-metric-label">{formatLabel(subKey)}</span>
                      <span className={`hud-metric-value ${valueClass(subVal)}`}>
                        {formatValue(subVal)}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
          </div>
        ) : (
          <div className="hud-metric"><span className="hud-metric-label">Loading...</span></div>
        )}
      </div>
    </div>
  );
}

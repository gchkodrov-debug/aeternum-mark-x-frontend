"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

interface CategoryStatus {
  category: string;
  label: string;
  configured: number;
  connected: number;
  total: number;
}

interface StatusData {
  categories: CategoryStatus[];
  overallStatus: "ARMED" | "DEGRADED" | "OFFLINE";
  tradingMode: string;
  balance: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  market_data: "MKT",
  news: "NEWS",
  ai: "AI",
  database: "DB",
  crypto: "CRYPTO",
  forex: "FX",
  macro: "MACRO",
  execution: "EXEC",
};

export default function StatusBar() {
  const [data, setData] = useState<StatusData | null>(null);
  const [uptime, setUptime] = useState(0);
  const startRef = useRef(Date.now());

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/aeternum/keys/status`);
      if (!res.ok) {
        setData({
          categories: [],
          overallStatus: "OFFLINE",
          tradingMode: "UNKNOWN",
          balance: "--",
        });
        return;
      }
      const keys = await res.json();

      // Group by category
      const catMap: Record<string, { configured: number; connected: number; total: number }> = {};
      for (const k of keys) {
        if (!catMap[k.category]) {
          catMap[k.category] = { configured: 0, connected: 0, total: 0 };
        }
        catMap[k.category].total++;
        if (k.is_configured) catMap[k.category].configured++;
        if (k.is_connected) catMap[k.category].connected++;
      }

      const categories: CategoryStatus[] = Object.entries(catMap).map(
        ([cat, v]) => ({
          category: cat,
          label: CATEGORY_LABELS[cat] || cat.toUpperCase(),
          ...v,
        })
      );

      const totalConfigured = keys.filter(
        (k: { is_configured: boolean }) => k.is_configured
      ).length;
      const hasExecution = keys.some(
        (k: { category: string; is_configured: boolean }) =>
          k.category === "execution" && k.is_configured
      );

      let overallStatus: "ARMED" | "DEGRADED" | "OFFLINE" = "OFFLINE";
      if (totalConfigured >= 3 && hasExecution) {
        overallStatus = "ARMED";
      } else if (totalConfigured >= 1) {
        overallStatus = "DEGRADED";
      }

      setData({
        categories,
        overallStatus,
        tradingMode: "SIMULATION",
        balance: hasExecution ? "$100,000.00" : "--",
      });
    } catch {
      setData({
        categories: [],
        overallStatus: "OFFLINE",
        tradingMode: "UNKNOWN",
        balance: "--",
      });
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, 30000);
    return () => clearInterval(id);
  }, [fetchStatus]);

  useEffect(() => {
    const id = setInterval(() => {
      setUptime(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const formatUptime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const getDotColor = (cat: CategoryStatus) => {
    if (cat.connected > 0) return "var(--accent-secondary)";
    if (cat.configured > 0) return "var(--accent-warning)";
    return "var(--accent-danger)";
  };

  const statusColor =
    data?.overallStatus === "ARMED"
      ? "var(--accent-secondary)"
      : data?.overallStatus === "DEGRADED"
        ? "var(--accent-warning)"
        : "var(--accent-danger)";

  return (
    <div className="status-bar">
      <div className="status-bar__left">
        <span className="status-bar__logo">AETERNUM</span>
        <span className="status-bar__divider">|</span>
        {data?.categories.map((cat) => (
          <span key={cat.category} className="status-bar__dot-group" title={`${cat.label}: ${cat.connected}/${cat.total} connected`}>
            <span
              className="status-bar__dot"
              style={{ backgroundColor: getDotColor(cat) }}
            />
            <span className="status-bar__dot-label">{cat.label}</span>
          </span>
        ))}
      </div>

      <div className="status-bar__center">
        <span
          className="status-bar__status"
          style={{ color: statusColor, borderColor: statusColor }}
        >
          {data?.overallStatus || "OFFLINE"}
        </span>
      </div>

      <div className="status-bar__right">
        <span className="status-bar__mode">
          {data?.tradingMode === "SIMULATION" ? (
            <span style={{ color: "var(--accent-warning)" }}>SIM</span>
          ) : (
            <span style={{ color: "var(--accent-secondary)" }}>LIVE</span>
          )}
        </span>
        <span className="status-bar__divider">|</span>
        <span className="status-bar__balance">{data?.balance || "--"}</span>
        <span className="status-bar__divider">|</span>
        <span className="status-bar__uptime">{formatUptime(uptime)}</span>
      </div>
    </div>
  );
}

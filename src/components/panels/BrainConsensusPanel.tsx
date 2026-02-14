"use client";

import { useState, useEffect, useCallback } from "react";

interface Dissenter {
  name: string;
  reason: string;
}

interface PanelData {
  consensus_pct: number;
  yes_votes: number;
  no_votes: number;
  abstain_votes: number;
  top_dissenters: Dissenter[];
  voting_round: number;
  quorum_met: boolean;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export default function BrainConsensusPanel() {
  const [data, setData] = useState<PanelData | null>(null);
  const [status, setStatus] = useState<"active" | "loading" | "error">("loading");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/aeternum/agents/brain_consensus/analyze`, {
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

  const totalVotes = data ? data.yes_votes + data.no_votes + data.abstain_votes : 0;
  const yesPct = totalVotes > 0 && data ? ((data.yes_votes / totalVotes) * 100).toFixed(1) : "0";
  const noPct = totalVotes > 0 && data ? ((data.no_votes / totalVotes) * 100).toFixed(1) : "0";
  const abstainPct = totalVotes > 0 && data ? ((data.abstain_votes / totalVotes) * 100).toFixed(1) : "0";

  return (
    <div className="hud-panel">
      <div className="hud-panel-header">
        <span className="hud-panel-dot" data-status={status} />
        <span className="hud-panel-title">BRAIN CONSENSUS</span>
        <span className="hud-panel-time">{lastUpdate}</span>
      </div>
      <div className="hud-panel-body">
        {data ? (
          <>
            <div className="hud-metric">
              <span className="hud-metric-label">Consensus</span>
              <span
                className={`hud-metric-value ${
                  data.consensus_pct >= 70
                    ? "hud-metric-value--positive"
                    : data.consensus_pct < 40
                    ? "hud-metric-value--negative"
                    : "hud-metric-value--warning"
                }`}
              >
                {data.consensus_pct.toFixed(1)}%
              </span>
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">Round</span>
              <span className="hud-metric-value">{data.voting_round}</span>
            </div>
            <div className="hud-bar">
              <div className="hud-bar-fill" style={{ width: `${yesPct}%`, background: "#00ff88" }} />
              <div className="hud-bar-fill" style={{ width: `${noPct}%`, background: "#ff4466" }} />
              <div className="hud-bar-fill" style={{ width: `${abstainPct}%`, background: "#ffaa00" }} />
            </div>
            <div className="hud-metric">
              <span className="hud-metric-label">Yes / No / Abstain</span>
              <span className="hud-metric-value">
                {data.yes_votes} / {data.no_votes} / {data.abstain_votes}
              </span>
            </div>
            <span className={data.quorum_met ? "hud-tag hud-tag--bullish" : "hud-tag hud-tag--bearish"}>
              {data.quorum_met ? "QUORUM MET" : "NO QUORUM"}
            </span>
            <div className="hud-list">
              {data.top_dissenters.slice(0, 3).map((d, i) => (
                <div key={i} className="hud-list-item">
                  <strong>{d.name}</strong>: {d.reason}
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

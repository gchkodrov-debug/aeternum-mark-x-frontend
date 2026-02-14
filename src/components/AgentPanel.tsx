"use client";

import { useState, useCallback } from "react";
import type { AgentState } from "@/hooks/useAgents";

interface AgentPanelProps {
  agents: AgentState[];
  onAnalyze: (name: string) => Promise<Record<string, unknown> | null>;
}

const STATUS_COLORS: Record<AgentState["status"], string> = {
  active: "var(--accent-secondary)",
  idle: "var(--accent-warning)",
  error: "var(--accent-danger)",
  disabled: "var(--text-dim)",
};

export default function AgentPanel({ agents, onAnalyze }: AgentPanelProps) {
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [result, setResult] = useState<{ agent: string; data: string } | null>(null);

  const handleAnalyze = useCallback(
    async (name: string) => {
      setAnalyzing(name);
      setResult(null);
      try {
        const res = await onAnalyze(name);
        if (res) {
          setResult({ agent: name, data: JSON.stringify(res, null, 2) });
        }
      } finally {
        setAnalyzing(null);
      }
    },
    [onAnalyze]
  );

  if (agents.length === 0) return null;

  return (
    <div className="agent-panel">
      <div className="panel-header">
        <span className="panel-icon">◈</span> AGENT NETWORK
      </div>
      <div className="agent-grid">
        {agents.map((agent) => (
          <button
            key={agent.name}
            className={`agent-card ${agent.status}${
              analyzing === agent.name ? " analyzing" : ""
            }`}
            onClick={() => handleAnalyze(agent.name)}
            disabled={analyzing !== null}
            type="button"
          >
            <div className="agent-card-header">
              <span
                className={`status-dot ${agent.status}`}
                style={{ background: STATUS_COLORS[agent.status] }}
              />
              <span className="agent-name">{agent.name.toUpperCase()}</span>
            </div>
            {agent.lastSignal && (
              <div className="agent-signal">{agent.lastSignal}</div>
            )}
            <div className="confidence-bar">
              <div
                className="confidence-fill"
                style={{
                  width: `${Math.round(agent.confidence * 100)}%`,
                  background: STATUS_COLORS[agent.status],
                }}
              />
            </div>
            <div className="agent-confidence-label">
              {Math.round(agent.confidence * 100)}%
            </div>
          </button>
        ))}
      </div>
      {result && (
        <div className="agent-result">
          <div className="agent-result-header">
            ◈ {result.agent.toUpperCase()} ANALYSIS
          </div>
          <pre className="agent-result-body">{result.data}</pre>
        </div>
      )}
    </div>
  );
}

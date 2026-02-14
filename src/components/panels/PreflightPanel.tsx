"use client";

import { useState, useCallback } from "react";
import {
  usePreflight,
  useLiveGate,
  PreflightCheck,
} from "@/hooks/useApiKeys";

const CATEGORY_LABELS: Record<string, string> = {
  api_keys: "API Keys",
  backend: "Backend Systems",
  ai: "AI Core",
  risk: "Risk Management",
  execution: "Execution",
};

const CATEGORY_ORDER = ["api_keys", "backend", "ai", "risk", "execution"];

function blockerAction(blocker: string): string {
  const lower = blocker.toLowerCase();
  if (lower.includes("ibkr")) return "Start IBKR Gateway or configure IB_HOST / IB_PORT";
  if (lower.includes("market data")) return "Add API keys for Alpha Vantage, Polygon, Finnhub, or Twelve Data";
  if (lower.includes("ai") || lower.includes("openai") || lower.includes("anthropic"))
    return "Configure an OpenAI or Anthropic API key";
  if (lower.includes(".env")) return "Create a .env file in the backend directory";
  return "Check configuration and connectivity";
}

function blockerIcon(blocker: string): string {
  const lower = blocker.toLowerCase();
  if (lower.includes("ibkr")) return "\uD83D\uDCE1";
  if (lower.includes("market data")) return "\uD83D\uDCC8";
  if (lower.includes("ai") || lower.includes("openai") || lower.includes("anthropic")) return "\uD83E\uDDE0";
  return "\u26D4";
}

function CheckIcon({ status }: { status: string }) {
  switch (status) {
    case "pass":
      return <span className="preflight-icon preflight-icon--pass">\u2705</span>;
    case "fail":
      return <span className="preflight-icon preflight-icon--fail">\u274C</span>;
    case "warn":
      return <span className="preflight-icon preflight-icon--warn">\u26A0\uFE0F</span>;
    case "skip":
      return <span className="preflight-icon preflight-icon--skip">\u23ED</span>;
    case "testing":
      return <span className="preflight-icon preflight-icon--testing">\u23F3</span>;
    default:
      return <span className="preflight-icon">\u2022</span>;
  }
}

function CheckRow({ check }: { check: PreflightCheck }) {
  return (
    <div className={`preflight-row preflight-row--${check.status}`}>
      <CheckIcon status={check.status} />
      <span className="preflight-row__name">
        {check.name}
        {check.critical && (
          <span className="preflight-badge preflight-badge--critical">CRITICAL</span>
        )}
      </span>
      <span className="preflight-row__detail">{check.detail}</span>
      {check.response_time_ms != null && check.response_time_ms > 0 && (
        <span className="preflight-row__latency">
          {check.response_time_ms.toFixed(0)}ms
        </span>
      )}
    </div>
  );
}

export default function PreflightPanel() {
  const { run, loading, result, error } = usePreflight();
  const {
    check: checkLiveGate,
    loading: liveGateLoading,
    result: liveGateResult,
    error: liveGateError,
  } = useLiveGate();
  const [expanded, setExpanded] = useState(true);
  const [hasRun, setHasRun] = useState(false);

  const handleRun = useCallback(async () => {
    setHasRun(true);
    await run();
  }, [run]);

  const handleLiveGate = useCallback(async () => {
    await checkLiveGate();
  }, [checkLiveGate]);

  // Group checks by category
  const grouped: Record<string, PreflightCheck[]> = {};
  if (result?.checks) {
    for (const check of result.checks) {
      if (!grouped[check.category]) grouped[check.category] = [];
      grouped[check.category].push(check);
    }
  }

  const goStatus = result?.go;
  const summary = result?.summary;
  const blockers = result?.blockers ?? [];

  return (
    <div className="hud-panel preflight-panel">
      <div
        className="hud-panel-header"
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: "pointer" }}
      >
        <span className="hud-panel-title">
          {expanded ? "\u25BC" : "\u25B6"} PRE-FLIGHT CHECKLIST
        </span>
        {result && (
          <span className="hud-panel-subtitle">
            {summary?.pass}/{summary?.total} passed
          </span>
        )}
      </div>

      {expanded && (
        <div className="preflight-panel__body">
          {/* GO / NO-GO Indicator */}
          <div className="preflight-go-indicator">
            {!hasRun ? (
              <div className="preflight-go-indicator__idle">
                <span className="preflight-go-text preflight-go-text--idle">
                  AWAITING CHECK
                </span>
              </div>
            ) : loading ? (
              <div className="preflight-go-indicator__testing">
                <span className="preflight-go-text preflight-go-text--testing">
                  RUNNING CHECKS...
                </span>
                <div className="preflight-progress">
                  <div className="preflight-progress__bar preflight-progress__bar--animated" />
                </div>
              </div>
            ) : goStatus === true ? (
              <div className="preflight-go-indicator__go">
                <span className="preflight-go-text preflight-go-text--go">GO</span>
                <span className="preflight-go-sub">
                  All critical systems operational
                </span>
              </div>
            ) : (
              <div className="preflight-go-indicator__nogo">
                <span className="preflight-go-text preflight-go-text--nogo">
                  NO-GO
                </span>
                <span className="preflight-go-sub">
                  {summary?.critical_failures} critical failure
                  {summary?.critical_failures !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* Blockers Section */}
          {blockers.length > 0 && (
            <div
              className="preflight-blockers"
              style={{
                margin: "0.75rem 0",
                padding: "0.75rem",
                border: "1px solid var(--accent-danger, #ff4444)",
                borderRadius: "6px",
                background: "rgba(255, 68, 68, 0.08)",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  color: "var(--accent-danger, #ff4444)",
                  marginBottom: "0.5rem",
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {"\u26D4"} Blockers ({blockers.length})
              </div>
              {blockers.map((b, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.5rem",
                    padding: "0.35rem 0",
                    borderBottom:
                      i < blockers.length - 1
                        ? "1px solid rgba(255,68,68,0.15)"
                        : "none",
                  }}
                >
                  <span style={{ fontSize: "1rem", flexShrink: 0 }}>
                    {blockerIcon(b)}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        color: "var(--accent-danger, #ff4444)",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                      }}
                    >
                      {b}
                    </div>
                    <div
                      style={{
                        color: "var(--text-secondary, #888)",
                        fontSize: "0.7rem",
                        marginTop: "2px",
                      }}
                    >
                      {"\u2192"} {blockerAction(b)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Run Buttons */}
          <div
            className="preflight-panel__toolbar"
            style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}
          >
            <button
              className="hud-btn hud-btn--primary hud-btn--lg"
              onClick={handleRun}
              disabled={loading}
            >
              {loading
                ? "\u23F3 Running Pre-Flight Check..."
                : "\uD83D\uDE80 Run Pre-Flight Check"}
            </button>
            <button
              className="hud-btn hud-btn--lg"
              onClick={handleLiveGate}
              disabled={liveGateLoading}
              style={{
                borderColor: "var(--accent-warning, #ffaa00)",
                color: "var(--accent-warning, #ffaa00)",
              }}
            >
              {liveGateLoading ? "\u23F3 Checking..." : "\uD83D\uDD12 Check Live Gate"}
            </button>
          </div>

          {/* Live Gate Result */}
          {(liveGateResult || liveGateError) && (
            <div
              style={{
                margin: "0.75rem 0",
                padding: "0.75rem",
                border: `1px solid ${
                  liveGateResult?.allowed
                    ? "var(--accent-secondary, #00ff00)"
                    : "var(--accent-danger, #ff4444)"
                }`,
                borderRadius: "6px",
                background: liveGateResult?.allowed
                  ? "rgba(0, 255, 0, 0.06)"
                  : "rgba(255, 68, 68, 0.06)",
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  color: liveGateResult?.allowed
                    ? "var(--accent-secondary, #00ff00)"
                    : "var(--accent-danger, #ff4444)",
                  marginBottom: "0.35rem",
                }}
              >
                LIVE TRADING:{" "}
                {liveGateResult?.allowed ? "READY \u2705" : "BLOCKED \u26D4"}
              </div>
              {liveGateError && (
                <div style={{ color: "var(--accent-danger, #ff4444)", fontSize: "0.8rem" }}>
                  {liveGateError}
                </div>
              )}
              {liveGateResult && (
                <div style={{ fontSize: "0.8rem", color: "var(--text-secondary, #aaa)" }}>
                  {liveGateResult.message}
                </div>
              )}
              {liveGateResult?.blockers && liveGateResult.blockers.length > 0 && (
                <div style={{ marginTop: "0.5rem" }}>
                  {liveGateResult.blockers.map((b, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--accent-danger, #ff4444)",
                        padding: "2px 0",
                      }}
                    >
                      {"\u26D4"} {b}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && <div className="preflight-error">Error: {error}</div>}

          {/* Summary Bar */}
          {summary && (
            <div className="preflight-summary">
              <span className="preflight-summary__item preflight-summary__item--pass">
                {"\u2705"} {summary.pass} Pass
              </span>
              <span className="preflight-summary__item preflight-summary__item--fail">
                {"\u274C"} {summary.fail} Fail
              </span>
              <span className="preflight-summary__item preflight-summary__item--warn">
                {"\u26A0\uFE0F"} {summary.warn} Warn
              </span>
              <span className="preflight-summary__item preflight-summary__item--skip">
                {"\u23ED"} {summary.skip} Skip
              </span>
            </div>
          )}

          {/* Check Categories */}
          {CATEGORY_ORDER.map((cat) => {
            const checks = grouped[cat];
            if (!checks || checks.length === 0) return null;
            return (
              <div key={cat} className="preflight-category">
                <div className="preflight-category__header">
                  {CATEGORY_LABELS[cat] || cat}
                </div>
                {checks.map((check, i) => (
                  <CheckRow key={`${cat}-${i}`} check={check} />
                ))}
              </div>
            );
          })}

          {/* Trading Mode */}
          {result && (
            <div className="preflight-footer">
              <span>
                Trading Mode:{" "}
                <strong>{result.trading_mode?.toUpperCase()}</strong>
              </span>
              <span>
                API Keys: {result.api_keys_connected}/{result.api_keys_total}{" "}
                connected
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

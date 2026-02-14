"use client";

import { useState, useCallback } from "react";
import { usePreflight, PreflightCheck } from "@/hooks/useApiKeys";

const CATEGORY_LABELS: Record<string, string> = {
  api_keys: "API Keys",
  backend: "Backend Systems",
  ai: "AI Core",
  risk: "Risk Management",
  execution: "Execution",
};

const CATEGORY_ORDER = ["api_keys", "backend", "ai", "risk", "execution"];

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
        {check.critical && <span className="preflight-badge preflight-badge--critical">CRITICAL</span>}
      </span>
      <span className="preflight-row__detail">{check.detail}</span>
      {check.response_time_ms != null && check.response_time_ms > 0 && (
        <span className="preflight-row__latency">{check.response_time_ms.toFixed(0)}ms</span>
      )}
    </div>
  );
}

export default function PreflightPanel() {
  const { run, loading, result, error } = usePreflight();
  const [expanded, setExpanded] = useState(true);
  const [hasRun, setHasRun] = useState(false);

  const handleRun = useCallback(async () => {
    setHasRun(true);
    await run();
  }, [run]);

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
                <span className="preflight-go-text preflight-go-text--idle">AWAITING CHECK</span>
              </div>
            ) : loading ? (
              <div className="preflight-go-indicator__testing">
                <span className="preflight-go-text preflight-go-text--testing">RUNNING CHECKS...</span>
                <div className="preflight-progress">
                  <div className="preflight-progress__bar preflight-progress__bar--animated" />
                </div>
              </div>
            ) : goStatus === true ? (
              <div className="preflight-go-indicator__go">
                <span className="preflight-go-text preflight-go-text--go">GO</span>
                <span className="preflight-go-sub">All critical systems operational</span>
              </div>
            ) : (
              <div className="preflight-go-indicator__nogo">
                <span className="preflight-go-text preflight-go-text--nogo">NO-GO</span>
                <span className="preflight-go-sub">
                  {summary?.critical_failures} critical failure{summary?.critical_failures !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* Run Button */}
          <div className="preflight-panel__toolbar">
            <button
              className="hud-btn hud-btn--primary hud-btn--lg"
              onClick={handleRun}
              disabled={loading}
            >
              {loading ? "\u23F3 Running Pre-Flight Check..." : "\u{1F680} Run Pre-Flight Check"}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="preflight-error">
              Error: {error}
            </div>
          )}

          {/* Summary Bar */}
          {summary && (
            <div className="preflight-summary">
              <span className="preflight-summary__item preflight-summary__item--pass">
                \u2705 {summary.pass} Pass
              </span>
              <span className="preflight-summary__item preflight-summary__item--fail">
                \u274C {summary.fail} Fail
              </span>
              <span className="preflight-summary__item preflight-summary__item--warn">
                \u26A0\uFE0F {summary.warn} Warn
              </span>
              <span className="preflight-summary__item preflight-summary__item--skip">
                \u23ED {summary.skip} Skip
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
              <span>Trading Mode: <strong>{result.trading_mode?.toUpperCase()}</strong></span>
              <span>API Keys: {result.api_keys_connected}/{result.api_keys_total} connected</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

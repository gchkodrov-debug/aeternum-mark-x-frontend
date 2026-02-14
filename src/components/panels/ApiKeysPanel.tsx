"use client";

import { useState, useCallback, useEffect } from "react";
import {
  useApiKeysStatus,
  useSetKey,
  useDeleteKey,
  useTestKey,
  useTestAllKeys,
  ApiKeyStatus,
} from "@/hooks/useApiKeys";

const CATEGORY_LABELS: Record<string, string> = {
  market_data: "Market Data",
  news: "News & Sentiment",
  ai: "AI / LLM",
  database: "Database",
  crypto: "Crypto",
  forex: "Forex",
  macro: "Macro Economics",
  execution: "Execution / Broker",
};

const CATEGORY_ORDER = [
  "market_data",
  "news",
  "ai",
  "database",
  "crypto",
  "forex",
  "macro",
  "execution",
];

function StatusDot({ status }: { status: "connected" | "configured" | "none" }) {
  const color =
    status === "connected"
      ? "var(--accent-secondary)"
      : status === "configured"
        ? "var(--accent-warning)"
        : "var(--accent-danger)";
  return (
    <span
      className="api-key-dot"
      style={{ backgroundColor: color }}
      title={
        status === "connected"
          ? "Connected"
          : status === "configured"
            ? "Configured (not tested)"
            : "Not configured"
      }
    />
  );
}

function KeyRow({
  svc,
  onRefresh,
}: {
  svc: ApiKeyStatus;
  onRefresh: () => void;
}) {
  const [inputVal, setInputVal] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { mutate: saveKey, loading: saving } = useSetKey();
  const { mutate: removeKey, loading: deleting } = useDeleteKey();
  const { test: testKey } = useTestKey();

  const handleSave = useCallback(async () => {
    if (!inputVal.trim()) return;
    try {
      await saveKey(svc.service, inputVal.trim());
      setInputVal("");
      setShowInput(false);
      onRefresh();
    } catch {
      /* handled by hook */
    }
  }, [inputVal, svc.service, saveKey, onRefresh]);

  const handleTest = useCallback(async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testKey(svc.service);
      setTestResult(res?.is_connected ?? false);
      onRefresh();
    } catch {
      setTestResult(false);
    } finally {
      setTesting(false);
    }
  }, [svc.service, testKey, onRefresh]);

  const handleDelete = useCallback(async () => {
    try {
      await removeKey(svc.service);
      setConfirmDelete(false);
      onRefresh();
    } catch {
      /* handled by hook */
    }
  }, [svc.service, removeKey, onRefresh]);

  const dotStatus = svc.is_connected
    ? "connected"
    : svc.is_configured
      ? "configured"
      : "none";

  return (
    <div className="api-key-row">
      <div className="api-key-row__status">
        <StatusDot status={dotStatus} />
      </div>
      <div className="api-key-row__name">{svc.label}</div>
      <div className="api-key-row__masked">
        {svc.masked_key || <span className="text-dim">Not set</span>}
      </div>
      <div className="api-key-row__actions">
        {showInput ? (
          <div className="api-key-row__input-group">
            <input
              type="password"
              className="api-key-input"
              placeholder="Enter API key..."
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
            <button
              className="hud-btn hud-btn--sm hud-btn--primary"
              onClick={handleSave}
              disabled={saving || !inputVal.trim()}
            >
              {saving ? "..." : "Save"}
            </button>
            <button
              className="hud-btn hud-btn--sm"
              onClick={() => {
                setShowInput(false);
                setInputVal("");
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <>
            <button
              className="hud-btn hud-btn--sm hud-btn--primary"
              onClick={() => setShowInput(true)}
            >
              {svc.is_configured ? "Update" : "Set Key"}
            </button>
            {svc.is_configured && (
              <>
                <button
                  className="hud-btn hud-btn--sm hud-btn--accent"
                  onClick={handleTest}
                  disabled={testing}
                >
                  {testing ? "Testing..." : testResult === true ? "\u2713 OK" : testResult === false ? "\u2717 Fail" : "Test"}
                </button>
                {confirmDelete ? (
                  <>
                    <button
                      className="hud-btn hud-btn--sm hud-btn--danger"
                      onClick={handleDelete}
                      disabled={deleting}
                    >
                      Confirm
                    </button>
                    <button
                      className="hud-btn hud-btn--sm"
                      onClick={() => setConfirmDelete(false)}
                    >
                      No
                    </button>
                  </>
                ) : (
                  <button
                    className="hud-btn hud-btn--sm hud-btn--danger"
                    onClick={() => setConfirmDelete(true)}
                  >
                    Delete
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
      {svc.response_time_ms > 0 && (
        <div className="api-key-row__latency">
          {svc.response_time_ms.toFixed(0)}ms
        </div>
      )}
    </div>
  );
}

export default function ApiKeysPanel() {
  const { data, loading, refetch } = useApiKeysStatus(0);
  const { testAll, loading: testingAll, result: testAllResult } = useTestAllKeys();
  const [expanded, setExpanded] = useState(true);

  // Use test-all results if available, otherwise use status data
  const displayData = testAllResult?.services ?? data;

  // Group by category
  const grouped: Record<string, ApiKeyStatus[]> = {};
  for (const svc of displayData) {
    if (!grouped[svc.category]) grouped[svc.category] = [];
    grouped[svc.category].push(svc);
  }

  const handleTestAll = useCallback(async () => {
    await testAll();
  }, [testAll]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const configured = displayData.filter((s) => s.is_configured).length;
  const connected = displayData.filter((s) => s.is_connected).length;

  return (
    <div className="hud-panel api-keys-panel">
      <div
        className="hud-panel-header"
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: "pointer" }}
      >
        <span className="hud-panel-title">
          {expanded ? "\u25BC" : "\u25B6"} API KEY MANAGEMENT
        </span>
        <span className="hud-panel-subtitle">
          {configured}/{displayData.length} configured \u00B7 {connected} connected
        </span>
      </div>

      {expanded && (
        <div className="api-keys-panel__body">
          <div className="api-keys-panel__toolbar">
            <button
              className="hud-btn hud-btn--primary"
              onClick={handleTestAll}
              disabled={testingAll}
            >
              {testingAll ? "Testing All..." : "\u26A1 Test All Connections"}
            </button>
            <button className="hud-btn" onClick={refetch} disabled={loading}>
              {loading ? "Refreshing..." : "\u21BB Refresh"}
            </button>
          </div>

          {CATEGORY_ORDER.map((cat) => {
            const services = grouped[cat];
            if (!services || services.length === 0) return null;
            return (
              <div key={cat} className="api-keys-category">
                <div className="api-keys-category__header">
                  {CATEGORY_LABELS[cat] || cat}
                </div>
                {services.map((svc) => (
                  <KeyRow key={svc.service} svc={svc} onRefresh={refetch} />
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

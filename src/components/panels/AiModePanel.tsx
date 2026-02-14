"use client";

import React from "react";
import { useAiMode } from "@/hooks/useAiMode";

export default function AiModePanel() {
  const { status, loading, error, switching, setMode } = useAiMode();

  if (loading) {
    return (
      <div className="panel ai-mode-panel">
        <h3 className="panel-title">AI Provider</h3>
        <p style={{ color: "#666", fontSize: 11 }}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="panel ai-mode-panel">
        <h3 className="panel-title">AI Provider</h3>
        <p style={{ color: "#ff4444", fontSize: 11 }}>{error}</p>
      </div>
    );
  }

  if (!status) return null;

  const isLocal = status.mode === "LOCAL_ONLY";
  const borderColor = isLocal ? "#00ff00" : "#ffaa00";

  return (
    <div
      className="panel ai-mode-panel"
      style={{
        border: `1px solid ${borderColor}`,
        borderRadius: 8,
        padding: 12,
        background: "rgba(0,0,0,0.8)",
      }}
    >
      <h3
        className="panel-title"
        style={{ margin: "0 0 10px 0", color: "#00ffff", fontSize: 14 }}
      >
        AI Provider Control
      </h3>

      {/* Mode Toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        <button
          onClick={() => setMode("LOCAL_ONLY")}
          disabled={switching || isLocal}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: isLocal ? "1px solid #00ff00" : "1px solid #333",
            borderRadius: 6,
            background: isLocal ? "rgba(0,255,0,0.1)" : "#111",
            color: isLocal ? "#00ff00" : "#888",
            cursor: switching || isLocal ? "not-allowed" : "pointer",
            fontSize: 11,
            fontWeight: "bold",
            opacity: switching ? 0.5 : 1,
            boxShadow: isLocal ? "0 0 10px rgba(0,255,0,0.2)" : "none",
          }}
        >
          LOCAL ONLY
        </button>
        <button
          onClick={() => setMode("LOCAL_EXTERNAL")}
          disabled={switching || !isLocal}
          style={{
            flex: 1,
            padding: "8px 12px",
            border: !isLocal ? "1px solid #ffaa00" : "1px solid #333",
            borderRadius: 6,
            background: !isLocal ? "rgba(255,170,0,0.1)" : "#111",
            color: !isLocal ? "#ffaa00" : "#888",
            cursor: switching || !isLocal ? "not-allowed" : "pointer",
            fontSize: 11,
            fontWeight: "bold",
            opacity: switching ? 0.5 : 1,
            boxShadow: !isLocal ? "0 0 10px rgba(255,170,0,0.2)" : "none",
          }}
        >
          LOCAL + EXTERNAL
        </button>
      </div>

      {/* Status Indicator */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
          fontSize: 11,
          color: "#aaa",
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: isLocal ? "#00ff00" : "#ffaa00",
            boxShadow: `0 0 6px ${isLocal ? "#00ff00" : "#ffaa00"}`,
          }}
        />
        <span>
          {isLocal
            ? "Zero external API costs - Ollama only"
            : "External AI enabled (costs tokens)"}
        </span>
      </div>

      {/* Provider Info */}
      <div style={{ marginBottom: 10, fontSize: 10 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "2px 0",
          }}
        >
          <span style={{ color: "#666" }}>Local:</span>
          <span style={{ color: "#00ffff", fontFamily: "monospace" }}>
            {status.local_provider.model} ({status.local_provider.type})
          </span>
        </div>
        {!isLocal && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "2px 0",
            }}
          >
            <span style={{ color: "#666" }}>External:</span>
            <span style={{ color: "#ffaa00", fontFamily: "monospace" }}>
              {status.external_provider.model} ({status.external_provider.type})
            </span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 6,
        }}
      >
        {[
          { value: status.stats.local_calls, label: "Local" },
          { value: status.stats.external_calls, label: "External" },
          { value: status.stats.external_blocked, label: "Blocked" },
          {
            value: status.stats.estimated_tokens_saved.toLocaleString(),
            label: "Saved",
          },
        ].map((s) => (
          <div
            key={s.label}
            style={{
              textAlign: "center",
              padding: 4,
              background: "rgba(0,255,255,0.05)",
              borderRadius: 4,
            }}
          >
            <span
              style={{
                display: "block",
                color: "#00ffff",
                fontSize: 14,
                fontWeight: "bold",
                fontFamily: "monospace",
              }}
            >
              {s.value}
            </span>
            <span
              style={{
                display: "block",
                color: "#666",
                fontSize: 8,
                textTransform: "uppercase",
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {switching && (
        <p
          style={{
            color: "#ffaa00",
            fontSize: 11,
            textAlign: "center",
            marginTop: 8,
          }}
        >
          Switching mode...
        </p>
      )}
    </div>
  );
}

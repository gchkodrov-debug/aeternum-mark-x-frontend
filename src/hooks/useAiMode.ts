"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface AiModeStatus {
  mode: "LOCAL_ONLY" | "LOCAL_EXTERNAL";
  external_ai_active: boolean;
  local_provider: {
    type: string;
    url: string;
    model: string;
  };
  external_provider: {
    type: string;
    url: string;
    model: string;
    has_key: boolean;
    enabled: boolean;
  };
  stats: {
    local_calls: number;
    external_calls: number;
    local_failures: number;
    external_blocked: number;
    estimated_tokens_saved: number;
  };
}

export function useAiMode(refreshInterval = 10000) {
  const [status, setStatus] = useState<AiModeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [switching, setSwitching] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/aeternum/ai-mode`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setStatus(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch AI mode");
    } finally {
      setLoading(false);
    }
  }, []);

  const setMode = useCallback(
    async (mode: "LOCAL_ONLY" | "LOCAL_EXTERNAL") => {
      setSwitching(true);
      try {
        const res = await fetch(`${API_BASE}/api/aeternum/ai-mode`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode }),
        });
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.detail || `HTTP ${res.status}`);
        }
        await fetchStatus();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to switch mode");
      } finally {
        setSwitching(false);
      }
    },
    [fetchStatus]
  );

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchStatus, refreshInterval]);

  return { status, loading, error, switching, setMode, refresh: fetchStatus };
}

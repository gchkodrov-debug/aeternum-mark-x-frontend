"use client";

import { useState, useEffect, useCallback, useRef } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

/* ── Types ──────────────────────────────────────────────────────────────── */

export interface ApiKeyStatus {
  service: string;
  label: string;
  category: string;
  env_var: string;
  is_configured: boolean;
  is_connected: boolean;
  masked_key: string;
  response_time_ms: number;
  detail: string;
}

export interface TestAllResult {
  services: ApiKeyStatus[];
  total: number;
  configured: number;
  connected: number;
}

export interface PreflightCheck {
  category: string;
  name: string;
  status: "pass" | "fail" | "skip" | "warn" | "testing";
  detail: string;
  critical?: boolean;
  response_time_ms?: number;
}

export interface PreflightResult {
  go: boolean;
  status: string;
  blockers: string[];
  checks: PreflightCheck[];
  summary: {
    total: number;
    pass: number;
    fail: number;
    skip: number;
    warn: number;
    critical_failures: number;
  };
  trading_mode: string;
  api_keys_configured: number;
  api_keys_connected: number;
  api_keys_total: number;
}

export interface LiveGateResult {
  allowed: boolean;
  blockers: string[];
  mode: "LIVE" | "SIMULATION";
  message: string;
}

export interface BackupListResult {
  backups: string[];
}

/* ── useBackendReachable ────────────────────────────────────────────────── */

/**
 * Checks whether the backend is reachable on mount and exposes the result.
 * Uses GET /api/aeternum/preflight with a 5 s timeout.
 */
export function useBackendReachable() {
  const [reachable, setReachable] = useState<boolean | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [checking, setChecking] = useState(true);

  const check = useCallback(async () => {
    setChecking(true);
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${API_BASE}/api/aeternum/health`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
      const elapsed = Math.round(performance.now() - start);
      setLatencyMs(elapsed);
      setReachable(res.ok);
    } catch {
      setReachable(false);
      setLatencyMs(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    check();
    // Re-check every 30 s
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [check]);

  return { reachable, latencyMs, checking, recheck: check };
}

/* ── useApiKeysStatus ───────────────────────────────────────────────────── */

export function useApiKeysStatus(autoRefreshMs = 30000) {
  const [data, setData] = useState<ApiKeyStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 5000);
      const res = await fetch(`${API_BASE}/api/aeternum/keys/status`, {
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setError(`Cannot connect to backend at ${API_BASE} (timeout)`);
      } else if (e instanceof TypeError) {
        setError(`Cannot connect to backend at ${API_BASE} (network error)`);
      } else {
        setError(e instanceof Error ? e.message : "Unknown error");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch_();
    if (autoRefreshMs > 0) {
      const id = setInterval(fetch_, autoRefreshMs);
      return () => clearInterval(id);
    }
  }, [fetch_, autoRefreshMs]);

  return { data, loading, error, refetch: fetch_ };
}

/* ── useSetKey ──────────────────────────────────────────────────────────── */

export function useSetKey() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (service: string, key: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/aeternum/keys/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, key }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e: unknown) {
      const msg =
        e instanceof TypeError
          ? `Cannot connect to backend at ${API_BASE}`
          : e instanceof Error
            ? e.message
            : "Unknown error";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/* ── useDeleteKey ───────────────────────────────────────────────────────── */

export function useDeleteKey() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (service: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/aeternum/keys/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e: unknown) {
      const msg =
        e instanceof TypeError
          ? `Cannot connect to backend at ${API_BASE}`
          : e instanceof Error
            ? e.message
            : "Unknown error";
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return { mutate, loading, error };
}

/* ── useTestKey ─────────────────────────────────────────────────────────── */

export function useTestKey() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiKeyStatus | null>(null);

  const test = useCallback(async (service: string) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/aeternum/keys/test/${service}`,
        { method: "POST" },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setResult(json);
      return json;
    } catch {
      setResult(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { test, loading, result };
}

/* ── useTestAllKeys ─────────────────────────────────────────────────────── */

export function useTestAllKeys() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestAllResult | null>(null);

  const testAll = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/aeternum/keys/test-all`, {
        method: "POST",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setResult(json);
      return json;
    } catch {
      setResult(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { testAll, loading, result };
}

/* ── usePreflight ───────────────────────────────────────────────────────── */

export function usePreflight() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PreflightResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/aeternum/preflight`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setResult(json);
      return json;
    } catch (e: unknown) {
      const msg =
        e instanceof TypeError
          ? `Cannot connect to backend at ${API_BASE}`
          : e instanceof Error
            ? e.message
            : "Unknown error";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { run, loading, result, error };
}

/* ── useLiveGate ────────────────────────────────────────────────────────── */

export function useLiveGate() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LiveGateResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const check = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_BASE}/api/aeternum/preflight/live-gate`,
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setResult(json);
      return json;
    } catch (e: unknown) {
      const msg =
        e instanceof TypeError
          ? `Cannot connect to backend at ${API_BASE}`
          : e instanceof Error
            ? e.message
            : "Unknown error";
      setError(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { check, loading, result, error };
}

/* ── Exported constant for other components ─────────────────────────────── */

export { API_BASE };

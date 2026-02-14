"use client";

import { useState, useEffect, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface PatternData {
  time: number;
  pattern: string;
  direction: string;
  strength: number;
  price: number;
}

export interface DepthLevel {
  price: number;
  volume: number;
  cumulative: number;
}

export interface DepthData {
  symbol: string;
  mid_price: number;
  spread: number;
  bids: DepthLevel[];
  asks: DepthLevel[];
}

export interface OrganismVitals {
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  agent_heartbeats: Record<string, string>;
  websocket_quality: string;
  websocket_latency_ms: number;
  uptime_seconds: number;
  last_error: { message: string; timestamp: string; severity: string } | null;
  active_connections: number;
  requests_per_minute: number;
}

export interface TrajectoryPoint {
  day: number;
  value: number;
}

export interface TimelineState {
  current_phase: number;
  current_balance: number;
  progress_percent: number;
  challenge_day: number;
  phases: { phase: number; name: string; target_from: number; target_to: number; status: string }[];
  milestones: { label: string; value: number; reached: boolean }[];
  projected_trajectory: TrajectoryPoint[];
  actual_trajectory: TrajectoryPoint[];
  monte_carlo_bands: Record<string, TrajectoryPoint[]>;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function useCandles(symbol: string, timeframe: string = "1h", limit: number = 200) {
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const data = await fetchJson<{ candles: CandleData[] }>(
      `${API_BASE}/api/aeternum/charts/candles/${symbol}?timeframe=${timeframe}&limit=${limit}`
    );
    if (data) setCandles(data.candles);
    setLoading(false);
  }, [symbol, timeframe, limit]);

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 15000);
    return () => clearInterval(iv);
  }, [refresh]);

  return { candles, loading, refresh };
}

export function usePatterns(symbol: string) {
  const [patterns, setPatterns] = useState<PatternData[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchJson<{ patterns: PatternData[] }>(
        `${API_BASE}/api/aeternum/charts/patterns/${symbol}`
      );
      if (data) setPatterns(data.patterns);
    };
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, [symbol]);

  return patterns;
}

export function useDepth(symbol: string) {
  const [depth, setDepth] = useState<DepthData | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchJson<DepthData>(
        `${API_BASE}/api/aeternum/charts/depth/${symbol}`
      );
      if (data) setDepth(data);
    };
    load();
    const iv = setInterval(load, 10000);
    return () => clearInterval(iv);
  }, [symbol]);

  return depth;
}

export function useSparkline(symbol: string) {
  const [prices, setPrices] = useState<number[]>([]);

  useEffect(() => {
    const load = async () => {
      const data = await fetchJson<{ prices: number[] }>(
        `${API_BASE}/api/aeternum/charts/sparkline/${symbol}`
      );
      if (data) setPrices(data.prices);
    };
    load();
    const iv = setInterval(load, 15000);
    return () => clearInterval(iv);
  }, [symbol]);

  return prices;
}

export function useOrganismVitals() {
  const [vitals, setVitals] = useState<OrganismVitals | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchJson<OrganismVitals>(
        `${API_BASE}/api/aeternum/organism/vitals`
      );
      if (data) setVitals(data);
    };
    load();
    const iv = setInterval(load, 8000);
    return () => clearInterval(iv);
  }, []);

  return vitals;
}

export function useTimeline() {
  const [timeline, setTimeline] = useState<TimelineState | null>(null);

  useEffect(() => {
    const load = async () => {
      const data = await fetchJson<TimelineState>(
        `${API_BASE}/api/aeternum/timeline/state`
      );
      if (data) setTimeline(data);
    };
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, []);

  return timeline;
}

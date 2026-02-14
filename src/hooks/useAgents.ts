"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface AgentState {
  name: string;
  status: "active" | "idle" | "error" | "disabled";
  lastSignal: string | null;
  confidence: number;
  timestamp: string;
  details: Record<string, unknown>;
}

interface BlackboardEntry {
  topic: string;
  data: unknown;
  updatedAt: string;
}

interface AnalysisResult {
  agent: string;
  result: Record<string, unknown>;
  timestamp: string;
}

interface UseAgentsReturn {
  agents: AgentState[];
  getAgent: (name: string) => AgentState | undefined;
  analyzeAgent: (name: string) => Promise<AnalysisResult | null>;
  queryBlackboard: (topic: string) => Promise<BlackboardEntry | null>;
  loading: boolean;
  error: string | null;
}

function getApiBase(): string {
  return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";
}

export function useAgents(): UseAgentsReturn {
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Fetch initial agent states via REST
  useEffect(() => {
    mountedRef.current = true;
    const fetchAgents = async () => {
      try {
        const res = await fetch(`${getApiBase()}/api/aeternum/agents`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: AgentState[] = await res.json();
        if (mountedRef.current) {
          setAgents(data);
          setError(null);
        }
      } catch (err) {
        if (mountedRef.current) {
          setError(err instanceof Error ? err.message : "Failed to fetch agents");
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    };
    fetchAgents();
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Listen for AGENT_UPDATE WebSocket events
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.agents && Array.isArray(detail.agents)) {
        setAgents(detail.agents as AgentState[]);
        setError(null);
      }
    };
    window.addEventListener("aeternum-agent-update", handler);
    return () => window.removeEventListener("aeternum-agent-update", handler);
  }, []);

  const getAgent = useCallback(
    (name: string): AgentState | undefined => {
      return agents.find((a) => a.name.toLowerCase() === name.toLowerCase());
    },
    [agents]
  );

  const analyzeAgent = useCallback(
    async (name: string): Promise<AnalysisResult | null> => {
      try {
        const res = await fetch(
          `${getApiBase()}/api/aeternum/agents/${encodeURIComponent(name)}/analyze`,
          { method: "POST" }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: AnalysisResult = await res.json();
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Analysis failed");
        return null;
      }
    },
    []
  );

  const queryBlackboard = useCallback(
    async (topic: string): Promise<BlackboardEntry | null> => {
      try {
        const res = await fetch(
          `${getApiBase()}/api/aeternum/agents/blackboard/query`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topic }),
          }
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: BlackboardEntry = await res.json();
        return data;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Blackboard query failed");
        return null;
      }
    },
    []
  );

  return { agents, getAgent, analyzeAgent, queryBlackboard, loading, error };
}

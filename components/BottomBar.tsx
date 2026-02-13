"use client";
import { useEffect, useState } from "react";

interface BottomBarProps {
  latency: number;
  clientCount: number;
}

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export default function BottomBar({ latency, clientCount }: BottomBarProps) {
  const [uptime, setUptime] = useState("0s");
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8765";

  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setUptime(formatUptime(Date.now() - start)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <footer className="bottom-bar">
      <span className="footer-item">WS: <span>{wsUrl}</span></span>
      <span className="footer-item">CLIENTS: <span>{clientCount}</span></span>
      <span className="footer-item">LATENCY: <span>{latency}</span>ms</span>
      <span className="footer-item">UPTIME: <span>{uptime}</span></span>
    </footer>
  );
}

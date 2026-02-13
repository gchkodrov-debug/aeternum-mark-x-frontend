"use client";

import { useEffect, useState } from "react";

interface BottomStripProps {
  wsUrl: string;
  clientCount: number;
  latency: number;
  getUptime: () => string;
}

export default function BottomStrip({
  wsUrl,
  clientCount,
  latency,
  getUptime,
}: BottomStripProps) {
  const [uptime, setUptime] = useState("0s");

  useEffect(() => {
    const interval = setInterval(() => {
      setUptime(getUptime());
    }, 1000);
    return () => clearInterval(interval);
  }, [getUptime]);

  return (
    <footer className="bottom-bar">
      <span className="footer-item">
        WS: <span>{wsUrl}</span>
      </span>
      <span className="footer-item">
        CLIENTS: <span>{clientCount}</span>
      </span>
      <span className="footer-item">
        LATENCY: <span>{latency}</span>ms
      </span>
      <span className="footer-item">
        UPTIME: <span>{uptime}</span>
      </span>
    </footer>
  );
}

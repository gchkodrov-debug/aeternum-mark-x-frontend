"use client";
import { useEffect, useState } from "react";

interface TopBarProps {
  connected: boolean;
}

export default function TopBar({ connected }: TopBarProps) {
  const [clock, setClock] = useState("00:00:00");

  useEffect(() => {
    const tick = () => {
      setClock(new Date().toLocaleTimeString("en-US", { hour12: false }));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const statusClass = connected ? "connected" : "disconnected";
  const statusLabel = connected ? "ONLINE" : "OFFLINE";

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <span className="logo">{"◆"} AETERNUM</span>
        <span className="version">MARK X</span>
      </div>
      <div className="top-bar-center">
        <span className={`status-indicator ${statusClass}`}>
          <span className="dot" />
          <span className="label">{statusLabel}</span>
        </span>
      </div>
      <div className="top-bar-right">
        <span className="clock">{clock}</span>
      </div>
    </header>
  );
}

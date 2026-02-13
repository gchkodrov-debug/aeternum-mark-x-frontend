"use client";

import { useEffect, useState } from "react";

interface TopBarProps {
  connected: boolean;
  connectionLabel: string;
}

export default function TopBar({ connected, connectionLabel }: TopBarProps) {
  const [clock, setClock] = useState("00:00:00");

  useEffect(() => {
    const update = () => {
      setClock(
        new Date().toLocaleTimeString("en-US", { hour12: false })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const statusClass = connected
    ? "connected"
    : connectionLabel === "ERROR"
      ? "disconnected"
      : "";

  return (
    <header className="top-bar">
      <div className="top-bar-left">
        <span className="logo">◆ AETERNUM</span>
        <span className="version">MARK X</span>
      </div>
      <div className="top-bar-center">
        <span className={`status-indicator ${statusClass}`} id="connectionStatus">
          <span className="dot" />
          <span className="label">{connectionLabel}</span>
        </span>
      </div>
      <div className="top-bar-right">
        <span className="clock">{clock}</span>
      </div>
    </header>
  );
}

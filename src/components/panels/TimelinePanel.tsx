"use client";

import { useEffect, useRef } from "react";
import { useTimeline } from "@/hooks/useChartData";

export default function TimelinePanel() {
  const timeline = useTimeline();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Draw trajectory chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !timeline) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    const w = rect?.width || 800;
    const h = 160;
    canvas.width = w * 2;
    canvas.height = h * 2;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(2, 2);

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, w, h);

    const pad = { top: 15, bottom: 25, left: 50, right: 20 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    // Collect all values for scale
    const allVals: number[] = [];
    const bands = timeline.monte_carlo_bands;
    for (const key of Object.keys(bands)) {
      for (const pt of bands[key]) allVals.push(pt.value);
    }
    for (const pt of timeline.projected_trajectory) allVals.push(pt.value);
    for (const pt of timeline.actual_trajectory) allVals.push(pt.value);
    allVals.push(timeline.current_balance);

    const minVal = Math.min(...allVals) * 0.9;
    const maxVal = Math.max(...allVals) * 1.1;
    const days = timeline.projected_trajectory.length;

    const dayToX = (d: number) => pad.left + (d / days) * cw;
    const valToY = (v: number) => {
      const logMin = Math.log10(Math.max(minVal, 1));
      const logMax = Math.log10(Math.max(maxVal, 1));
      const logV = Math.log10(Math.max(v, 1));
      return pad.top + ch - ((logV - logMin) / (logMax - logMin)) * ch;
    };

    // Grid lines
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = pad.top + (ch / 4) * i;
      ctx.beginPath();
      ctx.moveTo(pad.left, y);
      ctx.lineTo(w - pad.right, y);
      ctx.stroke();
    }

    // Monte Carlo bands (fan chart)
    const bandKeys = ["p10", "p25", "p50", "p75", "p90"];
    const bandColors = [
      "rgba(0,195,255,0.05)",
      "rgba(0,195,255,0.1)",
      "rgba(0,195,255,0.15)",
      "rgba(0,195,255,0.1)",
      "rgba(0,195,255,0.05)",
    ];

    for (let b = 0; b < bandKeys.length - 1; b++) {
      const lower = bands[bandKeys[b]];
      const upper = bands[bandKeys[b + 1]];
      if (!lower || !upper) continue;

      ctx.beginPath();
      for (let i = 0; i < lower.length; i++) {
        const x = dayToX(lower[i].day);
        const y = valToY(lower[i].value);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      for (let i = upper.length - 1; i >= 0; i--) {
        ctx.lineTo(dayToX(upper[i].day), valToY(upper[i].value));
      }
      ctx.closePath();
      ctx.fillStyle = bandColors[b];
      ctx.fill();
    }

    // Projected trajectory (dashed cyan)
    ctx.beginPath();
    ctx.setLineDash([6, 3]);
    for (let i = 0; i < timeline.projected_trajectory.length; i++) {
      const pt = timeline.projected_trajectory[i];
      const x = dayToX(pt.day);
      const y = valToY(pt.value);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "rgba(0,195,255,0.6)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // Actual trajectory (solid green)
    ctx.beginPath();
    for (let i = 0; i < timeline.actual_trajectory.length; i++) {
      const pt = timeline.actual_trajectory[i];
      const x = dayToX(pt.day);
      const y = valToY(pt.value);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#00ff88";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Current position dot
    ctx.beginPath();
    ctx.arc(dayToX(0), valToY(timeline.current_balance), 4, 0, Math.PI * 2);
    ctx.fillStyle = "#00ffff";
    ctx.fill();
    ctx.strokeStyle = "#0a0a0a";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = "#7a8ba0";
    ctx.font = "9px monospace";
    ctx.textAlign = "right";
    for (let i = 0; i <= 4; i++) {
      const logMin = Math.log10(Math.max(minVal, 1));
      const logMax = Math.log10(Math.max(maxVal, 1));
      const logV = logMin + ((logMax - logMin) * (4 - i)) / 4;
      const val = Math.pow(10, logV);
      const y = pad.top + (ch / 4) * i;
      const label = val >= 1000000 ? `$${(val / 1000000).toFixed(1)}M` : val >= 1000 ? `$${(val / 1000).toFixed(0)}K` : `$${val.toFixed(0)}`;
      ctx.fillText(label, pad.left - 5, y + 3);
    }

    // X-axis
    ctx.textAlign = "center";
    for (let d = 0; d <= days; d += 5) {
      ctx.fillText(`D${d}`, dayToX(d), h - 8);
    }
  }, [timeline]);

  if (!timeline) {
    return (
      <div className="hud-panel" style={{ gridColumn: "1 / -1" }}>
        <div className="hud-panel-header">
          <span className="hud-panel-dot" data-status="loading" />
          <span className="hud-panel-title">TIME PORTAL</span>
        </div>
        <div className="hud-panel-body">
          <div className="hud-metric"><span className="hud-metric-label">Loading...</span></div>
        </div>
      </div>
    );
  }

  return (
    <div className="hud-panel" style={{ gridColumn: "1 / -1" }}>
      <div className="hud-panel-header">
        <span className="hud-panel-dot" data-status="active" />
        <span className="hud-panel-title">TIME PORTAL — CHALLENGE TRAJECTORY</span>
        <span className="hud-panel-time">Day {timeline.challenge_day} | Phase {timeline.current_phase}</span>
      </div>
      <div className="hud-panel-body" style={{ padding: "8px" }}>
        {/* Milestones bar */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", padding: "0 4px" }}>
          {timeline.milestones.map((m) => (
            <div
              key={m.label}
              style={{
                textAlign: "center",
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                color: m.reached ? "#00ff88" : "#4a5568",
              }}
            >
              <div style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: m.reached ? "#00ff88" : "#1a1a1a",
                border: `1px solid ${m.reached ? "#00ff88" : "#333"}`,
                margin: "0 auto 2px",
                boxShadow: m.reached ? "0 0 6px rgba(0,255,136,0.5)" : "none",
              }} />
              {m.label}
            </div>
          ))}
        </div>

        {/* Progress bar */}
        <div style={{ position: "relative", height: "6px", background: "#1a1a1a", borderRadius: "3px", marginBottom: "8px" }}>
          <div style={{
            height: "100%",
            width: `${Math.min(timeline.progress_percent, 100)}%`,
            background: "linear-gradient(90deg, #00c3ff, #00ff88)",
            borderRadius: "3px",
            transition: "width 0.5s ease",
          }} />
          <span style={{
            position: "absolute",
            right: "4px",
            top: "-14px",
            fontSize: "9px",
            fontFamily: "var(--font-mono)",
            color: "#00ffff",
          }}>
            {timeline.progress_percent.toFixed(1)}%
          </span>
        </div>

        {/* Phase indicators */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          {timeline.phases.map((p) => (
            <div
              key={p.phase}
              style={{
                flex: 1,
                padding: "4px 8px",
                background: p.status === "active" ? "rgba(0,195,255,0.1)" : "rgba(26,26,26,0.5)",
                border: `1px solid ${p.status === "active" ? "#00c3ff" : p.status === "completed" ? "#00ff88" : "#1a1a1a"}`,
                borderRadius: "3px",
                textAlign: "center",
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
              }}
            >
              <div style={{ color: p.status === "active" ? "#00ffff" : p.status === "completed" ? "#00ff88" : "#4a5568" }}>
                P{p.phase}: {p.name}
              </div>
            </div>
          ))}
        </div>

        {/* Trajectory canvas */}
        <div style={{ width: "100%" }}>
          <canvas ref={canvasRef} style={{ width: "100%", height: "160px", display: "block" }} />
        </div>

        {/* Stats row */}
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: "8px" }}>
          <div style={{ textAlign: "center", fontSize: "10px", fontFamily: "var(--font-mono)" }}>
            <div style={{ color: "#7a8ba0" }}>BALANCE</div>
            <div style={{ color: "#00ff88", fontSize: "14px" }}>${timeline.current_balance.toLocaleString()}</div>
          </div>
          <div style={{ textAlign: "center", fontSize: "10px", fontFamily: "var(--font-mono)" }}>
            <div style={{ color: "#7a8ba0" }}>PHASE</div>
            <div style={{ color: "#00ffff", fontSize: "14px" }}>{timeline.current_phase} / 4</div>
          </div>
          <div style={{ textAlign: "center", fontSize: "10px", fontFamily: "var(--font-mono)" }}>
            <div style={{ color: "#7a8ba0" }}>DAY</div>
            <div style={{ color: "#00ffff", fontSize: "14px" }}>{timeline.challenge_day}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

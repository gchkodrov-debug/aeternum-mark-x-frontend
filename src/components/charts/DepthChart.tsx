"use client";

import { useEffect, useRef } from "react";
import { useDepth } from "@/hooks/useChartData";

interface Props {
  symbol?: string;
}

export default function DepthChart({ symbol = "SPY" }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const depth = useDepth(symbol);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !depth) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.parentElement?.getBoundingClientRect();
    const w = rect?.width || 400;
    const h = rect?.height || 280;
    canvas.width = w * 2;
    canvas.height = h * 2;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(2, 2);

    // Clear
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, w, h);

    const bids = depth.bids;
    const asks = depth.asks;
    if (bids.length === 0 || asks.length === 0) return;

    const maxCum = Math.max(
      bids[bids.length - 1].cumulative,
      asks[asks.length - 1].cumulative
    );
    const allPrices = [...bids.map((b) => b.price), ...asks.map((a) => a.price)];
    const minPrice = Math.min(...allPrices);
    const maxPrice = Math.max(...allPrices);
    const priceRange = maxPrice - minPrice || 1;

    const pad = { top: 20, bottom: 30, left: 10, right: 10 };
    const cw = w - pad.left - pad.right;
    const ch = h - pad.top - pad.bottom;

    const priceToX = (p: number) => pad.left + ((p - minPrice) / priceRange) * cw;
    const cumToY = (c: number) => pad.top + ch - (c / maxCum) * ch;

    // Draw bid area (green)
    ctx.beginPath();
    ctx.moveTo(priceToX(bids[0].price), cumToY(0));
    for (const b of bids) {
      ctx.lineTo(priceToX(b.price), cumToY(b.cumulative));
    }
    ctx.lineTo(priceToX(bids[bids.length - 1].price), cumToY(0));
    ctx.closePath();
    const bidGrad = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
    bidGrad.addColorStop(0, "rgba(0,255,0,0.4)");
    bidGrad.addColorStop(1, "rgba(0,255,0,0.05)");
    ctx.fillStyle = bidGrad;
    ctx.fill();

    // Bid line
    ctx.beginPath();
    for (let i = 0; i < bids.length; i++) {
      const x = priceToX(bids[i].price);
      const y = cumToY(bids[i].cumulative);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#00ff00";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Draw ask area (red)
    ctx.beginPath();
    ctx.moveTo(priceToX(asks[0].price), cumToY(0));
    for (const a of asks) {
      ctx.lineTo(priceToX(a.price), cumToY(a.cumulative));
    }
    ctx.lineTo(priceToX(asks[asks.length - 1].price), cumToY(0));
    ctx.closePath();
    const askGrad = ctx.createLinearGradient(0, pad.top, 0, h - pad.bottom);
    askGrad.addColorStop(0, "rgba(255,0,68,0.4)");
    askGrad.addColorStop(1, "rgba(255,0,68,0.05)");
    ctx.fillStyle = askGrad;
    ctx.fill();

    // Ask line
    ctx.beginPath();
    for (let i = 0; i < asks.length; i++) {
      const x = priceToX(asks[i].price);
      const y = cumToY(asks[i].cumulative);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#ff0044";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Mid price line
    const midX = priceToX(depth.mid_price);
    ctx.beginPath();
    ctx.moveTo(midX, pad.top);
    ctx.lineTo(midX, h - pad.bottom);
    ctx.strokeStyle = "rgba(0,255,255,0.5)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Labels
    ctx.fillStyle = "#00ffff";
    ctx.font = "10px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`Mid: ${depth.mid_price.toFixed(2)}`, midX, pad.top - 5);
    ctx.fillText("BIDS", pad.left + cw * 0.25, h - 8);
    ctx.fillText("ASKS", pad.left + cw * 0.75, h - 8);
  }, [depth]);

  return (
    <div className="hud-panel">
      <div className="hud-panel-header">
        <span className="hud-panel-dot" data-status={depth ? "active" : "loading"} />
        <span className="hud-panel-title">DEPTH — {symbol}</span>
        {depth && (
          <span className="hud-panel-time">Spread: {depth.spread.toFixed(4)}</span>
        )}
      </div>
      <div className="hud-panel-body" style={{ padding: 0 }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "280px", display: "block" }} />
      </div>
    </div>
  );
}

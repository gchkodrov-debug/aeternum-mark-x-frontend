"use client";

import { useEffect, useRef } from "react";
import { useSparkline } from "@/hooks/useChartData";

interface Props {
  symbol: string;
  width?: number;
  height?: number;
}

export default function MiniChart({ symbol, width = 120, height = 40 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prices = useSparkline(symbol);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || prices.length < 2) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width * 2;
    canvas.height = height * 2;
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.scale(2, 2);

    ctx.clearRect(0, 0, width, height);

    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const isUp = prices[prices.length - 1] >= prices[0];
    const color = isUp ? "#00ff00" : "#ff0044";

    const pad = 2;
    const cw = width - pad * 2;
    const ch = height - pad * 2;

    // Gradient fill
    ctx.beginPath();
    ctx.moveTo(pad, pad + ch);
    for (let i = 0; i < prices.length; i++) {
      const x = pad + (i / (prices.length - 1)) * cw;
      const y = pad + ch - ((prices[i] - min) / range) * ch;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(pad + cw, pad + ch);
    ctx.closePath();
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, isUp ? "rgba(0,255,0,0.15)" : "rgba(255,0,68,0.15)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grad;
    ctx.fill();

    // Line
    ctx.beginPath();
    for (let i = 0; i < prices.length; i++) {
      const x = pad + (i / (prices.length - 1)) * cw;
      const y = pad + ch - ((prices[i] - min) / range) * ch;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [prices, width, height]);

  return <canvas ref={canvasRef} style={{ width, height, display: "block" }} />;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { createChart, IChartApi, ISeriesApi, CandlestickData, HistogramData, Time } from "lightweight-charts";
import { useCandles, usePatterns } from "@/hooks/useChartData";

const TIMEFRAMES = ["1m", "5m", "15m", "1h", "4h", "1D"] as const;

interface Props {
  symbol?: string;
}

export default function CandlestickChart({ symbol = "SPY" }: Props) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartApi = useRef<IChartApi | null>(null);
  const candleSeries = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeries = useRef<ISeriesApi<"Histogram"> | null>(null);
  const [timeframe, setTimeframe] = useState<string>("1h");

  const { candles } = useCandles(symbol, timeframe, 200);
  const patterns = usePatterns(symbol);

  // Create chart
  useEffect(() => {
    if (!chartRef.current) return;

    const chart = createChart(chartRef.current, {
      layout: {
        background: { color: "#0a0a0a" },
        textColor: "#00ffff",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "#1a1a1a" },
        horzLines: { color: "#1a1a1a" },
      },
      crosshair: {
        vertLine: { color: "#00ffff", width: 1, style: 2, labelBackgroundColor: "#0a0a0a" },
        horzLine: { color: "#00ffff", width: 1, style: 2, labelBackgroundColor: "#0a0a0a" },
      },
      rightPriceScale: {
        borderColor: "#1a1a1a",
        scaleMargins: { top: 0.1, bottom: 0.25 },
      },
      timeScale: {
        borderColor: "#1a1a1a",
        timeVisible: true,
        secondsVisible: false,
      },
      width: chartRef.current.clientWidth,
      height: chartRef.current.clientHeight,
    });

    const cs = chart.addCandlestickSeries({
      upColor: "#00ff00",
      downColor: "#ff0044",
      borderUpColor: "#00ff00",
      borderDownColor: "#ff0044",
      wickUpColor: "#00ff00",
      wickDownColor: "#ff0044",
    });

    const vs = chart.addHistogramSeries({
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
    });

    chartApi.current = chart;
    candleSeries.current = cs;
    volumeSeries.current = vs;

    const handleResize = () => {
      if (chartRef.current) {
        chart.applyOptions({
          width: chartRef.current.clientWidth,
          height: chartRef.current.clientHeight,
        });
      }
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(chartRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartApi.current = null;
      candleSeries.current = null;
      volumeSeries.current = null;
    };
  }, []);

  // Update data
  useEffect(() => {
    if (!candleSeries.current || !volumeSeries.current || candles.length === 0) return;

    const candleData: CandlestickData<Time>[] = candles.map((c) => ({
      time: c.time as Time,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const volData: HistogramData<Time>[] = candles.map((c) => ({
      time: c.time as Time,
      value: c.volume,
      color: c.close >= c.open ? "rgba(0,255,0,0.3)" : "rgba(255,0,68,0.3)",
    }));

    candleSeries.current.setData(candleData);
    volumeSeries.current.setData(volData);

    // Pattern markers
    if (patterns.length > 0) {
      const markers = patterns.map((p) => ({
        time: p.time as Time,
        position: p.direction === "bullish" ? ("belowBar" as const) : ("aboveBar" as const),
        color: p.direction === "bullish" ? "#00ff00" : "#ff0044",
        shape: p.direction === "bullish" ? ("arrowUp" as const) : ("arrowDown" as const),
        text: p.pattern,
      }));
      candleSeries.current.setMarkers(markers);
    }
  }, [candles, patterns]);

  return (
    <div className="hud-panel" style={{ gridColumn: "span 2" }}>
      <div className="hud-panel-header">
        <span className="hud-panel-dot" data-status="active" />
        <span className="hud-panel-title">{symbol} CHART</span>
        <div style={{ display: "flex", gap: "4px", marginLeft: "auto" }}>
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              style={{
                background: timeframe === tf ? "rgba(0,255,255,0.2)" : "transparent",
                border: `1px solid ${timeframe === tf ? "#00ffff" : "#1a1a1a"}`,
                color: timeframe === tf ? "#00ffff" : "#7a8ba0",
                padding: "2px 6px",
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                cursor: "pointer",
                borderRadius: "2px",
              }}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      <div className="hud-panel-body" style={{ padding: 0 }}>
        <div ref={chartRef} style={{ width: "100%", height: "320px" }} />
      </div>
    </div>
  );
}

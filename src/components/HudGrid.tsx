"use client";

import BrainConsensusPanel from "@/components/panels/BrainConsensusPanel";
import RiskGuardianPanel from "@/components/panels/RiskGuardianPanel";
import CandlestickDNAPanel from "@/components/panels/CandlestickDNAPanel";
import StrategyPanel from "@/components/panels/StrategyPanel";
import NewsPanel from "@/components/panels/NewsPanel";
import ForexMacroPanel from "@/components/panels/ForexMacroPanel";
import CryptoPanel from "@/components/panels/CryptoPanel";
import PDTGuardianPanel from "@/components/panels/PDTGuardianPanel";
import DebatePanel from "@/components/panels/DebatePanel";
import PerformancePanel from "@/components/panels/PerformancePanel";
import BookmapPanel from "@/components/panels/BookmapPanel";
import RegimePanel from "@/components/panels/RegimePanel";
import DepthPanel from "@/components/panels/DepthPanel";
import OrganismPanel from "@/components/panels/OrganismPanel";
import RiskDashPanel from "@/components/panels/RiskDashPanel";
import ExecutionPanel from "@/components/panels/ExecutionPanel";
import SignalPanel from "@/components/panels/SignalPanel";
import CapitalPanel from "@/components/panels/CapitalPanel";
import TimelinePanel from "@/components/panels/TimelinePanel";
import ApiKeysPanel from "@/components/panels/ApiKeysPanel";
import PreflightPanel from "@/components/panels/PreflightPanel";
import CandlestickChart from "@/components/charts/CandlestickChart";
import DepthChart from "@/components/charts/DepthChart";
import MiniChart from "@/components/charts/MiniChart";
import StatusBar from "@/components/StatusBar";

export default function HudGrid() {
  return (
    <>
      {/* Status Bar — always visible at top */}
      <StatusBar />

      <div className="hud-grid">
        {/* Row 0: Live Charts */}
        <div className="hud-grid-section">
          <div className="hud-grid-section-label">LIVE CHARTS</div>
          <div className="hud-grid-row hud-grid-row--charts">
            <CandlestickChart symbol="SPY" />
            <DepthChart symbol="SPY" />
          </div>
        </div>

        {/* Row 1: Core Intelligence */}
        <div className="hud-grid-section">
          <div className="hud-grid-section-label">CORE INTELLIGENCE</div>
          <div className="hud-grid-row">
            <BrainConsensusPanel />
            <SignalPanel />
            <DebatePanel />
          </div>
        </div>

        {/* Row 2: Risk & Compliance */}
        <div className="hud-grid-section">
          <div className="hud-grid-section-label">RISK &amp; COMPLIANCE</div>
          <div className="hud-grid-row">
            <RiskGuardianPanel />
            <RiskDashPanel />
            <PDTGuardianPanel />
          </div>
        </div>

        {/* Row 3: Market Analysis */}
        <div className="hud-grid-section">
          <div className="hud-grid-section-label">MARKET ANALYSIS</div>
          <div className="hud-grid-row">
            <RegimePanel />
            <CandlestickDNAPanel />
            <BookmapPanel />
          </div>
        </div>

        {/* Row 4: Order Flow & Execution */}
        <div className="hud-grid-section">
          <div className="hud-grid-section-label">ORDER FLOW &amp; EXECUTION</div>
          <div className="hud-grid-row">
            <DepthPanel />
            <ExecutionPanel />
            <StrategyPanel />
          </div>
        </div>

        {/* Row 5: External Data with MiniCharts */}
        <div className="hud-grid-section">
          <div className="hud-grid-section-label">EXTERNAL DATA</div>
          <div className="hud-grid-row">
            <div className="hud-panel-with-mini">
              <NewsPanel />
            </div>
            <div className="hud-panel-with-mini">
              <ForexMacroPanel />
              <div className="hud-mini-chart-row">
                <MiniChart symbol="EUR/USD" />
                <MiniChart symbol="GBP/USD" />
              </div>
            </div>
            <div className="hud-panel-with-mini">
              <CryptoPanel />
              <div className="hud-mini-chart-row">
                <MiniChart symbol="BTC" />
                <MiniChart symbol="ETH" />
              </div>
            </div>
          </div>
        </div>

        {/* Row 6: Performance & Capital */}
        <div className="hud-grid-section">
          <div className="hud-grid-section-label">PERFORMANCE &amp; CAPITAL</div>
          <div className="hud-grid-row">
            <div className="hud-panel-with-mini">
              <PerformancePanel />
              <div className="hud-mini-chart-row">
                <MiniChart symbol="SPY" />
                <MiniChart symbol="QQQ" />
              </div>
            </div>
            <CapitalPanel />
            <OrganismPanel />
          </div>
        </div>

        {/* Row 7: Timeline (full width) */}
        <div className="hud-grid-section">
          <div className="hud-grid-section-label">CHALLENGE TIMELINE</div>
          <div className="hud-grid-row">
            <TimelinePanel />
          </div>
        </div>

        {/* Row 8: System Configuration */}
        <div className="hud-grid-section hud-grid-section--config">
          <div className="hud-grid-section-label">SYSTEM CONFIGURATION</div>
          <div className="hud-grid-row">
            <ApiKeysPanel />
            <PreflightPanel />
          </div>
        </div>
      </div>
    </>
  );
}

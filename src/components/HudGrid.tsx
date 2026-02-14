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

export default function HudGrid() {
  return (
    <div className="hud-grid">
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

      {/* Row 5: External Data */}
      <div className="hud-grid-section">
        <div className="hud-grid-section-label">EXTERNAL DATA</div>
        <div className="hud-grid-row">
          <NewsPanel />
          <ForexMacroPanel />
          <CryptoPanel />
        </div>
      </div>

      {/* Row 6: Performance & Capital */}
      <div className="hud-grid-section">
        <div className="hud-grid-section-label">PERFORMANCE &amp; CAPITAL</div>
        <div className="hud-grid-row">
          <PerformancePanel />
          <CapitalPanel />
          <OrganismPanel />
        </div>
      </div>
    </div>
  );
}

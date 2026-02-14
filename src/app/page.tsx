"use client";

import { useCallback } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useAudio } from "@/hooks/useAudio";
import { useAgents } from "@/hooks/useAgents";
import { useMicrophone } from "@/hooks/useMicrophone";
import TopBar from "@/components/TopBar";
import SideHudLeft from "@/components/SideHudLeft";
import SideHudRight from "@/components/SideHudRight";
import Avatar from "@/components/Avatar";
import AgentPanel from "@/components/AgentPanel";
import ChatPanel from "@/components/ChatPanel";
import BottomStrip from "@/components/BottomStrip";
import HudGrid from "@/components/HudGrid";

export default function Home() {
  const {
    connected,
    connectionLabel,
    latency,
    clientCount,
    avatarState,
    systemStatus,
    messages,
    notifications,
    actionLog,
    streamingText,
    isStreaming,
    sendMessage,
    sendQuickAction,
    getUptime,
    wsUrl,
  } = useWebSocket();

  // Initialize audio playback hook
  useAudio();

  // Agent management hook
  const { agents, analyzeAgent } = useAgents();

  // Microphone recording hook
  const { micState, startRecording, stopRecording } = useMicrophone();

  // Toggle mic recording
  const handleMicToggle = useCallback(() => {
    if (micState === "recording") {
      stopRecording();
    } else if (micState === "idle") {
      startRecording();
    }
  }, [micState, startRecording, stopRecording]);

  // Analyze agent handler for AgentPanel (returns full result)
  const handleAgentAnalyze = useCallback(
    async (name: string): Promise<Record<string, unknown> | null> => {
      const result = await analyzeAgent(name);
      return result as Record<string, unknown> | null;
    },
    [analyzeAgent]
  );

  // Quick agent analyze for SideHudRight (fire-and-forget)
  const handleQuickAgentAnalyze = useCallback(
    (name: string) => {
      analyzeAgent(name);
    },
    [analyzeAgent]
  );

  return (
    <>
      <div className="scanlines" />
      <div className="container">
        <TopBar connected={connected} connectionLabel={connectionLabel} />

        <main className="main-content">
          <SideHudLeft
            systemStatus={systemStatus}
            actionLog={actionLog}
            agents={agents}
          />

          <div className="center-panel">
            <Avatar avatarState={avatarState} />
            <AgentPanel
              agents={agents}
              onAnalyze={handleAgentAnalyze}
            />
            <HudGrid />
            <ChatPanel
              messages={messages}
              streamingText={streamingText}
              isStreaming={isStreaming}
              onSend={sendMessage}
              onMicToggle={handleMicToggle}
              micActive={micState === "recording"}
              micState={micState}
            />
          </div>

          <SideHudRight
            notifications={notifications}
            onQuickAction={sendQuickAction}
            onAgentAnalyze={handleQuickAgentAnalyze}
          />
        </main>

        <BottomStrip
          wsUrl={wsUrl}
          clientCount={clientCount}
          latency={latency}
          getUptime={getUptime}
        />
      </div>
    </>
  );
}

"use client";

import { useWebSocket } from "@/hooks/useWebSocket";
import { useAudio } from "@/hooks/useAudio";
import TopBar from "@/components/TopBar";
import SideHudLeft from "@/components/SideHudLeft";
import SideHudRight from "@/components/SideHudRight";
import Avatar from "@/components/Avatar";
import ChatPanel from "@/components/ChatPanel";
import BottomStrip from "@/components/BottomStrip";

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

  return (
    <>
      <div className="scanlines" />
      <div className="container">
        <TopBar connected={connected} connectionLabel={connectionLabel} />

        <main className="main-content">
          <SideHudLeft
            systemStatus={systemStatus}
            actionLog={actionLog}
          />

          <div className="center-panel">
            <Avatar avatarState={avatarState} />
            <ChatPanel
              messages={messages}
              streamingText={streamingText}
              isStreaming={isStreaming}
              onSend={sendMessage}
            />
          </div>

          <SideHudRight
            notifications={notifications}
            onQuickAction={sendQuickAction}
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

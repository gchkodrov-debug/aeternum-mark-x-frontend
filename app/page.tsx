"use client";

import { useWebSocket } from "@/hooks/useWebSocket";
import { useAudio } from "@/hooks/useAudio";
import TopBar from "@/components/TopBar";
import BottomBar from "@/components/BottomBar";
import Avatar from "@/components/Avatar";
import SystemStatus from "@/components/SystemStatus";
import NotificationsPanel from "@/components/NotificationsPanel";
import ChatPanel from "@/components/ChatPanel";

export default function Home() {
  const {
    connected,
    messages,
    avatarState,
    systemStatus,
    actionLog,
    notifications,
    latency,
    clientCount,
    sendMessage,
  } = useWebSocket();

  useAudio();

  return (
    <>
      <div className="scanlines" />
      <div className="container">
        <TopBar connected={connected} />

        <div className="main-content">
          <SystemStatus status={systemStatus} actionLog={actionLog} />

          <main className="center-panel">
            <Avatar state={avatarState} />
            <ChatPanel messages={messages} onSend={sendMessage} />
          </main>

          <NotificationsPanel
            notifications={notifications}
            onQuickAction={sendMessage}
          />
        </div>

        <BottomBar latency={latency} clientCount={clientCount} />
      </div>
    </>
  );
}

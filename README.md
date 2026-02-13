# AETERNUM MARK X — Frontend

Jarvis-style HUD command interface for the Aeternum Mark X private AI system.

Built with **Next.js 14**, **TypeScript**, and **React 18**. Designed for deployment on **Vercel**.

## Architecture

This is a **thin client** — all heavy logic (LLM inference, STT/TTS, trading strategies, memory, RAG) runs on a private VPS backend. The frontend communicates exclusively via WebSocket and optional REST API.

```
┌─────────────────────┐         WebSocket          ┌──────────────────────┐
│   Vercel (Frontend)  │ ◄──────────────────────► │  Private VPS (Backend) │
│   Next.js / React    │                           │  Python / FastAPI      │
│   Static + Client    │                           │  LLM, STT, TTS, RAG   │
└─────────────────────┘                           └──────────────────────┘
```

## Quick Start

```bash
# Clone
git clone https://github.com/gchkodrov-debug/aeternum-mark-x-frontend.git
cd aeternum-mark-x-frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your WebSocket URL

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_WS_URL` | Yes | `ws://localhost:8765` | WebSocket endpoint for backend communication |
| `NEXT_PUBLIC_API_BASE` | No | — | Optional REST API base URL |

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

## Deploy on Vercel

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → Import Project
3. Connect your GitHub repository
4. Set environment variables:
   - `NEXT_PUBLIC_WS_URL` = your backend WebSocket URL (e.g. `wss://your-vps.com/ws`)
5. Deploy

> **Important**: Your VPS must serve WebSocket over WSS (TLS) to avoid mixed-content blocks when the frontend is served over HTTPS. Use Nginx as a reverse proxy with Let's Encrypt.

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main HUD page (client component)
│   └── globals.css         # Full HUD styling
├── components/
│   ├── TopBar.tsx          # Logo, connection status, clock
│   ├── SideHudLeft.tsx     # System status + action log
│   ├── SideHudRight.tsx    # Notifications + quick actions
│   ├── CenterRing.tsx      # Animated avatar rings
│   ├── Avatar.tsx          # Avatar section wrapper
│   ├── ChatPanel.tsx       # Chat messages display
│   ├── CommandInput.tsx    # Input with send/mic buttons
│   ├── StatusLine.tsx      # Streaming indicator
│   ├── BottomStrip.tsx     # Footer with connection info
│   └── BrainCoreLabel.tsx  # Reserved placeholder
├── hooks/
│   ├── useWebSocket.ts     # WebSocket connection + state management
│   └── useAudio.ts         # TTS audio playback
└── utils/
    └── sanitize.ts         # Input sanitization (XSS prevention)
```

## Security

- **No API keys or secrets** in this repository
- All sensitive logic runs on the private VPS backend
- User input is sanitized (HTML stripped, 5000 char limit)
- `.env.local` is git-ignored

## License

Private — All rights reserved.

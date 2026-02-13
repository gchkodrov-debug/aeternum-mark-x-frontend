# ◆ AETERNUM MARK X — Frontend (Vercel)

> Jarvis-style AI Trading HUD — **display layer only**.  
> All intelligence (LLM, STT, TTS, RAG, Trading Engine) stays on your **private backend/VPS**.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)

---

## Architecture

```
┌─────────────────────────┐         WebSocket / HTTPS         ┌──────────────────────────┐
│   Vercel (Frontend)     │ ◄──────────────────────────────► │   Your VPS (Backend)     │
│                         │                                   │                          │
│  • Next.js React App    │    wss://your-vps.com/ws          │  • main.py orchestrator  │
│  • HUD Display          │    text, audio, avatar state      │  • Ollama LLM + RAG      │
│  • WebSocket Client     │                                   │  • Vosk STT              │
│  • TTS Audio Playback   │                                   │  • Piper TTS             │
│  • No secrets/logic     │                                   │  • Trading Engine        │
│                         │                                   │  • IBKR Gateway          │
└─────────────────────────┘                                   └──────────────────────────┘
```

---

## Quick Deploy to Vercel

### 1. Push to GitHub
This repo should be on GitHub (public or private).

### 2. Connect to Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import this GitHub repository
3. Framework Preset: **Next.js** (auto-detected)

### 3. Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Example |
|---|---|---|
| `NEXT_PUBLIC_WS_URL` | Your backend WebSocket URL | `wss://your-vps.com/ws` |
| `NEXT_PUBLIC_API_BASE` | (Optional) REST API base | `https://your-vps.com` |

### 4. Deploy
Click **Deploy**. Done.

---

## Local Development

```bash
# Install dependencies
npm install

# Copy env template
cp .env.example .env.local

# Edit .env.local with your backend URL
# NEXT_PUBLIC_WS_URL=ws://localhost:8765

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
aeternum-mark-x-frontend/
├── app/
│   ├── layout.tsx          # Root layout + Google Fonts
│   ├── page.tsx            # Main HUD page (client component)
│   └── globals.css         # Full HUD styling
├── components/
│   ├── TopBar.tsx          # Connection status + clock
│   ├── BottomBar.tsx       # WS URL, latency, uptime
│   ├── Avatar.tsx          # Animated avatar with state rings
│   ├── ChatPanel.tsx       # Chat messages + input
│   ├── SystemStatus.tsx    # Left panel: LLM/STT/TTS status
│   └── NotificationsPanel.tsx  # Right panel + quick actions
├── hooks/
│   ├── useWebSocket.ts     # WebSocket connection + state management
│   └── useAudio.ts         # TTS audio playback from base64
├── public/                 # Static assets
├── package.json
├── next.config.js
├── tsconfig.json
├── .env.example
└── .gitignore
```

---

## WebSocket Protocol

The frontend expects these message types from the backend:

| Type | Direction | Payload |
|---|---|---|
| `text_input` | Client → Server | `{ type, text }` |
| `message` | Server → Client | `{ type, role, text }` |
| `text_chunk` | Server → Client | `{ type, chunk }` (streaming) |
| `audio` | Server → Client | `{ type, data, format }` (base64) |
| `avatar_state` | Server → Client | `{ type, state }` (idle/listening/thinking/speaking) |
| `system_status` | Server → Client | `{ type, status: { llm, stt, tts, memory, backend, rag } }` |
| `action_result` | Server → Client | `{ type, action, result, success }` |
| `notification` | Server → Client | `{ type, message, level }` |
| `ping` / `pong` | Bidirectional | Latency measurement |

---

## Backend Requirements

Your VPS backend must:
1. Run the WebSocket server (default port 8765)
2. Accept connections from the Vercel domain
3. Handle CORS/WSS if using HTTPS on Vercel
4. Optionally use nginx/caddy as reverse proxy with SSL

### Example nginx config for WSS:
```nginx
server {
    listen 443 ssl;
    server_name your-vps.com;

    ssl_certificate /etc/letsencrypt/live/your-vps.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-vps.com/privkey.pem;

    location /ws {
        proxy_pass http://127.0.0.1:8765;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## Security

- **No secrets on Vercel** — all API keys, broker credentials, and trading logic remain on your VPS
- **No LLM/STT/TTS code** — frontend is display-only
- **WebSocket only** — no server-side API routes that touch trading
- Environment variables prefixed with `NEXT_PUBLIC_` are client-visible (this is expected — they only contain the WebSocket URL)

---

## License

Private — AETERNUM Trading System

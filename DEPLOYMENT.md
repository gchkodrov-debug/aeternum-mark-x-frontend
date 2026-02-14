# Aeternum Mark X — Deployment Guide

## Architecture

```
┌─────────────────────┐         ┌─────────────────────────┐
│   Frontend (Vercel)  │  HTTPS  │   Backend (VPS)          │
│   Next.js 14         │◄───────►│   FastAPI + Python       │
│   Static + SSR       │         │   Nginx (reverse proxy)  │
│                      │         │   Let's Encrypt SSL      │
└─────────────────────┘         └─────────────────────────┘
```

- **Frontend** (Next.js) → Vercel (CDN, edge, auto-scaling)
- **Backend** (Python FastAPI) → VPS (Ubuntu/Debian, full control)

## Frontend Deployment (Vercel)

### Steps
1. Push to GitHub (`aeternum-mark-x-frontend`)
2. Connect repo to Vercel at [vercel.com/new](https://vercel.com/new)
3. Set environment variables in **Vercel Dashboard > Settings > Environment Variables**:
   - `NEXT_PUBLIC_API_BASE` = `https://your-vps-domain.com`
   - `NEXT_PUBLIC_WS_URL` = `wss://your-vps-domain.com/ws`
4. Deploy — Vercel auto-detects Next.js and builds

### Preview Deployments
- Every PR gets a unique preview URL
- Preview URLs are automatically allowed by the backend CORS wildcard (`https://*.vercel.app`)

### Custom Domain
1. Add domain in Vercel Dashboard > Settings > Domains
2. Update `CORS_ALLOWED_ORIGINS` on the backend to include the custom domain

## Backend Deployment (VPS)

### Prerequisites
- Ubuntu 22.04+ or Debian 12+
- Python 3.11+
- Nginx
- Certbot (Let's Encrypt)

### Steps

1. **SSH into VPS**
   ```bash
   ssh root@your-vps-ip
   ```

2. **Clone backend repo**
   ```bash
   git clone https://github.com/your-org/aeternum-mark-x-backend.git
   cd aeternum-mark-x-backend/backend-python
   ```

3. **Set up Python environment**
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

4. **Configure environment**
   ```bash
   cp .env.example .env
   nano .env
   ```
   Or use the dashboard ApiKeysPanel after first start to configure keys.

5. **Set production variables in `.env`**
   ```env
   AETERNUM_ENV=production
   CORS_ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app,https://your-custom-domain.com
   ```

6. **Run with systemd**
   ```bash
   sudo cp systemd/aeternum.service /etc/systemd/system/
   sudo systemctl daemon-reload
   sudo systemctl enable aeternum
   sudo systemctl start aeternum
   ```

7. **Configure Nginx reverse proxy**
   ```nginx
   server {
       listen 443 ssl;
       server_name your-vps-domain.com;

       ssl_certificate /etc/letsencrypt/live/your-vps-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-vps-domain.com/privkey.pem;

       location / {
           proxy_pass http://127.0.0.1:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }

       location /ws {
           proxy_pass http://127.0.0.1:8765;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection "upgrade";
           proxy_set_header Host $host;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }

   server {
       listen 80;
       server_name your-vps-domain.com;
       return 301 https://$host$request_uri;
   }
   ```

8. **SSL with Let's Encrypt**
   ```bash
   sudo certbot --nginx -d your-vps-domain.com
   ```

## API Key Management

- All API keys are managed through the dashboard **ApiKeysPanel**
- Keys are stored in `.env` on the VPS — **never on Vercel**
- Keys persist across restarts and redeploys
- Automatic backups created on every key change (last 5 kept)
- Backups can be listed and restored via the API:
  - `GET /api/aeternum/keys/backups`
  - `POST /api/aeternum/keys/restore`

## Security

- API key endpoints require HTTPS in production (enforced by middleware)
- Keys are masked in all API responses (last 4 chars only)
- Frontend never stores or caches API keys
- CORS restricts access to configured domains only
- Security headers set via `vercel.json` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy)

## Pre-Flight & Live Gate

- **Pre-Flight Check** (`GET /api/aeternum/preflight`): Validates all system components
- **Live Gate** (`GET /api/aeternum/preflight/live-gate`): Hard gate for live trading
  - Requires: 2+ market data sources, IBKR Gateway, 1+ AI service
  - Returns blockers list with specific remediation steps
  - System defaults to SIMULATION mode until all blockers resolved

## Monitoring

- Health endpoint: `GET /api/aeternum/health`
- Prometheus metrics: `GET /healthz`, `/metrics`
- Backend StatusBar shows real-time latency and connection quality
- Systemd health timers for automated monitoring

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Frontend can't reach backend | Check `NEXT_PUBLIC_API_BASE` in Vercel env vars |
| CORS errors | Add frontend domain to `CORS_ALLOWED_ORIGINS` in backend `.env` |
| API key endpoints return 403 | Ensure Nginx sets `X-Forwarded-Proto https` header |
| WebSocket disconnects | Check Nginx `proxy_read_timeout` (increase to 3600s) |
| Pre-flight NO-GO | Run pre-flight check to see specific blockers |

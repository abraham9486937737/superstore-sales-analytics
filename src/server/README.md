# Feedback Server Setup

## Prerequisites
- Node.js 18+

## Quick start

```bash
cd src/server
cp .env.example .env
# Edit .env and fill in your Gmail App Password
npm install
npm start
```

## Gmail App Password

1. Go to [Google Account → Security → App passwords](https://myaccount.google.com/apppasswords)
2. Create an app password for "Mail"
3. Paste the 16-character password into `.env` as `EMAIL_PASS`

> **Never commit `.env`** — it contains credentials.

## Endpoints

| Method | Path           | Description                    |
|--------|----------------|--------------------------------|
| GET    | `/api/health`  | Server health check            |
| POST   | `/api/feedback`| Send feedback email            |

### POST `/api/feedback` body

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Your feedback text here"
}
```

## Running alongside the frontend

During development, start both:

```bash
# Terminal 1 — frontend (Vite dev server with /api proxy)
cd src/frontend && npm run dev

# Terminal 2 — backend (Express feedback server)
cd src/server && npm start
```

The Vite dev server proxies `/api/*` requests to `http://localhost:3001` automatically.

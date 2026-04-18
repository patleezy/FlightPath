# FlightPath Web App MVP

Web-only flight status MVP with:
- Flight search by number + date
- Live status timeline + map
- Airport arrivals/departures board
- Weather disruption context
- Local tracked flights and in-app status-change alerts

## Project layout

- `frontend/` React + TypeScript + Vite
- `backend/` Express + TypeScript provider-based API proxy

## Run locally

1. Install Node.js 20+ (required).
2. Install dependencies:
   - `cd backend && npm install`
   - `cd ../frontend && npm install`
3. Configure backend env:
   - `cd backend && cp .env.example .env`
   - edit `.env` and set `AVIATIONSTACK_API_KEY` (free key from [aviationstack.com](https://aviationstack.com/))
4. Run backend:
   - `cd backend && npm run dev`
5. Run frontend:
   - `cd frontend && npm run dev`
6. Open `http://localhost:5173`.

Backend listens on `http://localhost:4000`.

## API endpoints

- `GET /api/flights/search?flightNumber=UA123&date=2026-04-18`
- `GET /api/flights/:id`
- `GET /api/airports/:iata/board`
- `GET /api/weather/:iata`

## Notes

- Flight provider uses Aviationstack free API when `AVIATIONSTACK_API_KEY` is set.
- If API key is missing or rate-limited, backend falls back to deterministic sample flight data so the app remains usable.
- Provider interfaces are designed so you can swap in a paid aviation API later without changing frontend contracts.
- Set `ALLOWED_ORIGINS` to trusted frontend URLs only.

## Accessibility and Security Baseline

- WCAG-focused updates:
  - Skip-to-content link
  - Form labels and improved assistive text
  - Visible keyboard focus states
  - Reduced motion support via `prefers-reduced-motion`
  - Light/dark theme contrast-aware tokens
- OWASP-focused updates:
  - Restrictive CORS allowlist (`ALLOWED_ORIGINS`)
  - Basic rate limiting (`RATE_LIMIT_PER_MINUTE`)
  - Security headers (CSP, frame deny, nosniff, referrer policy, permissions policy)
  - JSON body-size limit to reduce abuse surface

These changes substantially improve posture, but formal WCAG/OWASP compliance still requires automated scans + manual audits in your deployment environment.

## Preview checklist

- Backend health: open `http://localhost:4000/health` and confirm `{"ok":true}`
- Flight search: on home page search `UA123` with today's date
- Airport board: open `SFO` board from home page
- Track flight: click `Track Flight` on detail page and verify it appears on home page
- Alerts: keep the home page open; tracked flights refresh and show in-app status-change alerts

## Connect to GitHub

1. Create an empty GitHub repo (no README/license).
2. In terminal:
   - `cd /Users/patricklee/flight-status-web-app`
   - `git init`
   - `git add .`
   - `git commit -m "Initial Flight Status MVP"`
   - `git branch -M main`
   - `git remote add origin https://github.com/<your-username>/<repo-name>.git`
   - `git push -u origin main`

## Deploy to Vercel (multi-service)

- This repo uses root `vercel.json` with `experimentalServices`:
  - `frontend` served at `/`
  - `backend` served at `/_backend`
- In Vercel, import the repository root (`flight-status-web-app`) as one project.
- Frontend API defaults to `/_backend/api` in production, so no extra frontend env var is required.

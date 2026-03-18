# Pavitra Jyotish - Production Astrology Web App

Production-ready full-stack astrology application with React frontend, Supabase backend services, AstrologyAPI integration, and Hostinger VPS deployment support.

## Tech Stack

- Frontend: React + Vite + React Router
- Backend API Layer: Node.js + Express
- Auth + Database: Supabase (PostgreSQL + Auth)
- External Astrology API: AstrologyAPI (Basic Authentication)
- SEO: React Helmet (meta tags + Open Graph + JSON-LD schema)

## Features Implemented

- Template-faithful UI conversion from the base HTML design
- Fully responsive layout (mobile/tablet/desktop)
- Signup, login, logout using Supabase Auth
- Protected dashboard and feature pages
- Endpoint-driven astrology proxy (`/api/astrology/:feature`)
- Integrated AstrologyAPI endpoints:
  - `birth_details`
  - `astro_details`
  - `planets`
  - `horo_chart/D1`
  - `horo_chart_image/D1`
  - `current_vdasha`
  - `match_ashtakoot_points`
  - `basic_panchang`
  - `geo_details`
  - `timezone_with_dst`
- Secure backend proxy with server-side API key usage
- Supabase report persistence:
  - `users`
  - `horoscope_reports`
  - `kundali_reports`
  - `panchang_history`
  - `match_results`
- Loading states and API error handling
- SEO optimized pages with canonical, OG, Twitter, and structured schema

## Project Structure

```
app/
	server/
		index.js
		middleware/
			authMiddleware.js
		services/
			astrologyApiService.js
	src/
		api/
			httpClient.js
			astrologyApi.js
		components/
			common/
			layout/
		hooks/
			useAuth.js
			useLanguage.js
		pages/
			DashboardPage.jsx
			HomePage.jsx
			HoroscopePage.jsx
			KundaliPage.jsx
			LoginPage.jsx
			MatchPage.jsx
			NotFoundPage.jsx
			PanchangPage.jsx
			SignupPage.jsx
		services/
			authService.js
			reportService.js
			supabaseClient.js
		utils/
			constants.js
	supabase/
		schema.sql
```

## Environment Configuration

Environment file is already prepared at:

- `.env`
- `.env.example`

If needed, update values in `.env`:

```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_PROJECT_ID=...

VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_API_BASE_URL=
VITE_SITE_URL=https://pavitrajyotish.com

ASTROLOGY_API_USER_ID=651029
ASTROLOGY_API_KEY=...
ASTROLOGY_API_BASE_URL=https://json.astrologyapi.com/v1
ASTROLOGY_API_LANGUAGE=en

PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
```

## Supabase Database Setup

1. Open Supabase SQL Editor.
2. Run the SQL in `supabase/schema.sql`.
3. Verify all tables and policies are created.

## Local Development

Install dependencies:

```bash
npm install
```

Run frontend + backend together:

```bash
npm run dev:full
```

Default endpoints:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

## Production Build

```bash
npm run build
```

Start production server (serves `dist` + `/api/*`):

```bash
npm run start
```

## Hostinger VPS Deployment Guide

1. SSH into your VPS.
2. Install Node.js 20+ and Nginx.
3. Upload project folder to VPS (for example `/var/www/pavitra-jyotish`).
4. Install dependencies:

```bash
cd /var/www/pavitra-jyotish/app
npm install
```

5. Create production env file (`.env`) with server and API keys.
6. Build app:

```bash
npm run build
```

7. Run app with PM2:

```bash
npm install -g pm2
pm2 start server/index.js --name pavitra-jyotish
pm2 save
pm2 startup
```

8. Configure Nginx reverse proxy:

```nginx
server {
		listen 80;
		server_name your-domain.com;

		location / {
				proxy_pass http://127.0.0.1:4000;
				proxy_http_version 1.1;
				proxy_set_header Upgrade $http_upgrade;
				proxy_set_header Connection 'upgrade';
				proxy_set_header Host $host;
				proxy_cache_bypass $http_upgrade;
		}
}
```

9. Enable HTTPS (recommended) with Certbot.

## API Security Notes

- AstrologyAPI credentials are used only on backend (`server/*`).
- Frontend never exposes client secret.
- Backend validates Supabase JWT before calling AstrologyAPI endpoints.

## Scripts

- `npm run dev` - frontend only
- `npm run dev:server` - backend only
- `npm run dev:full` - frontend + backend
- `npm run build` - production build
- `npm run start` - production server
- `npm run lint` - lint code

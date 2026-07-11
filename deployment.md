# JWTLab Deployment Guide

## Deploy to Render (Recommended)

### One-Click Deploy

1. Push your code to GitHub (already done)
2. Go to [render.com](https://render.com) and sign up / log in
3. Click **New +** > **Blueprint**
4. Select your `secureVault` repo
5. Render detects `render.yaml` and provisions everything:
   - A **free PostgreSQL** database (`jwtlab-db`)
   - A **free Web Service** (`jwtlab`)
6. After the service is created, go to **Environment** tab and set:
   - `CORS_ORIGIN` = your Render URL (e.g. `https://jwtlab.onrender.com`)
7. The service will auto-deploy. First deploy takes ~2-3 minutes.

### After First Deploy — Seed the Database

Render doesn't run the seed script automatically. After the first successful deploy:

1. Go to your **jwtlab** service > **Shell** tab
2. Run:
   ```bash
   node src/database/seed.js
   ```
3. This populates the achievements table.

### Environment Variables (set automatically by render.yaml)

| Variable | Source | Notes |
|---|---|---|
| `NODE_ENV` | Hardcoded `production` | Enables static file serving |
| `DB_HOST` | From `jwtlab-db` | Auto-linked |
| `DB_PORT` | From `jwtlab-db` | Auto-linked |
| `DB_NAME` | From `jwtlab-db` | Auto-linked |
| `DB_USER` | From `jwtlab-db` | Auto-linked |
| `DB_PASSWORD` | From `jwtlab-db` | Auto-linked |
| `JWT_SECRET` | Auto-generated | Render creates a random secret |
| `JWT_EXPIRES_IN` | Hardcoded `7d` | Token expiry |
| `CORS_ORIGIN` | **You set this** | Your Render URL with `https://` |

### Manual Deploy (if not using Blueprint)

If you prefer manual setup instead of `render.yaml`:

1. Create a **PostgreSQL** database on Render (free tier)
2. Create a **Web Service** with:
   - **Build Command:** `cd server && npm install && cd ../client && npm install && npm run build`
   - **Start Command:** `cd server && node src/index.js`
   - **Environment:** Node
3. Add all env vars from the table above manually

### Updating the App

Render auto-deploys on every push to `main`. Just push:

```bash
git push origin main
```

---

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm 9+

### Database Setup

```bash
createdb securevault
psql -U postgres -d securevault -f schema.sql
cd server && node src/database/seed.js
```

### Environment Variables

Create `server/.env`:

```env
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=securevault
DB_PASSWORD=<your-secure-password>
DB_PORT=5432
JWT_SECRET=<generate-a-strong-random-secret>
JWT_EXPIRES_IN=24h
CORS_ORIGIN=http://localhost:5173
```

### Run

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Render deploy fails | Check build logs; ensure `render.yaml` is at repo root |
| Database connection error | Verify the DB is linked in Render dashboard > Environment |
| `jwtlab-db` not found | Create the database first, then link it to the web service |
| Blank page on deploy | Set `CORS_ORIGIN` to your Render URL in env vars |
| Seed script not run | Run `node src/database/seed.js` in Render Shell after first deploy |
| Labs not loading | Ensure `server/labs/` directory is committed to git |
| Port already in use locally | Change `PORT` in `server/.env` |

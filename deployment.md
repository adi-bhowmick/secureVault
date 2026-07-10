# JWTLab Deployment Guide

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm 9+

---

## 1. Database Setup

```bash
# Create the database
createdb securevault

# Run the schema
psql -U postgres -d securevault -f schema.sql

# Seed achievements
cd server
node src/database/seed.js
```

## 2. Server Environment Variables

Create `server/.env` (do **not** commit this file):

```env
PORT=5000
DB_USER=postgres
DB_HOST=localhost
DB_NAME=securevault
DB_PASSWORD=<your-secure-password>
DB_PORT=5432
JWT_SECRET=<generate-a-strong-random-secret>
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://yourdomain.com
```

Generate a strong JWT secret:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 3. Install Dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

## 4. Development

```bash
# Terminal 1 — Server
cd server && npm run dev

# Terminal 2 — Client
cd client && npm run dev
```

The Vite dev server proxies `/api` requests to `localhost:5000`.

## 5. Production Build

```bash
# Build the client
cd client && npm run build

# The output is in client/dist/
```

## 6. Production Server

Serve the client build from Express:

```js
// Add to server/src/index.js
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// After app.use('/api', router):
app.use(express.static(path.join(__dirname, '../../client/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
});
```

Then start with:

```bash
cd server && npm start
```

## 7. Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 8. Production Security Checklist

Before deploying, address these items:

| Item | Action |
|---|---|
| **JWT Secret** | Replace `your_jwt_secret_key_here` with a strong random value (see step 2) |
| **CORS** | Set `CORS_ORIGIN` env var to your production domain (e.g. `https://yourdomain.com`) |
| **Rate Limiting** | Add `express-rate-limit` to auth and flag submission endpoints |
| **Security Headers** | Add `helmet` middleware: `app.use(helmet())` |
| **HTTPS** | Use Let's Encrypt or your provider's SSL certificate |
| **DB Credentials** | Use a strong password; never use defaults in production |
| **.env** | Ensure `.env` is not committed to git; rotate credentials if it was |

## 9. Optional: Docker

```dockerfile
# Dockerfile (root)
FROM node:18-alpine AS builder
WORKDIR /app
COPY client/package*.json ./client/
RUN cd client && npm ci
COPY client/ ./client/
RUN cd client && npm run build

FROM node:18-alpine
WORKDIR /app
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev
COPY server/ ./server/
COPY --from=builder /app/client/dist ./client/dist
COPY schema.sql ./schema.sql
EXPOSE 5000
CMD ["node", "server/src/index.js"]
```

## 10. Database Migrations

For schema changes in the future, create migration files in a `server/migrations/` directory and apply them in order. The current schema is in `schema.sql` at the project root.

## Troubleshooting

| Issue | Fix |
|---|---|
| `ECONNREFUSED` on startup | Ensure PostgreSQL is running and credentials in `.env` are correct |
| `JWT_SECRET is not defined` | Add `JWT_SECRET` to `server/.env` |
| Client build fails | Run `cd client && npm install` first |
| Labs not loading | Ensure `server/labs/` directory exists with valid `config.json` files |
| Port already in use | Change `PORT` in `server/.env` or stop the conflicting process |

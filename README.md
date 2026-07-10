# JWTLab

An interactive platform for learning JSON Web Token (JWT) security.

JWTLab combines educational content, interactive labs, and JWT developer tools to help users understand how JWT authentication works and how common implementation mistakes introduce vulnerabilities.

> This is **not** an attack framework. It is an educational cybersecurity platform.

## Features

### JWT Tools

- **JWT Decoder** — Decode any JWT token into header, payload, and signature
- **JWT Generator** — Create custom JWT tokens with editable headers and payloads
- **JWT Verifier** — Verify HMAC-SHA256 signatures against a secret key
- **Token Inspector** — Analyze token security with risk scoring

### Interactive Labs

| Lab | Difficulty | Category |
|-----|-----------|----------|
| Weak Secret | Easy | Secret Cracking |
| Expired Token | Easy | Token Validation |
| Payload Tampering | Medium | Signature Bypass |
| Role Escalation | Medium | Privilege Escalation |
| Signature Verification | Hard | Algorithm Confusion |

### Gamification

- XP and leveling system
- Achievement badges
- Leaderboard rankings
- Progress tracking

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, TailwindCSS, React Router, Axios, Framer Motion |
| Backend | Express, Node.js, PostgreSQL, JWT, bcrypt |
| Database | PostgreSQL 15+ with pgcrypto |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd secureVault

# Create the database
sudo -u postgres psql -c "CREATE DATABASE securevault;"

# Run the schema
sudo -u postgres psql -d securevault -f schema.sql

# Install server dependencies
cd server
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your PostgreSQL password

# Seed achievements
node src/database/seed.js

# Start the server
npm run dev

# In a new terminal, install client dependencies
cd ../client
npm install

# Start the client
npm run dev
```

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `DB_USER` | PostgreSQL user | postgres |
| `DB_HOST` | Database host | localhost |
| `DB_NAME` | Database name | securevault |
| `DB_PASSWORD` | PostgreSQL password | — |
| `DB_PORT` | Database port | 5432 |
| `JWT_SECRET` | JWT signing secret | — |
| `JWT_EXPIRES_IN` | Token expiration | 24h |

## Project Structure

```
secureVault/
├── client/                    # React frontend
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── pages/             # Route pages
│       ├── layouts/           # Layout components
│       ├── context/           # React context
│       ├── hooks/             # Custom hooks
│       ├── services/          # API services
│       └── assets/            # Static assets
├── server/                    # Express backend
│   └── src/
│       ├── controllers/       # Request handlers
│       ├── routes/            # API routes
│       ├── services/          # Business logic
│       ├── repositories/      # Database queries
│       ├── middleware/        # Express middleware
│       ├── validators/        # Input validation
│       ├── database/          # DB config and seeds
│       ├── engine/            # Lab engine
│       └── utils/             # Utilities
├── schema.sql                 # Database schema
└── agents.md                  # Agent instructions
```

## API Endpoints

See [API.md](docs/API.md) for complete API documentation.

### Auth

- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login with email and password

### Labs

- `GET /api/labs` — List all labs
- `GET /api/labs/:slug` — Get lab details
- `POST /api/labs/:slug/submit` — Submit a flag (auth required)

### Achievements

- `GET /api/achievements` — List all achievements
- `GET /api/achievements/mine` — Get user achievements (auth required)
- `GET /api/achievements/leaderboard` — Get leaderboard
- `GET /api/achievements/stats` — Get user stats (auth required)

## License

MIT

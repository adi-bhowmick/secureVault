# Architecture

JWTLab follows a clean separation of concerns with a layered architecture.

## Backend Architecture

```
Request → Controller → Service → Repository → Database
```

### Layers

**Controllers** handle HTTP requests and responses.
- Read request data
- Validate input
- Call services
- Return formatted responses
- Never write SQL or contain business logic
- Target: < 75 lines

**Services** contain business logic.
- Authentication and authorization
- JWT generation and verification
- Lab engine logic
- Progress and achievement calculations
- Must not know about Express

**Repositories** handle database operations.
- SQL queries only
- One repository per table
- Return plain objects

**Middleware** handles cross-cutting concerns.
- Authentication (JWT verification)
- Validation (express-validator)
- Error handling
- Logging

### Data Flow

```
Client Request
     ↓
Express Router
     ↓
Middleware (auth, validation)
     ↓
Controller
     ↓
Service
     ↓
Repository
     ↓
PostgreSQL
```

---

## Frontend Architecture

```
Route → Page → Components + Hooks + Services
```

### Layers

**Pages** compose features for a route.
- One page per route
- Handles data fetching
- Composes components

**Components** are reusable UI elements.
- Presentational or container
- Receive props
- No direct API calls

**Services** handle HTTP requests only.
- Axios instance with interceptors
- Token attachment
- Error normalization

**Context** manages global state.
- Authentication state
- User data
- Login/logout

### State Flow

```
User Action
     ↓
Component
     ↓
Context/Service
     ↓
API (Axios)
     ↓
Backend
```

---

## Lab Architecture

Labs are dynamically loaded from the filesystem.

```
server/labs/
├── weak-secret/
│   ├── config.json      # Metadata (name, difficulty, points)
│   ├── flag.txt          # Expected flag
│   ├── explanation.md    # Educational content
│   └── solution.md       # Step-by-step solution
├── expired-token/
│   └── ...
└── ...
```

### Lab Engine

```
Filesystem → Lab Engine → Lab Service → Lab Controller → API
```

1. On startup, `labService.init()` scans `server/labs/`
2. Each directory with `config.json` is loaded
3. Labs are cached in memory
4. API endpoints serve lab data dynamically

### Adding a New Lab

1. Create a directory: `server/labs/my-lab/`
2. Add `config.json`:

```json
{
  "name": "My Lab",
  "description": "Lab description",
  "difficulty": "Easy",
  "category": "Category",
  "points": 100
}
```

3. Add `flag.txt` with the expected flag
4. Add `explanation.md` and `solution.md`
5. Restart the server

---

## Database Schema

See `schema.sql` for the full schema.

### Tables

| Table | Purpose |
|-------|---------|
| users | User accounts and stats |
| user_progress | Lab completion tracking |
| lab_attempts | Flag submission history |
| achievements | Achievement definitions |
| user_achievements | Earned achievements |
| audit_logs | Action logging |

### Key Relationships

```
users 1:N user_progress
users 1:N lab_attempts
users 1:N user_achievements
users 1:N audit_logs
```

---

## Security

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with configurable expiration
- API endpoints protected with Bearer token auth
- Input validation with express-validator
- CORS configured for development
- Environment variables for secrets

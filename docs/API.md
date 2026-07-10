# API Documentation

Base URL: `http://localhost:5000/api`

## Response Format

All endpoints return:

```json
{
  "success": true,
  "message": "",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "",
  "errors": []
}
```

---

## Authentication

### Register

```
POST /api/auth/register
```

**Body:**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| username | string | yes | 3-40 chars, alphanumeric + underscore |
| email | string | yes | Valid email |
| password | string | yes | Minimum 8 characters |

**Response (201):**

```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "xp": 0,
      "level": 1,
      "total_points": 0,
      "labs_completed": 0
    },
    "token": "jwt_token"
  }
}
```

**Errors:**
- 400: Validation failed
- 409: Email/username already taken

---

### Login

```
POST /api/auth/login
```

**Body:**

| Field | Type | Required |
|-------|------|----------|
| email | string | yes |
| password | string | yes |

**Response (200):**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "xp": 0,
      "level": 1,
      "total_points": 0,
      "labs_completed": 0
    },
    "token": "jwt_token"
  }
}
```

**Errors:**
- 401: Invalid credentials

---

## Labs

### List Labs

```
GET /api/labs
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "labs": [
      {
        "slug": "weak-secret",
        "name": "Weak Secret",
        "description": "string",
        "difficulty": "Easy",
        "category": "Secret Cracking",
        "points": 100
      }
    ]
  }
}
```

---

### Get Lab

```
GET /api/labs/:slug
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "lab": {
      "slug": "weak-secret",
      "name": "Weak Secret",
      "description": "string",
      "difficulty": "Easy",
      "category": "Secret Cracking",
      "points": 100,
      "explanation": "markdown"
    }
  }
}
```

**Errors:**
- 404: Lab not found

---

### Submit Flag

```
POST /api/labs/:slug/submit
Authorization: Bearer <token>
```

**Body:**

| Field | Type | Required |
|-------|------|----------|
| flag | string | yes |
| timeTaken | number | no (seconds) |

**Response (200):**

```json
{
  "success": true,
  "message": "Correct! Points awarded.",
  "data": {
    "points": 100,
    "lab": "weak-secret"
  }
}
```

**Errors:**
- 400: Incorrect flag
- 401: Authentication required

---

## Achievements

### List All Achievements

```
GET /api/achievements
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "slug": "first-login",
        "name": "First Steps",
        "description": "Log in for the first time",
        "icon": "🚀",
        "xp_reward": 50
      }
    ]
  }
}
```

---

### Get User Achievements

```
GET /api/achievements/mine
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "slug": "first-lab",
        "name": "Lab Rat",
        "description": "Complete your first lab",
        "icon": "🔬",
        "xp_reward": 100,
        "earned": true,
        "earned_at": "2026-07-10T14:00:00.000Z"
      }
    ]
  }
}
```

---

### Get Leaderboard

```
GET /api/achievements/leaderboard?limit=20
```

**Query Parameters:**

| Param | Type | Default |
|-------|------|---------|
| limit | number | 20 |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "id": "uuid",
        "username": "string",
        "xp": 700,
        "level": 4,
        "total_points": 700,
        "labs_completed": 5
      }
    ]
  }
}
```

---

### Get User Stats

```
GET /api/achievements/stats
Authorization: Bearer <token>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "xp": 700,
      "level": 4,
      "total_points": 700,
      "labs_completed": 5
    },
    "progress": {
      "level": 4,
      "progress": 100,
      "needed": 200,
      "percentage": 50
    }
  }
}
```

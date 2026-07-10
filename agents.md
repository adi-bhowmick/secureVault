# AGENTS.md

# JWTLab AI Agent Instructions

Version: 1.0

---

# Project Overview

JWTLab is an interactive platform for learning JSON Web Token (JWT) security.

The project combines educational content, interactive labs, and JWT developer tools to help users understand how JWT authentication works and how common implementation mistakes introduce vulnerabilities.

This is **not** an attack framework.

It is an educational cybersecurity platform.

---

# Primary Objective

Build JWTLab as if it were a production SaaS product.

Priorities:

1. Clean architecture
2. Readable code
3. Small reusable modules
4. Maintainability
5. Educational value
6. Security

---

# Tech Stack

Frontend

* React
* Vite
* TailwindCSS
* React Router
* Axios
* Framer Motion

Backend

* Express
* PostgreSQL
* Node.js
* JWT
* bcrypt
* crypto

---

# Architecture Rules

Always follow these rules.

## Controllers

Controllers should

* Read request
* Validate request
* Call services
* Return response

Controllers should never

* Write SQL
* Generate JWTs
* Perform crypto
* Contain business logic

Target size

< 75 lines

---

## Services

Business logic belongs here.

Examples

* Authentication
* JWT generation
* JWT verification
* Token decoding
* Lab engine
* Progress engine
* Achievement engine

Services must not know about Express.

---

## Routes

Routes only register endpoints.

No logic.

---

## Middleware

Middleware is limited to

* Authentication
* Validation
* Error handling
* Logging

---

## Database

Never write SQL inside controllers.

Always use

Repository

↓

Service

↓

Controller

---

## Frontend

Pages

Compose features.

Components

Reusable UI.

Hooks

State and logic.

Services

HTTP requests only.

---

# Folder Structure

Do not modify unless instructed.

```text
client/

src/

components/

pages/

layouts/

hooks/

context/

services/

assets/

server/

src/

controllers/

routes/

middleware/

services/

repositories/

validators/

database/

engine/

utils/

labs/

docs/
```

---

# Lab Architecture

Every lab must live inside

```text
server/labs/
```

Each lab must have

```text
weak-secret/

index.js

config.json

flag.txt

explanation.md

solution.md
```

Never hardcode labs.

Always load them dynamically.

---

# Database

Database stores only

* Users
* Progress
* Attempts
* Achievements
* Logs

Do NOT store

* Lab explanations
* Flags
* Markdown
* Static content

Those belong inside lab folders.

---

# Coding Standards

Use

* async/await
* ES Modules
* const
* Arrow functions
* Early returns
* Descriptive names

Avoid

* callback hell
* nested if statements
* duplicated logic
* magic values
* unused variables

---

# API Response Format

Success

```json
{
  "success": true,
  "message": "",
  "data": {}
}
```

Failure

```json
{
  "success": false,
  "message": "",
  "errors": []
}
```

Always return this structure.

---

# Milestone Rules

Never build the entire project at once.

Every response must complete exactly one milestone.

After completing a milestone

STOP.

Wait for further instructions.

---

# Milestone 0

Project Initialization

Tasks

* Create folder structure
* Configure Vite
* Configure Express
* Configure PostgreSQL
* Configure ESLint
* Configure Prettier
* Configure environment variables

Verification

Project starts successfully.

STOP.

---

# Milestone 1

Authentication Backend

Tasks

* User repository
* Auth service
* Auth controller
* Register
* Login
* Password hashing
* JWT middleware

Verification

Register and login work.

STOP.

---

# Milestone 2

Authentication Frontend

Tasks

* Login page
* Register page
* Auth Context
* Protected routes
* Axios client

Verification

Authentication flow works.

STOP.

---

# Milestone 3

Database Integration

Tasks

* Connect PostgreSQL
* Create repositories
* Test CRUD
* Seed achievements

Verification

Database operations succeed.

STOP.

---

# Milestone 4

Dashboard UI

Tasks

* Sidebar
* Navbar
* Dashboard
* User profile
* XP card
* Progress card

Verification

Responsive layout.

STOP.

---

# Milestone 5

JWT Decoder

Tasks

* Decode token
* Pretty JSON
* Error handling
* Copy button

Verification

Decoder works.

STOP.

---

# Milestone 6

JWT Generator

Tasks

* Header editor
* Payload editor
* Secret input
* Generate token

Verification

Token generation works.

STOP.

---

# Milestone 7

JWT Verifier

Tasks

* Verify signature
* Show validity
* Explain result

Verification

Verification works.

STOP.

---

# Milestone 8

Token Inspector

Tasks

Inspect

* Algorithm
* Expiration
* Claims
* Missing fields
* Risk score

Verification

Inspector works.

STOP.

---

# Milestone 9

Lab Engine

Tasks

* Dynamic lab loader
* Read config.json
* Register labs
* Expose APIs

Verification

Labs load dynamically.

STOP.

---

# Milestone 10

Weak Secret Lab

Tasks

* Challenge
* Flag validation
* Explanation
* Solution
* Progress update

Verification

Complete lab.

STOP.

---

# Milestone 11

Expired Token Lab

Complete.

Verify.

STOP.

---

# Milestone 12

Payload Tampering Lab

Complete.

Verify.

STOP.

---

# Milestone 13

Role Escalation Lab

Complete.

Verify.

STOP.

---

# Milestone 14

Signature Verification Lab

Complete.

Verify.

STOP.

---

# Milestone 15

Achievements

Tasks

* XP
* Levels
* Badges
* Leaderboard

Verification

Everything updates correctly.

STOP.

---

# Milestone 16

Animations

Tasks

* Framer Motion
* Loading states
* Skeletons
* Smooth transitions

Verification

UI feels polished.

STOP.

---

# Milestone 17

Documentation

Update

* README
* API
* Architecture
* Screenshots

Verification

Documentation complete.

STOP.

---

# Before Finishing Any Milestone

The agent must verify

* Project compiles
* No TypeScript/JavaScript errors
* No ESLint errors
* No unused imports
* No dead code
* API works
* UI renders
* Folder structure unchanged

If any check fails

Fix it before stopping.

---

# Hard Constraints

The agent MUST NOT

* Rewrite existing architecture
* Rename folders without instruction
* Change the database schema
* Add unrelated dependencies
* Implement future milestones
* Delete existing code
* Skip verification
* Continue after completing the assigned milestone

---

# Development Philosophy

Build JWTLab incrementally.

Every milestone should leave the repository in a working state.

The project must always compile, run, and remain deployable after every completed milestone.

Never sacrifice architecture for speed.

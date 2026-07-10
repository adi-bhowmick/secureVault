# AGENTS2.MD

# Bug Fixes — JWTLab

Version: 1.0

---

# Purpose

This document contains specific bug fixes for the JWTLab project.

Each milestone fixes one bug.

Complete exactly one milestone per response.

After completing a milestone

STOP.

Wait for further instructions.

---

# Rules

Before starting

* Read the file mentioned in the milestone completely
* Understand what the bug is
* Understand the fix described
* Do not modify any file not listed in the milestone
* Do not refactor unrelated code
* Do not add comments
* Do not change code style

After completing

* Verify the fix compiles
* Verify no new errors introduced
* STOP

---

# Hard Constraints

The agent MUST NOT

* Rewrite existing architecture
* Rename folders
* Change database schema
* Add unrelated dependencies
* Delete existing code beyond what the fix requires
* Skip verification
* Continue to the next milestone

---

# Milestone 1

## Fix: Async error handling in auth controller

### File to modify

```text
server/src/controllers/authController.js
```

### Bug

The `register` and `login` functions are async but have no try/catch.

If the service throws an error Express never sends a response.

The client hangs forever.

### Fix

Wrap each function body in try/catch.

On catch return

```json
{
  "success": false,
  "message": "Internal server error"
}
```

With status code 500.

### Verification

Open the file.

Confirm both `register` and `login` have try/catch.

Confirm the catch block returns the correct JSON structure.

STOP.

---

# Milestone 2

## Fix: Async error handling in lab controller

### File to modify

```text
server/src/controllers/labController.js
```

### Bug

The `submitFlag` function is async but has no try/catch.

If the service throws an error Express never sends a response.

### Fix

Wrap the function body in try/catch.

On catch return

```json
{
  "success": false,
  "message": "Internal server error"
}
```

With status code 500.

### Verification

Open the file.

Confirm `submitFlag` has try/catch.

Confirm the catch block returns the correct JSON structure.

STOP.

---

# Milestone 3

## Fix: Async error handling in achievement controller

### File to modify

```text
server/src/controllers/achievementController.js
```

### Bug

All four functions are async but have no try/catch.

If any service throws an error Express never sends a response.

### Fix

Wrap each function body in try/catch.

On catch return

```json
{
  "success": false,
  "message": "Internal server error"
}
```

With status code 500.

### Verification

Open the file.

Confirm all four functions have try/catch.

Confirm each catch block returns the correct JSON structure.

STOP.

---

# Milestone 4

## Fix: Null check in achievement stats

### File to modify

```text
server/src/controllers/achievementController.js
```

### Bug

In `getStats` the line

```js
const stats = await import('../repositories/userRepository.js').then((m) => m.default.findById(user.id));
const progress = achievementService.getXpProgress(stats.xp);
```

If `findById` returns null `stats.xp` throws TypeError.

### Fix

After fetching `stats` check if it is null or undefined.

If null return

```json
{
  "success": false,
  "message": "User not found"
}
```

With status code 404.

### Verification

Open the file.

Confirm `getStats` checks for null before accessing `stats.xp`.

STOP.

---

# Milestone 5

## Fix: Prevent duplicate lab completion points

### File to modify

```text
server/src/services/labService.js
```

### Bug

In `submitFlag` when the flag is correct these lines run every time

```js
await progressRepository.createOrUpdate(userId, slug);
await progressRepository.markCompleted(userId, slug, result.points);
await userRepository.updatePoints(userId, result.points);
```

A user can submit the correct flag multiple times and gain unlimited XP.

### Fix

Before calling `updatePoints` check if the lab was already completed.

Use `progressRepository` to check if a completed entry already exists for this user and slug.

If already completed skip the `updatePoints` call.

Still call `createOrUpdate` and `markCompleted` so the record stays correct.

Only award points on first completion.

### Verification

Open the file.

Confirm there is a check before `updatePoints`.

Confirm the check uses `progressRepository`.

STOP.

---

# Milestone 6

## Fix: Credit achievement XP to user

### File to modify

```text
server/src/services/labService.js
```

### Bug

Lines like

```js
await achievementRepository.awardToUser(userId, 'first-lab');
```

Only insert the badge into `user_achievements`.

They never call `userRepository.updatePoints` to credit the achievement XP reward.

Users earn badges but get zero XP.

### Fix

Import `achievementService` at the top of the file.

Replace each call to `achievementRepository.awardToUser` with a call to `achievementService.awardAchievement`.

The `awardAchievement` function already handles both inserting the badge and crediting XP.

### Important prerequisite

This fix depends on Milestone 7.

If Milestone 7 is not yet complete do NOT apply this fix.

If Milestone 7 is complete proceed.

### Verification

Open the file.

Confirm `achievementService` is imported.

Confirm no direct calls to `achievementRepository.awardToUser` remain.

STOP.

---

# Milestone 7

## Fix: Split updatePoints into separate functions

### File to modify

```text
server/src/repositories/userRepository.js
```

### Bug

`updatePoints` always increments `labs_completed`

```sql
labs_completed = labs_completed + 1
```

This is wrong when called from achievement awarding because no lab was completed.

### Fix

Create a new function called `addXP` that only updates

```sql
xp = xp + $1
level = $2
updated_at = NOW()
```

Do NOT touch `labs_completed` or `total_points`.

Keep the existing `updatePoints` function unchanged for backward compatibility.

### Verification

Open the file.

Confirm `addXP` exists and does not modify `labs_completed`.

Confirm `updatePoints` still exists and works as before.

STOP.

---

# Milestone 8

## Fix: Use addXP for achievement rewards

### File to modify

```text
server/src/services/achievementService.js
```

### Bug

`awardAchievement` calls `userRepository.updatePoints` which increments `labs_completed`.

This corrupts the lab count when awarding achievement XP.

### Fix

Import `addXP` from `userRepository` instead of using `updatePoints`.

Change the line that credits XP to use `addXP`.

### Verification

Open the file.

Confirm `addXP` is imported.

Confirm `awardAchievement` uses `addXP` not `updatePoints`.

STOP.

---

# Milestone 9

## Fix: Metadata double serialization

### File to modify

```text
server/src/repositories/logRepository.js
```

### Bug

The line

```js
metadata ? JSON.stringify(metadata) : null
```

Pre-stringifies metadata before passing to `pg`.

The `pg` library automatically serializes objects to JSONB.

Pre-stringifying stores a text string not JSONB.

JSONB queries on this column will fail.

### Fix

Remove the `JSON.stringify` call.

Pass `metadata` directly as the parameter value.

Let `pg` handle the serialization.

### Verification

Open the file.

Confirm `JSON.stringify` is not called on `metadata`.

STOP.

---

# Milestone 10

## Fix: Remove fake crypto dependency

### File to modify

```text
server/package.json
```

### Bug

The dependency

```json
"crypto": "^1.0.1"
```

Is a deprecated placeholder package.

Node.js has a built-in `crypto` module.

This dependency is useless.

### Fix

Remove the `"crypto"` line from `dependencies`.

Do not modify anything else in the file.

### Verification

Open the file.

Confirm `"crypto"` is not in `dependencies`.

STOP.

---

# Milestone 11

## Fix: JSON.parse crash in AuthContext

### File to modify

```text
client/src/context/AuthContext.jsx
```

### Bug

Line 16

```js
setUser(JSON.parse(storedUser));
```

If localStorage contains corrupted user data this throws an unhandled error.

The app crashes on load.

### Fix

Wrap the `JSON.parse` call in a try/catch.

In the catch block

* Call `localStorage.removeItem('user')`
* Do not set user state

The app will treat the user as logged out and redirect to login.

### Verification

Open the file.

Confirm `JSON.parse` is wrapped in try/catch.

Confirm the catch removes corrupted data from localStorage.

STOP.

---

# Milestone 12

## Fix: Install and configure typography plugin

### Files to modify

```text
client/tailwind.config.js
```

```text
client/package.json
```

### Bug

`LabDetail.jsx` uses `prose prose-invert` classes.

The `@tailwindcss/typography` plugin is not installed.

The lab explanation text renders unstyled.

### Fix

Run this command in the `client` directory

```bash
npm install -D @tailwindcss/typography
```

Then edit `tailwind.config.js`.

Add the plugin to the `plugins` array

```js
plugins: [require('@tailwindcss/typography')]
```

### Verification

Open `tailwind.config.js`.

Confirm `@tailwindcss/typography` is in the plugins array.

Run `npm ls @tailwindcss/typography` in the client directory.

Confirm it is installed.

STOP.

---

# Milestone 13

## Fix: Remove redundant dotenv call

### File to modify

```text
server/src/database/pool.js
```

### Bug

`dotenv.config()` is called in both `pool.js` and `index.js`.

This is redundant.

Not harmful but unnecessary.

### Fix

Remove the `import 'dotenv/config'` line from `pool.js`.

The `index.js` entry point already loads environment variables.

### Verification

Open `pool.js`.

Confirm the dotenv import is removed.

Open `index.js`.

Confirm dotenv is still imported there.

STOP.

---

# Verification Checklist

After all milestones are complete verify

* Server starts without errors
* Client starts without errors
* Register and login work
* Lab submission works
* Achievements award XP correctly
* Leaderboard updates correctly
* No console errors in browser
* No unhandled promise rejections in server

---

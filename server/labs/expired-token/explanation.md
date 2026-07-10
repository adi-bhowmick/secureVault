# Expired Token Lab — Explanation

## The Vulnerability

This lab demonstrates what happens when a JWT passes its **expiration time** (`exp` claim).

The token below was signed with a valid secret:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjgwMDAwMDAwLCJleHAiOjE2ODAwMDM2MDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

## Understanding the `exp` Claim

The `exp` (expiration time) claim is a numeric date:

```json
{
  "iat": 1680000000,
  "exp": 1680003600
}
```

- `iat` = Issued At: March 28, 2023 00:00:00 UTC
- `exp` = Expiration: March 28, 2023 01:00:00 UTC

The token was only valid for **1 hour**. Any server checking `exp` would reject it after that window.

## Why It Matters

1. **Replay attacks** — An expired token should no longer be accepted
2. **Key rotation** — Short expiration limits exposure if a key is compromised
3. **Session management** — Expiration forces re-authentication

## The Bypass

In real attacks, an attacker might:

- **Remove the `exp` claim** entirely and re-sign (if the server doesn't enforce it)
- **Modify the `exp` claim** to a far-future date
- **Exploit servers** that don't validate expiration

In this lab, you need to understand the concept and submit the flag.

## Mitigation

- Always validate `exp` on the server
- Use short-lived tokens (15 min - 1 hour)
- Implement token refresh mechanisms
- Consider using `nbf` (not before) alongside `exp`

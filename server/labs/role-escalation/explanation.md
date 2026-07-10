# Role Escalation Lab — Explanation

## The Vulnerability

This lab demonstrates **privilege escalation** through JWT manipulation when the signing secret is weak.

The given token was signed with a weak secret:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6InVzZXIiLCJpYXQiOjE2ODAwMDAwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

## How Role Escalation Works

1. **Start with a regular user token**
   - `role: "user"`
   - Signed with a weak secret

2. **Crack the weak secret**
   - Use dictionary attack or brute force
   - Secret is `secret`

3. **Forge a new token**
   - Keep the same `sub` (subject)
   - Change `role` from `user` to `admin`
   - Sign with the known secret

4. **Use the forged token**
   - Server accepts it (valid signature)
   - Attacker now has admin privileges

## The Attack Chain

```
Weak Secret → Token Forgery → Privilege Escalation
```

## Real-World Impact

- **Admin access** — full control over the application
- **Data breach** — access to sensitive data
- **Account takeover** — impersonate any user
- **System compromise** — potentially escalate to server access

## Why This Happens

1. Weak secrets are easy to crack
2. JWT claims are trusted after signature validation
3. No additional authorization checks on sensitive operations

## Mitigation

- Use strong, random secrets (256+ bits)
- Implement server-side role verification for sensitive operations
- Use asymmetric algorithms (RS256) for distributed systems
- Add rate limiting to prevent brute-force attacks
- Log and monitor for suspicious token patterns

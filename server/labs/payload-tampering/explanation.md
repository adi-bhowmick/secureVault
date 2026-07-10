# Payload Tampering Lab — Explanation

## The Vulnerability

This lab demonstrates what happens when someone tries to **modify the JWT payload without re-signing it**.

Two tokens are provided:

**Given (tampered):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNjgwMDAwMDAwfQ.invalid_signature_here
```

**Original (valid):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyMTIzIiwibmFtZSI6IkpvaG4gRG9lIiwicm9sZSI6InVzZXIiLCJpYXQiOjE2ODAwMDAwMDB9.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
```

## How JWT Tampering Works

JWTs consist of three parts:
1. **Header** — algorithm and token type
2. **Payload** — claims/data
3. **Signature** — cryptographic proof of integrity

The signature is computed as:
```
HMAC-SHA256(base64Url(header) + "." + base64Url(payload), secret)
```

If you change the payload but don't re-sign with the correct secret, the signature won't match.

## What Changed?

Compare the payloads:

| Claim | Original | Tampered |
|-------|----------|----------|
| `role` | `user` | `admin` |
| `iat` | present | present |

The attacker changed their role from `user` to `admin` — but forgot to update the signature.

## Why It Fails

A server that properly validates signatures will:
1. Decode the header to get the algorithm
2. Recompute the signature using the stored secret
3. Compare computed signature with the token's signature
4. **Reject** the token if they don't match

## Real-World Attacks

- **Privilege escalation** — changing `role: "user"` to `role: "admin"`
- **User impersonation** — changing `sub` to another user's ID
- **Data modification** — changing any claim to gain unauthorized access

## Mitigation

- **Always validate signatures** before processing claims
- Use asymmetric algorithms (RS256) where the signing key is separate from the verification key
- Never trust unsigned or invalidly-signed tokens
- Implement proper key management

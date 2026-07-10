# Signature Verification Lab — Explanation

## The Vulnerability

This lab demonstrates the **"none" algorithm attack** — a critical JWT vulnerability where the token claims no signature verification is needed.

The given token:

```
eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiJhZG1pbiIsIm5hbWUiOiJSb290IFVzZXIiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2ODAwMDAwMDB9.
```

Note: The signature part is **empty** (just a trailing dot).

## How the "none" Algorithm Works

### Normal JWT (HS256)
```
header.payload.signature
```
Signature = HMAC-SHA256(header + payload, secret)

### "none" Algorithm
```
header.payload.
```
Signature = **nothing** (empty string)

## The Attack

1. **Change the header** from `alg: "HS256"` to `alg: "none"`
2. **Set any payload** you want (admin, any user ID, etc.)
3. **Remove the signature** entirely (or set it to empty)
4. **Send the token** — if the server doesn't check the algorithm, it accepts it

## Why It Works

Some JWT libraries have a vulnerability where:
1. They decode the header to get the algorithm
2. If the algorithm is "none", they skip signature verification
3. The token is accepted as valid

## Real-World Impact

- **Complete authentication bypass** — no password needed
- **Admin access** — set any role you want
- **Data tampering** — modify any claim without detection

## Historical CVEs

This vulnerability has been found in:
- Node.js `jsonwebtoken` library (CVE-2015-9235)
- Java `java-jwt` library
- Multiple other JWT implementations

## Mitigation

```javascript
// CRITICAL: Always verify the algorithm
const decoded = jwt.decode(token, { complete: true });
if (decoded.header.alg === 'none') {
  throw new Error('Algorithm "none" is not allowed');
}

// Use a whitelist of allowed algorithms
const allowedAlgorithms = ['HS256', 'RS256'];
jwt.verify(token, secret, { algorithms: allowedAlgorithms });
```

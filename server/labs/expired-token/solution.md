# Expired Token Lab — Solution

## Step 1: Decode the Token

Use the JWT Decoder tool to inspect the token:

**Header:**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "sub": "user123",
  "name": "John Doe",
  "role": "admin",
  "iat": 1680000000,
  "exp": 1680003600
}
```

## Step 2: Identify the Expiration

- `iat` (issued at): Unix timestamp 1680000000
- `exp` (expiration): Unix timestamp 1680003600
- Difference: 3600 seconds = **1 hour**

The token expired on March 28, 2023 at 01:00:00 UTC.

## Step 3: Understand the Concept

A properly implemented server would:
1. Check the current time against `exp`
2. Reject any token where `current_time > exp`
3. Return a 401 Unauthorized response

## Step 4: Capture the Flag

The flag for this lab is: **`expired`**

This demonstrates that you understand:
- What the `exp` claim represents
- How token expiration works
- Why expiration is a critical security control

## Step 5: Verify with Token Inspector

Use the Token Inspector tool:
1. Paste the token
2. Click Inspect
3. You'll see: "⚠️ Token expired X seconds ago"

## Prevention

```javascript
// Always validate expiration
const verifyToken = (token, secret) => {
  const decoded = jwt.verify(token, secret);
  // jwt.verify automatically checks exp
  return decoded;
};

// Use short expiration times
const token = jwt.sign(payload, secret, { expiresIn: '1h' });
```

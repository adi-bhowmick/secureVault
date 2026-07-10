# Signature Verification Lab — Solution

## Step 1: Decode the Token

Use the JWT Decoder tool:

**Header:**
```json
{
  "alg": "none",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "sub": "admin",
  "name": "Root User",
  "role": "admin",
  "iat": 1680000000
}
```

**Signature:** *(empty)*

## Step 2: Identify the Attack

The `alg` is set to `none` — this means:
- No cryptographic signature is needed
- The token should be accepted as-is
- Any payload claims are trusted

## Step 3: Understand Why This Is Dangerous

A vulnerable server would:
1. Decode the header
2. See `alg: "none"`
3. Skip signature verification
4. Trust the payload claims (admin, root user, etc.)

## Step 4: The "none" Algorithm in Detail

The "none" algorithm was defined in the JWT spec as:
- For unsigned tokens (e.g., JWTs used in public channels)
- Should only be accepted for specific use cases
- **Never** for authentication or authorization

## Step 5: Capture the Flag

The flag for this lab is: **`none=bypass`**

This represents the algorithm attack vector — bypassing signature verification entirely.

## Step 6: Create Your Own "none" Token

Use the JWT Generator:

**Header:**
```json
{
  "alg": "none",
  "typ": "JWT"
}
```

**Payload:**
```json
{
  "sub": "attacker",
  "role": "admin"
}
```

**Secret:** *(leave empty or type anything — it won't be used)*

The generated token will have an empty signature.

## Prevention

```javascript
// CRITICAL: Use algorithm whitelisting
jwt.verify(token, secret, {
  algorithms: ['HS256', 'RS256']  // NEVER include 'none'
});

// Verify algorithm matches expectations
if (decoded.header.alg === 'none') {
  return res.status(401).json({ message: 'Invalid algorithm' });
}
```

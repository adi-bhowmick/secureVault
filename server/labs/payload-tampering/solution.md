# Payload Tampering Lab — Solution

## Step 1: Decode Both Tokens

Use the JWT Decoder tool on the **original token**:

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
  "role": "user",
  "iat": 1680000000
}
```

Now decode the **given (tampered) token**:

**Payload:**
```json
{
  "sub": "user123",
  "name": "John Doe",
  "role": "admin",
  "iat": 1680000000
}
```

## Step 2: Compare the Payloads

| Claim | Original | Tampered |
|-------|----------|----------|
| `role` | `user` | `admin` |
| `iat` | `1680000000` | `1680000000` |

The `role` claim was changed from `user` to `admin`.

## Step 3: Verify the Signature

Use the JWT Verifier tool with the tampered token and the secret `secret`:

- **Result:** Invalid signature

The signature doesn't match because the payload was modified without re-signing.

## Step 4: Understand the Attack

An attacker might:
1. Intercept a valid token
2. Decode the payload
3. Change `role: "user"` to `role: "admin"`
4. Re-encode the payload
5. **Forget to re-sign** (or not know the secret)

The server should reject this token immediately.

## Step 5: Capture the Flag

The flag for this lab is: **`role=admin`**

This represents the modified claim that would give an attacker admin access if the server failed to validate the signature.

## Prevention

```javascript
// Always verify the signature
const decoded = jwt.verify(token, secret);

// Never process claims from an unverified token
// jwt.verify() will throw if signature is invalid
try {
  const payload = jwt.verify(token, secret);
  // Safe to use payload
} catch (err) {
  // Invalid token — reject
}
```

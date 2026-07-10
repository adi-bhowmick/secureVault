# Weak Secret Lab — Solution

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
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1680000000,
  "role": "guest"
}
```

## Step 2: Identify the Weak Secret

The token uses `HS256`, meaning it's signed with a symmetric secret. The hint says the secret is a common English word under 10 characters.

## Step 3: Brute-Force the Secret

Using a wordlist or trying common passwords:

```bash
# Using hashcat (if you have the hash)
hashcat -m 16500 jwt.txt wordlist.txt

# Or manually test with the JWT Verifier tool
```

Try common words: `password`, `secret`, `admin`, `test`, `key`...

## Step 4: The Secret

The secret is: **`secret`**

Verify using the JWT Verifier:
- Paste the token
- Enter `secret` as the key
- Signature should be **valid**

## Step 5: Capture the Flag

Once you know the secret, submit `secret` as the flag.

## Prevention

Always use cryptographically random secrets:
```bash
openssl rand -base64 32
```

Never use dictionary words, names, or predictable patterns as JWT secrets.

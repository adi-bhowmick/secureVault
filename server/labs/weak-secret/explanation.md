# Weak Secret Lab — Explanation

## The Vulnerability

This lab demonstrates what happens when a JWT is signed with a **weak, easily guessable secret**.

The token below was signed using the `HS256` algorithm:

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNjgwMDAwMDAwLCJyb2xlIjoiZ3Vlc3QifQ.pLBI1nD2VmvB3eT0a1wEJbVjF0cYqZ0Kx3mN4dD5gYk
```

## Why It's Dangerous

When using HMAC-based algorithms (HS256, HS384, HS512), the security depends entirely on the **secret key**:

- A strong secret is at least 256 bits (32 bytes) of random data
- A weak secret can be brute-forced in seconds
- Dictionary attacks work against common words, names, and patterns

## Attack Steps

1. **Decode the header** — confirm the algorithm is `HS256`
2. **Decode the payload** — see what claims are present
3. **Try common secrets** — use a wordlist to brute-force the signature
4. **Once cracked**, use the secret to sign your own tokens

## Tools You Can Use

- The **JWT Decoder** tool to inspect the token
- The **JWT Verifier** tool to test different secrets
- Online hashcat/john rules for JWT cracking

## Mitigation

- Use a secret of at least **256 bits** (32 bytes)
- Generate secrets with `openssl rand -base64 32`
- Consider using RSA/ECDSA (asymmetric) algorithms for distributed systems
- Rotate secrets periodically

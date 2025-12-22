# Security Policy

> [!CAUTION]
> **ARCHIVED PROJECT** - This repository is no longer maintained. Security vulnerabilities will not be addressed. If you are using this codebase, you are responsible for your own security audits and fixes.

---

The following information is preserved for historical reference.

## Reporting a Vulnerability

Since this project is archived, we are no longer accepting security reports. If you discover a security issue in your fork:

1. **Do NOT open a public GitHub issue** with sensitive vulnerability details
2. Fix the issue in your own fork
3. Consider contributing your fix back to the community by documenting it (without exploitable details)

## Wallet Custody Model

Neurodex Bot implements a **non-custodial wallet model**. Users maintain full control of their private keys at all times.

### Key Principles

1. **User-Controlled Keys**: Private keys are generated locally and belong entirely to the user
2. **No Recovery Option**: We cannot recover lost keys - this is by design for maximum security
3. **Minimal Exposure**: Keys are decrypted only for transaction signing, then immediately discarded from memory
4. **Separation of Storage**: Private keys are stored separately from user data in different databases

## Security Measures (Historical)

### Private Key Encryption

Private keys are protected using industry-standard encryption:

| Component | Specification |
|-----------|---------------|
| **Encryption Algorithm** | XChaCha20-Poly1305 (AEAD) |
| **Key Derivation** | Argon2id (winner of Password Hashing Competition) |
| **Memory Cost** | 64 MB (65536 KiB) |
| **Time Cost** | 3 iterations |
| **Parallelism** | 1 thread |
| **Salt** | 16 bytes, cryptographically random |
| **Nonce** | 24 bytes, cryptographically random (XChaCha20) |

### Why These Parameters?

- **XChaCha20-Poly1305**: Provides authenticated encryption, preventing both decryption and tampering. The extended nonce (24 bytes) eliminates nonce-reuse concerns.
- **Argon2id**: Combines Argon2i (side-channel resistance) and Argon2d (GPU resistance). The 64MB memory cost makes hardware attacks expensive.
- **3 iterations**: Balances security with reasonable decryption time for legitimate use.

### Storage Architecture

```
+------------------+     +-------------------+
|   PostgreSQL     |     |    Supabase       |
|   (Main DB)      |     |   (Key Storage)   |
+------------------+     +-------------------+
| - User profiles  |     | - Encrypted keys  |
| - Transactions   |     | - Key metadata    |
| - Settings       |     | - Encryption salt |
| - Wallet address |     |                   |
+------------------+     +-------------------+
        |                         |
        +-----------+-------------+
                    |
              [Application]
                    |
         Decryption only when needed
         for transaction signing
```

**Separation of Concerns:**
- **PostgreSQL**: Stores user data, transaction history, and wallet addresses (public data)
- **Supabase**: Stores encrypted private keys with their encryption metadata
- **Benefit**: Compromise of one database does not expose the complete picture

### Private Key Exposure Minimization

1. **One-Time Display**: Private key is shown once at wallet creation
2. **User Verification**: User must confirm they saved the key before proceeding
3. **Auto-Delete Messages**: Private key messages are automatically deleted from Telegram
4. **Memory Cleanup**: Keys are cleared from memory immediately after use
5. **No Logging**: Private keys are never written to logs

### Database Field Encryption

Beyond private keys, sensitive fields in PostgreSQL are encrypted using Prisma field encryption:
- Encryption key stored in environment variables
- Fields encrypted at rest in the database
- Decrypted only in application memory when accessed

### Authentication

- Telegram user ID verification
- Session management with secure tokens
- Rate limiting (3 requests/second per user)

### Best Practices

- Never commit `.env` files or API keys
- Use environment variables for all secrets
- Regular dependency updates for security patches
- Input validation on all user inputs

## Scope (Historical)

The following were in scope for security reports:
- Authentication/authorization bypasses
- Private key exposure or theft
- SQL injection or database vulnerabilities
- Cross-site scripting (if applicable)
- Remote code execution
- Sensitive data exposure

Out of scope:
- Denial of service attacks
- Social engineering
- Physical attacks
- Issues in third-party dependencies (report to the dependency maintainer)

---

Originally built by [Neurobro](https://neurobro.ai) as part of [Neurodex](https://neurodex.ai) v1.

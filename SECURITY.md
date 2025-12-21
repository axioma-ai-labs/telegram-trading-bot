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

## Security Measures (Historical)

### Encryption

- **Private Keys**: Encrypted using XChaCha20-Poly1305 with Argon2id key derivation
- **Database Fields**: Protected with Prisma field encryption
- **Key Storage**: Private keys stored in Supabase, separate from main database

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

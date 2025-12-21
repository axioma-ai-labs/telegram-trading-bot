# Security Policy

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

**Do NOT open a public GitHub issue for security vulnerabilities.**

Instead, please email us at: **security@axioma-ai-labs.com**

Include the following in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (optional)

### What to Expect

- **Acknowledgment**: We will acknowledge your report within 48 hours
- **Assessment**: We will assess the vulnerability and determine its severity
- **Updates**: We will keep you informed of our progress
- **Resolution**: We aim to resolve critical issues within 7 days
- **Credit**: We will credit you in our security acknowledgments (unless you prefer anonymity)

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Security Measures

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

## Security Advisories

Security advisories will be published through:
- GitHub Security Advisories
- Release notes for patched versions

## Scope

The following are in scope for security reports:
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

Thank you for helping keep Neurodex Bot secure!

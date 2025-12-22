# Telegram Neurotrading Bot

> [!CAUTION]
> This repository is no longer actively maintained.

[![License: Apache 2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)

![Telegram Neurotrading Bot](https://github.com/user-attachments/assets/8a0850ef-02ab-4390-b717-887ea0aae82c)

A scalable Telegram trading bot for cryptocurrency trading on multiple blockchain networks. Trade tokens, manage portfolios, set limit orders, and automate DCA strategies - all through Telegram.

## Features

- **Token Trading**: Buy and sell tokens with configurable slippage via DEX aggregation
- **Limit Orders**: Set price-triggered trades that execute automatically
- **DCA (Dollar-Cost Averaging)**: Automated recurring purchases
- **Wallet Management**: Generate wallets, view balances, and track portfolio
- **Multi-Chain Support**: Base (primary), Ethereum, and BSC
- **Referral System**: Earn commissions on referred trades
- **Multi-Language**: English, Russian, Spanish, German

## Tech Stack

- **Language**: TypeScript 5.5 with Node.js 18+
- **Bot Framework**: [Grammy](https://grammy.dev/) (Telegram Bot API)
- **Database**: PostgreSQL via [Prisma](https://www.prisma.io/) with Accelerate
- **Blockchain**: Viem, Ethers.js, Web3.js
- **DEX Integration**: OpenOcean SDK
- **Security**: Supabase + XChaCha20-Poly1305 encryption with Argon2id key derivation

## Quick Start

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database (or [Prisma Accelerate](https://www.prisma.io/accelerate))
- Telegram bot token from [@BotFather](https://t.me/BotFather)
- Blockchain RPC endpoints

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/axioma-ai-labs/telegram-trading-bot
   cd telegram-trading-bot
   ```

2. **Install dependencies**
   ```bash
   make deps
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```

4. **Generate Prisma client**
   ```bash
   pnpm prisma generate --no-engine
   ```

5. **Start development server**
   ```bash
   make dev
   ```

## Configuration

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather |
| `DATABASE_URL` | Prisma database connection string |
| `BASE_MAINNET_RPC` | Base network RPC URL |
| `MASTER_ENCRYPTION_PASSWORD` | Master password for encryption |
| `WALLET_ENCRYPTION_KEY` | Key for wallet encryption |

See `.env.example` for the complete list of configuration options.

## Commands

```bash
make deps       # Install dependencies
make dev        # Development server with hot reload
make build      # Build for production
make lint       # Run ESLint
make format     # Format code with Prettier
make test       # Run tests
make check      # Run all checks (lint + typecheck)
make migrate    # Run database migrations
```

## Project Structure

```
src/
├── bot.ts              # Entry point
├── bot/
│   ├── callbacks/      # Button interaction handlers
│   ├── commands/       # Slash command handlers
│   └── messages/       # Message formatters
├── config/             # Configuration and logging
├── services/
│   ├── engine/         # Trading engines (OpenOcean, Viem)
│   ├── prisma/         # Database services
│   ├── supabase/       # Key storage
│   └── i18n/           # Internationalization
├── types/              # TypeScript definitions
└── utils/              # Utilities
```

## Documentation

| Document | Description |
|----------|-------------|
| [Development Guide](./docs/development.md) | Setup, architecture, and contribution |
| [Features](./docs/features.md) | Complete feature documentation |
| [Database Guide](./docs/database.md) | Database setup and migrations |
| [i18n Guide](./docs/i18n.md) | Multi-language support |
| [Testing Guide](./docs/testing.md) | Testing methods |
| [Makefile Commands](./docs/makefile.md) | Available make commands |
| [Claude Code Setup](./docs/claude-code.md) | AI-assisted development with Claude Code |
| [API Docs](./docs/auto/) | Auto-generated TypeDoc |

Generate API documentation:
```bash
pnpm run docs
```

## Deployment

Replace in @docker-compose.yaml `your-dockerhub-username` with your actual Docker Hub username.

### Docker

```bash
docker build -t telegram-trading-bot .
docker-compose up -d
```

### Production

```bash
make build
pnpm run start
```

## Contributing

> [!NOTE]
> This project is **no longer actively maintained**. While contributions are not being accepted, you are welcome to fork the repository and modify it for your own use under the Apache 2.0 license.

## Wallet Management Model

The bot uses a **non-custodial wallet model** - you control your own private keys.

### How It Works

1. **Key Generation**: Wallets are generated locally on the server using [Viem](https://viem.sh/)'s cryptographically secure random number generator
2. **Encryption**: Private keys are encrypted using **XChaCha20-Poly1305** with **Argon2id** key derivation (64MB memory cost, 3 iterations)
3. **Separate Storage**: Encrypted keys are stored in Supabase, completely separate from the main PostgreSQL database
4. **One-Time Display**: Your private key is shown **once** when the wallet is created - you must verify you've saved it
5. **On-Demand Retrieval**: The bot only decrypts your key when executing transactions, then discards it from memory

### What This Means For You

- **You own your keys**: Export your private key anytime and use it in any compatible wallet
- **We cannot access your funds**: Without your master password, encrypted keys are useless
- **No recovery possible**: If you lose your private key, we cannot recover it - there is no "forgot password" option
- **Message auto-deletion**: Private keys displayed in Telegram are auto-deleted to minimize exposure

> [!IMPORTANT]
> Always back up your private key when prompted. Store it securely offline. Never share it with anyone.

## Security

- Private keys are stored encrypted in Supabase, separate from the main database
- Encryption uses XChaCha20-Poly1305 with Argon2id key derivation (NIST-recommended parameters)
- Database fields are encrypted with Prisma field encryption
- Rate limiting prevents abuse (3 req/sec per user)
- Never commit `.env` files or expose API keys

> [!WARNING]
> This project is **no longer actively maintained**. Security vulnerabilities will not be addressed. See [SECURITY.md](SECURITY.md) for details.

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Grammy](https://grammy.dev/) - Telegram Bot framework
- [OpenOcean](https://openocean.finance/) - DEX aggregation
- [Prisma](https://www.prisma.io/) - Database ORM
- [Viem](https://viem.sh/) - Ethereum library

---

Originally built by [Neurobro](https://neurobro.ai).

> "The market is a pendulum that forever swings between unsustainable optimism and unjustified pessimism."
>
> * Benjamin Graham, The Intelligent Investor
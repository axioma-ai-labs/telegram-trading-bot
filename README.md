# Neurodex Bot

> [!CAUTION]
> **ARCHIVED PROJECT** - This repository is no longer maintained. This was part of the first version of [Neurodex](https://neurodex.ai) made by [Neurobro](https://neurobro.ai).

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![Archived](https://img.shields.io/badge/Status-Archived-red.svg)]()

![neurodex](https://github.com/user-attachments/assets/8a0850ef-02ab-4390-b717-887ea0aae82c)

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
   git clone https://github.com/axioma-ai-labs/neurodex-bot
   cd neurodex-bot
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
| [API Docs](./docs/auto/) | Auto-generated TypeDoc |

Generate API documentation:
```bash
pnpm run docs
```

## Deployment

### Docker

```bash
docker build -t neurodex-bot .
docker-compose up -d
```

### Production

```bash
make build
pnpm run start
```

## Contributing

> [!NOTE]
> This project is **archived and no longer maintained**. While contributions are not being accepted, you are welcome to fork the repository and modify it for your own use under the MIT license.

See [CONTRIBUTING.md](CONTRIBUTING.md) for historical contribution guidelines.

## Security

- Private keys are stored encrypted in Supabase, separate from the main database
- Encryption uses XChaCha20-Poly1305 with Argon2id key derivation (NIST-recommended parameters)
- Database fields are encrypted with Prisma field encryption
- Rate limiting prevents abuse (3 req/sec per user)
- Never commit `.env` files or expose API keys

> [!WARNING]
> This project is **archived**. Security vulnerabilities will not be addressed. See [SECURITY.md](SECURITY.md) for details.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Grammy](https://grammy.dev/) - Telegram Bot framework
- [OpenOcean](https://openocean.finance/) - DEX aggregation
- [Prisma](https://www.prisma.io/) - Database ORM
- [Viem](https://viem.sh/) - Ethereum library

---

Originally built by [Neurobro](https://neurobro.ai) as part of [Neurodex](https://neurodex.ai) v1.

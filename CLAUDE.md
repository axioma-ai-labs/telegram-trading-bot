# Telegram Neurotrading Bot - Claude Code Reference

## Quick Commands

```bash
make deps      # Install dependencies
make dev       # Run development server with hot reload
make build     # Build TypeScript to dist/
make lint      # Run ESLint
make lint-fix  # Fix linting errors automatically
make format    # Format code with Prettier
make test      # Run Jest tests
make check     # Run all checks (lint + typecheck)
make migrate   # Run Prisma migrations
```

## Tech Stack

- **Language**: TypeScript 5.5.3 with Node.js 18+
- **Bot Framework**: Grammy (Telegram Bot API)
- **Database**: PostgreSQL via Prisma ORM with Accelerate
- **Blockchain**: Viem, Ethers.js, Web3.js (multi-chain: Base, Ethereum, BSC)
- **DEX Integration**: OpenOcean SDK (swaps, limit orders)
- **Key Storage**: Supabase with field-level encryption
- **Logging**: Winston + BetterStack
- **Testing**: Jest, K6 (load testing)

## Project Structure

```
src/
├── bot.ts                # Entry point - bot initialization
├── bot/
│   ├── callbacks/        # Telegram callback handlers (button interactions)
│   ├── commands/         # Bot command handlers (/buy, /sell, /wallet, etc.)
│   └── messages/         # Message formatters with inline keyboards
├── config/
│   ├── config.ts         # Environment config with Zod validation
│   └── logger.ts         # Winston logging setup
├── services/
│   ├── cache/            # LRU caching (cacheManager.ts)
│   ├── engine/           # Trading engines
│   │   ├── coinstats.ts  # Price data API
│   │   ├── openocean.ts  # DEX aggregator client
│   │   ├── neurodex.ts   # Custom trading logic (buy/sell/limit/DCA)
│   │   └── viem.ts       # Blockchain RPC interactions
│   ├── prisma/           # Database services (user, wallet, transactions)
│   ├── supabase/         # Private key storage service
│   └── i18n/             # Internationalization (en, de, es, ru)
├── types/                # TypeScript interfaces and types
└── utils/                # Utilities (encryption, validation, formatters)
prisma/
├── schema.prisma         # Database schema (User, Wallet, Transaction, Settings)
└── migrations/           # Database migrations
locales/                  # i18n translation files (.ftl format)
docs/                     # Documentation
tests/                    # Test files
```

## Core Features

- **Trading**: Buy/sell tokens with configurable slippage
- **Limit Orders**: Price-triggered automatic trades
- **DCA Orders**: Dollar-cost averaging with intervals (hourly/daily/weekly)
- **Wallet Management**: Generate wallets, view balances, portfolio tracking
- **Multi-chain**: Base (primary), Ethereum, BSC support
- **Referrals**: User referral system with commission tracking
- **i18n**: Multi-language support (EN, RU, ES, DE)

## Development Guidelines

### DO

- Use async/await for all I/O operations
- Add type hints to all functions (strict mode enabled)
- Run `make format`, `make lint` and `make test` before committing
- Use Prisma services (`src/services/prisma/`) for database access
- Follow existing patterns in `callbacks/` and `commands/` directories
- Use i18n keys from `locales/` for user-facing messages
- Handle errors gracefully with user-friendly messages
- Update documentation in `/docs` after implementing new features

### DON'T

- Commit secrets or API keys (use `.env`)
- Use blocking I/O in async functions
- Skip type annotations
- Hardcode configuration values (use `config.ts`)
- Store private keys in main database (use Supabase service)
- Create new services without following existing patterns
- Bypass rate limiting middleware

## Database Models

- **User**: Telegram user with referral tracking
- **Wallet**: User cryptocurrency wallets (address, chain, type)
- **Transaction**: Trading history (BUY, SELL, LIMIT_ORDER, DCA, WITHDRAW)
- **Settings**: User preferences (language, slippage, gas priority)
- **ReferralStats**: Referral earnings and metrics

## Key Services

| Service | Location | Purpose |
|---------|----------|---------|
| TradingApi | `services/engine/neurodex.ts` | Trading operations (buy/sell/limit/DCA) |
| ViemService | `services/engine/viem.ts` | Blockchain RPC interactions |
| CoinStatsService | `services/engine/coinstats.ts` | Token prices and portfolio data |
| PrivateStorageService | `services/supabase/privateKeys.ts` | Encrypted private key storage |
| I18nService | `services/i18n/i18n.ts` | Localization |

## Environment Variables

Key variables (see `.env.example` for full list):
- `TELEGRAM_BOT_TOKEN` - Bot token from @BotFather
- `DATABASE_URL` - Prisma Accelerate connection string
- `BASE_MAINNET_RPC` - Primary blockchain RPC
- `MASTER_ENCRYPTION_PASSWORD` - For private key encryption
- `WALLET_ENCRYPTION_KEY` - Field-level encryption key

## Git Workflow

### Branches
- **Main**: `main` (production)
- **Development**: `dev` (staging)
- **Feature**: `feature/description` or `issue-number-description`

### Guidelines
- Always open pull requests to `main` branch
- Run `make check` before pushing
- Write descriptive commit messages
- Reference issue numbers in commits when applicable

## Testing

```bash
make test              # Run Jest unit tests
pnpm test:load         # Run K6 load tests (rate limiting)
pnpm test:load:quick   # Quick load test (10 iterations)
```

## Docker

```bash
docker build -t telegram-trading-bot .
docker-compose up -d
```

The Dockerfile uses multi-stage builds with Node.js 18 Alpine for minimal image size.

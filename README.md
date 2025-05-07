# Neurodex Bot

A scalable Telegram trading bot built with TypeScript, featuring OpenOcean integration for cryptocurrency trading, functional programming approach, and robust error handling.

## Features

- TypeScript with strict type checking
- Modern ES2022 features
- Functional programming paradigm
- Robust error handling
- Environment configuration with Zod validation
- ESLint and Prettier for code quality
- Hot reloading during development
- OpenOcean integration for DEX trading

## Prerequisites

- Node.js (v18 or higher)
- pnpm
- A Telegram bot token (get it from [@BotFather](https://t.me/BotFather))
- QuickNode account with OpenOcean addon
- Make (for using the Makefile)

## Setup

1. Clone the repository:
```bash
git clone https://github.com/axioma-ai-labs/neurodex-bot
cd neurodex-bot
```

2. Install dependencies:
```bash
make install
```

3. Copy the example environment file and update it with your values:

```bash
cp .env.example .env
```

4. Configure your `.env` file with the required values:

```
ENVIRONMENT=development

# Telegram Bot Token
TELEGRAM_BOT_TOKEN=

# QuickNode RPC URL (with MEV protection)
ETHEREUM_MAINNET_RPC=https://thrilling-cool-replica.quiknode.pro/123
BASE_MAINNET_RPC=https://serene-necessary-replica.base-mainnet.quiknode.pro/123
BASE_SEPOLIA_RPC=https://thrilling-cool-replica.base-sepolia.quiknode.pro/123
BNC_RPC=https://thrilling-cool-replica.bsc.quiknode.pro/123

# QuickNode Add-On IDs
OPEN_OCEAN_ADDON_ID=807

# Wallet Encryption Key (32 characters) - "openssl rand -hex 32"
WALLET_ENCRYPTION_KEY=

# Database Path (optional)
DB_PATH=./database.sqlite

# Chain IDs can be found here: 
# - https://chainlist.org/
# - https://apis.openocean.finance/developer/developer-resources/supported-chains
BASE_CHAIN_ID=8453
BASE_SEPOLIA_CHAIN_ID=84532
ETHEREUM_CHAIN_ID=1
BNB_CHAIN_ID=56

# Default Slippage (percentage)
DEFAULT_SLIPPAGE=1

# Default free (percentage)
DEFAULT_FEE=1
DEFAULT_FEE_WALLET=

# Default Gas Priority (low, medium, high)
DEFAULT_GAS_PRIORITY=medium
```

## Makefile

The project includes a Makefile with common commands for development:

```bash
# Show available commands
make help

# Install dependencies
make install

# Run development server with hot reloading
make dev

# Lint code
make lint

# Fix linting errors automatically
make lint-fix

# Format code and fix imports
make format

# Run tests
make test

# Run all checks (lint + type check)
make check
```

## Project Structure

```
src/
├── bot/           # Bot-related code
│   ├── commands/  # Bot command handlers
│   ├── callbacks/ # Bot callback handlers
│   └── index.ts   # Bot initialization
├── config/        # Configuration files
│   ├── config.ts  # Application configuration
│   ├── env.ts     # Environment variables
│   └── types.ts   # Config-related types
├── types/         # Application type definitions
├── utils/         # Helper utilities
├── openocean.ts   # OpenOcean for testing (Please use command to test locally below!)
└── index.ts       # Application entry point
```

## Testing separate methods (OpenOcean, Wallet Generation, etc.)


### OpenOcean + QuickNode

You can test the OpenOcean integration directly using:

```bash
ts-node -r tsconfig-paths/register src/openocean.ts swap
```

Available test commands:
- connection
- gas
- quote
- mev
- balance
- tokenList
- transaction
- swap

If not specified - all methods will be executed and run.

### Wallet Creation

**IMPORTANT**: Before running, uncomment code at the bottom.

```bash
ts-node -r tsconfig-paths/register src/create_test_wallet.ts
```


## Development

Start the development server with hot reloading:
```bash
make dev
```

## Building and Running for Production

```bash
# Start the production server
pnpm run start
```

------


# Learnings

Summary of learnings for Neurodex trading bot. Kinda super important!

---

### 🔐 Security Learnings

* **Use AES-256-GCM instead of AES-256-CBC**
  GCM provides both confidentiality and integrity (auth tag) and is resistant to padding oracle attacks.

* **Always use a random Initialization Vector (IV)**
  For GCM mode, a 12-byte IV (`crypto.randomBytes(12)`) is recommended and must be unique per encryption.

* **Derive encryption key using SHA-256**
  Use `crypto.createHash('sha256').update(secret).digest()` to produce a fixed-length 256-bit key from your secret.

* **Store IV and Auth Tag with encrypted data**
  Concatenate them in a predictable format (e.g., `iv:authTag:encrypted`) so they can be reused during decryption.

* **Keep private keys encrypted at all times**
  Never store or log raw private keys. Decrypt them only when absolutely needed and clear from memory after use.

* **Use strong, unpredictable secrets**
  Your `encryptionKey` should be at least 32 characters long, random, and not reused across environments.

* **Implement proper key rotation (for the future)**
  Design your system to support periodic key changes without data loss. Use versioned encryption keys if needed.

* **Limit exposure window**
  Auto-delete private keys within a short time (e.g., 5 minutes).
# Features

## Core Trading Features

### Token Buy/Sell
Execute instant token swaps via DEX aggregation:
- **Buy tokens**: Swap ETH for any ERC20 token by providing contract address
- **Sell tokens**: Swap tokens back to ETH with percentage options (25%, 50%, 75%, 100%)
- **Configurable slippage**: 0.5% - 3% tolerance for price movements
- **Gas priority**: Standard, Fast, or Instant transaction speeds
- **DEX aggregation**: Best prices via OpenOcean across multiple DEXs

### Limit Orders
Set price-triggered trades that execute automatically:
- Specify target price for token purchase
- Define order expiration time
- Cancel pending orders anytime
- Stored on OpenOcean protocol (on-chain)

### DCA (Dollar-Cost Averaging)
Automated recurring purchases to average entry price:
- Configure amount per purchase
- Set interval: Hourly (1H), Daily (1D), Weekly (1W), Monthly (1M), or custom
- Define number of executions (1-100)
- Cancel remaining executions at any time
- Example: Buy $100 of TOKEN every day for 30 days

## Wallet Management

### Wallet Generation
- Automatic Ethereum wallet creation
- Secure private key storage via Supabase encryption
- Private key displayed once with auto-delete after 5 minutes
- Verification step ensures user has saved the key

### Balance Tracking
- Native token balance (ETH) via Viem RPC
- Token portfolio via CoinStats API
- Real-time balance refresh
- USD value calculation for all holdings

### Portfolio View
- All token holdings across supported chains
- Token name, symbol, and balance
- Current USD value
- 24h price change percentage
- Total portfolio value

## Multi-Chain Support

| Chain | Chain ID | Status |
|-------|----------|--------|
| Base | 8453 | Primary |
| Ethereum Mainnet | 1 | Supported |
| BSC (Binance Smart Chain) | 56 | Supported |
| Base Sepolia | 84532 | Testnet |

## Fund Management

### Deposits
- Display wallet address for receiving funds
- QR code generation for easy deposits
- Balance updates on refresh

### Withdrawals
- Send ETH to external addresses
- Amount validation against available balance
- Address validation
- Transaction confirmation before execution

## User Features

### Referral System
- Unique referral code per user
- Track referred users
- Commission on referred trades
- Referral statistics dashboard:
  - Total referrals
  - Total trading volume
  - Earnings

### Settings
| Setting | Options | Default |
|---------|---------|---------|
| Language | EN, RU, ES, DE | EN |
| Slippage | 0.5% - 3% | 1% |
| Gas Priority | Standard, Fast, Instant | Medium |
| Pro Mode | On/Off | Off |
| Auto Trade | On/Off | Off |

### Transaction History
- Complete trade history
- Filter by type: BUY, SELL, LIMIT_ORDER, DCA, WITHDRAW
- Transaction details: tokens, amounts, status, timestamp
- Paginated results for large histories

## Technical Features

### TypeScript
- Strict type checking enabled
- Modern ES2022 features
- Path aliases (@/) for clean imports
- Full type definitions for all services

### Code Quality
- ESLint with TypeScript rules
- Prettier for consistent formatting
- Import sorting via Prettier plugin
- Pre-commit hooks for linting

### Security
- XChaCha20-Poly1305 encryption for private keys with Argon2id key derivation
- Field-level encryption in database (Prisma)
- Configurable rate limiting (default: 3 req/sec, 50 req/min, 300 req/15min per user)
- No private keys stored in main database

### Internationalization (i18n)
- Fluent format (.ftl) translation files
- 4 supported languages
- Session-based language persistence
- Easy to add new languages

### Logging & Monitoring
- Winston logging with structured output
- BetterStack integration for production
- Logtail for log aggregation
- Request/response logging

### Caching
- LRU cache for frequently accessed data
- 2-minute TTL for token balances
- Reduces external API calls

### Database
- PostgreSQL via Prisma ORM
- Prisma Accelerate for connection pooling
- Field encryption for sensitive data
- Automatic migrations

## Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Initialize bot, handle referrals |
| `/buy` | Buy tokens with ETH |
| `/sell` | Sell tokens for ETH |
| `/wallet` | View wallet and portfolio |
| `/deposit` | Get deposit address |
| `/withdraw` | Withdraw ETH |
| `/dca` | Create DCA order |
| `/limit` | Create limit order |
| `/orders` | View active orders |
| `/settings` | Configure preferences |
| `/referrals` | Referral stats and link |
| `/help` | Command help |

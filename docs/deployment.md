# Deployment Guide

This guide covers deploying the Telegram Neurotrading Bot to a production environment, including server setup, database configuration, monitoring, and maintenance procedures.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Docker Deployment](#docker-deployment)
- [Manual Deployment](#manual-deployment)
- [Monitoring and Logging](#monitoring-and-logging)
- [Security Considerations](#security-considerations)
- [Backup and Recovery](#backup-and-recovery)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Server Requirements

- **OS**: Ubuntu 22.04 LTS (recommended) or any Linux distribution
- **CPU**: 2+ cores
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 20GB SSD
- **Network**: Stable internet connection with outbound access

### Required Services

| Service           | Purpose                          | Provider Examples                     |
|-------------------|----------------------------------|---------------------------------------|
| PostgreSQL        | Primary database                 | Prisma Accelerate, Supabase, Neon     |
| Supabase          | Secure private key storage       | Supabase                              |
| Blockchain RPC    | Blockchain interaction           | Alchemy, Infura, QuickNode            |
| Telegram Bot API  | Bot communication                | @BotFather                            |
| BetterStack       | Logging and monitoring (optional)| BetterStack (Logtail)                 |

---

## Environment Setup

### 1. Create Environment File

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

### 2. Configure All Environment Variables

Edit `.env` with production values:

```bash
# Application Environment
ENVIRONMENT=production
NODE_ENV=production

# Telegram Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather

# Blockchain RPC URLs (use reliable providers)
ETHEREUM_MAINNET_RPC=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
BASE_MAINNET_RPC=https://base-mainnet.g.alchemy.com/v2/YOUR_KEY
BASE_SEPOLIA_RPC=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
BNC_RPC=https://bsc-dataseed.binance.org

# Trading Defaults
DEFAULT_SLIPPAGE=1
DEFAULT_FEE=1
DEFAULT_FEE_WALLET=0x_your_fee_wallet_address
DEFAULT_GAS_PRIORITY=medium

# Database (Prisma Accelerate)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_API_KEY"
PRISMA_FIELD_ENCRYPTION_KEY="your_cloak_generated_key"

# Supabase (Private Key Storage)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key

# Encryption
MASTER_ENCRYPTION_PASSWORD=your_secure_32_char_password_here
WALLET_ENCRYPTION_KEY=your_secure_encryption_key_here

# Monitoring (Optional but recommended)
COVALENTHQ_API_KEY=your_covalent_api_key
BETTERSTACK_SOURCE_TOKEN=your_betterstack_token
BETTERSTACK_ENDPOINT=https://in.logs.betterstack.com
```

### 3. Generate Encryption Keys

Generate the Prisma field encryption key using Cloak:

```bash
npx @47ng/cloak generate
```

For the master encryption password and wallet encryption key, use a secure random generator:

```bash
openssl rand -hex 32
```

---

## Database Setup

### Using Prisma Accelerate

1. **Create a Prisma Data Platform account** at [prisma.io](https://www.prisma.io/)

2. **Create a new project** and enable Accelerate

3. **Get your connection string** from the dashboard

4. **Run migrations**:

```bash
# Apply pending migrations
pnpm prisma migrate deploy

# Verify migration status
pnpm prisma migrate status
```

### Database Schema

The bot uses the following main tables:

| Table          | Purpose                              |
|----------------|--------------------------------------|
| User           | Telegram user data and referrals     |
| Wallet         | User cryptocurrency wallets          |
| Transaction    | Trading history and order records    |
| Settings       | User preferences (language, slippage)|
| ReferralStats  | Referral earnings and metrics        |

### Prisma Studio (Database GUI)

To inspect and manage data:

```bash
pnpm prisma studio
```

---

## Docker Deployment

### 1. Build Docker Image

```bash
docker build -t telegram-trading-bot:latest .
```

### 2. Push to Registry (Optional)

```bash
# Tag for Docker Hub
docker tag telegram-trading-bot:latest your-username/telegram-trading-bot:latest

# Push to registry
docker push your-username/telegram-trading-bot:latest
```

### 3. Run with Docker Compose

Create or update `docker-compose.yaml`:

```yaml
services:
  telegram-trading-bot:
    image: telegram-trading-bot:latest
    container_name: telegram-trading-bot
    hostname: telegram-trading-bot
    env_file:
      - .env
    restart: unless-stopped
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    healthcheck:
      test: ["CMD", "node", "-e", "console.log('healthy')"]
      interval: 30s
      timeout: 10s
      retries: 3
```

Start the service:

```bash
docker-compose up -d
```

### 4. View Logs

```bash
# Follow logs
docker-compose logs -f

# Last 100 lines
docker-compose logs --tail 100
```

### 5. Update Deployment

```bash
# Pull latest image
docker-compose pull

# Restart with new image
docker-compose up -d
```

---

## Manual Deployment

### 1. Install Node.js 18+

```bash
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Verify installation
node --version
```

### 2. Install pnpm

```bash
npm install -g pnpm
```

### 3. Clone and Setup

```bash
git clone https://github.com/axioma-ai-labs/telegram-trading-bot.git
cd telegram-trading-bot
pnpm install --frozen-lockfile
```

### 4. Build Application

```bash
# Generate Prisma client
pnpm prisma generate --no-engine

# Build TypeScript
pnpm run build
```

### 5. Run with Process Manager

Using PM2 (recommended):

```bash
# Install PM2
npm install -g pm2

# Create ecosystem file
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'telegram-trading-bot',
    script: 'node',
    args: '-r tsconfig-paths/register dist/bot.js',
    cwd: '$(pwd)',
    env: {
      NODE_ENV: 'production',
      TS_NODE_PROJECT: 'tsconfig.json',
      TS_NODE_BASEURL: './dist'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: 'logs/err.log',
    out_file: 'logs/out.log',
    log_file: 'logs/combined.log',
    time: true
  }]
}
EOF

# Start application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup startup script
pm2 startup
```

### 6. PM2 Commands

```bash
# View status
pm2 status

# View logs
pm2 logs telegram-trading-bot

# Restart application
pm2 restart telegram-trading-bot

# Stop application
pm2 stop telegram-trading-bot

# Monitor resources
pm2 monit
```

---

## Monitoring and Logging

### BetterStack Integration

The bot automatically sends logs to BetterStack when configured:

1. **Create a BetterStack account** at [betterstack.com](https://betterstack.com)

2. **Create a new source** and get your token

3. **Configure environment variables**:
   ```bash
   BETTERSTACK_SOURCE_TOKEN=your_source_token
   BETTERSTACK_ENDPOINT=https://in.logs.betterstack.com
   ```

### Log Levels

| Level | Usage                                      |
|-------|--------------------------------------------|
| error | Critical errors requiring immediate action |
| warn  | Warning conditions                         |
| info  | General operational information            |
| debug | Detailed debugging information             |

### Local Log Files

Logs are written to:

| File           | Content                |
|----------------|------------------------|
| `error.log`    | Error-level logs only  |
| `combined.log` | All log levels         |

### Health Monitoring

Set up uptime monitoring:

1. **BetterStack Uptime**: Monitor your server's health
2. **Telegram Bot API**: Check bot responsiveness
3. **Database connectivity**: Monitor Prisma connection

---

## Security Considerations

### Environment Variables

- Never commit `.env` files to version control
- Use secrets management in CI/CD (GitHub Secrets, etc.)
- Rotate sensitive keys periodically

### Private Key Storage

- Private keys are stored in Supabase with encryption
- Never log private keys or sensitive wallet data
- Use Row Level Security (RLS) in Supabase

### Network Security

- Use HTTPS for all external API calls
- Configure firewall to allow only necessary ports
- Use VPN for RPC connections if needed

### Update Dependencies

```bash
# Check for vulnerabilities
pnpm audit

# Update dependencies
pnpm update

# Fix vulnerabilities
pnpm audit fix
```

---

## Backup and Recovery

### Database Backup

Using Prisma with Accelerate, backups are managed by the platform. For direct PostgreSQL:

```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql $DATABASE_URL < backup_20240115_120000.sql
```

### Supabase Backup

Supabase provides automatic daily backups. To manually backup:

1. Go to Supabase Dashboard > Settings > Database
2. Click "Create Backup"
3. Download the backup file

### Application State

The bot is stateless - all data is in the database. To restore:

1. Restore database from backup
2. Redeploy application
3. Verify bot functionality

### Backup Schedule Recommendation

| Data                | Frequency | Retention |
|---------------------|-----------|-----------|
| Database            | Daily     | 30 days   |
| Supabase (keys)     | Daily     | 30 days   |
| Configuration files | On change | Indefinite|

---

## Troubleshooting

### Common Issues

#### Bot Not Responding

1. Check bot token is correct:
   ```bash
   curl https://api.telegram.org/bot<YOUR_TOKEN>/getMe
   ```

2. Verify process is running:
   ```bash
   pm2 status
   # or
   docker-compose ps
   ```

3. Check logs for errors:
   ```bash
   pm2 logs neurodex-bot --lines 100
   ```

#### Database Connection Failed

1. Verify DATABASE_URL is correct
2. Check network connectivity to database
3. Ensure migrations are applied:
   ```bash
   pnpm prisma migrate status
   ```

#### RPC Connection Issues

1. Verify RPC URLs are accessible
2. Check RPC provider rate limits
3. Consider using multiple RPC providers as fallbacks

#### Transaction Failures

1. Check wallet has sufficient balance for gas
2. Verify token addresses are correct
3. Check slippage settings

### Logs Location

| Deployment | Log Location                        |
|------------|-------------------------------------|
| Docker     | `docker-compose logs`               |
| PM2        | `~/.pm2/logs/` or `logs/` directory |
| Direct     | `error.log`, `combined.log`         |
| BetterStack| BetterStack Dashboard               |

### Getting Help

1. Check existing [GitHub Issues](https://github.com/axioma-ai-labs/telegram-trading-bot/issues)
2. Review logs for specific error messages
3. Open a new issue with:
   - Error message
   - Steps to reproduce
   - Environment details (Node version, OS)

---

## Related Documentation

- [Development Guide](./development.md) - Local development setup
- [API Reference](./api.md) - API documentation
- [Database Schema](./database.md) - Database models
- [Testing Guide](./testing.md) - Running tests

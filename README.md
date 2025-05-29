# Neurodex Bot
[![Build and Push Docker image](https://github.com/axioma-ai-labs/neurodex-bot/actions/workflows/docker.yml/badge.svg)](https://github.com/axioma-ai-labs/neurodex-bot/actions/workflows/docker.yml)
[![CI](https://github.com/axioma-ai-labs/neurodex-bot/actions/workflows/ci.yml/badge.svg)](https://github.com/axioma-ai-labs/neurodex-bot/actions/workflows/ci.yml)

![neurodex](https://github.com/user-attachments/assets/8a0850ef-02ab-4390-b717-887ea0aae82c)

A scalable Telegram trading bot built to make money.

## Prerequisites

- Node.js (v18 or higher)
- pnpm
- A Telegram bot token (get it from [@BotFather](https://t.me/BotFather))
- Blockchain RPCs
- Prisma (PostgreSQL) Database
- Supabase
- Coinstats API
- Betterstack (for logging)

## Quickstart

1. Clone the repository:
```bash
git clone https://github.com/axioma-ai-labs/neurodex-bot
cd neurodex-bot
```

2. Install dependencies:
```bash
make deps
```

3. Copy the example environment file and update it with your values:

```bash
cp .env.example .env
```

4. Configure your `.env` file with the required values. See `.env.example` for reference.

5. Generate Prisma client:

```bash
pnpm prisma generate --no-engine
```

6. Run the application:

```bash
make dev
```

7. Generate documentation:

```bash
pnpm run docs
```

## Documentation

### 📚 API Documentation

Comprehensive TypeDoc-generated documentation with 100% codebase coverage:

- **Auto-generated docs**: [docs/auto/](./docs/auto/) - Complete API reference with examples
- **Live documentation**: Open `docs/auto/index.html` in your browser

### 📖 Guides & Documentation

- **[Features](./docs/features.md)** - Complete feature list and capabilities
- **[Development Guide](./docs/development.md)** - Development setup and workflows  
- **[Testing Guide](./docs/testing.md)** - Testing methods and examples
- **[Database Guide](./docs/database.md)** - Database setup, migrations, and operations
- **[Makefile Commands](./docs/makefile.md)** - Available make commands
- **[Internationalization](./docs/i18n.md)** - Multi-language support guide
- **[Learnings & Best Practices](./docs/learnings.md)** - Important insights and security practices

### 🔗 Quick Reference

- Browse by category: Core, Services, Bot, Utils
- Search functionality for quick lookups
- Practical code examples in every module
- Mobile-responsive design
- TypeScript integration with full type information

### 📱 Generate Documentation

```bash
pnpm run docs        # Generate documentation  
pnpm run docs:watch  # Generate and watch for changes
```

---

*For detailed information, examples, and API reference, visit the [complete documentation](./docs/auto/).*

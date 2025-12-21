# Contributing to Neurodex Bot

Thank you for your interest in contributing to Neurodex Bot! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database (or Prisma Accelerate)
- Telegram bot token from [@BotFather](https://t.me/BotFather)

### Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/neurodex-bot.git
   cd neurodex-bot
   ```
3. Install dependencies:
   ```bash
   make deps
   ```
4. Copy environment file and configure:
   ```bash
   cp .env.example .env
   # Edit .env with your values
   ```
5. Generate Prisma client:
   ```bash
   pnpm prisma generate --no-engine
   ```
6. Start development server:
   ```bash
   make dev
   ```

## How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

When filing a bug report, include:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Environment details (Node.js version, OS, etc.)
- Relevant logs or error messages

### Suggesting Features

Feature requests are welcome! Please include:
- A clear description of the feature
- The problem it solves
- Possible implementation approaches
- Any relevant examples or mockups

### Pull Requests

1. Create a feature branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following our code style

3. Run quality checks:
   ```bash
   make format    # Format code
   make check     # Lint + typecheck
   make test      # Run tests
   ```

4. Commit your changes:
   ```bash
   git commit -m "feat: add your feature description"
   ```

5. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

6. Open a Pull Request against `main`

### Commit Message Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

Examples:
```
feat: add limit order price alerts
fix: resolve wallet balance display issue
docs: update installation instructions
```

## Code Style

### TypeScript Guidelines

- Use TypeScript strict mode
- Add type annotations to all functions
- Avoid `any` type - use `unknown` or proper types
- Use async/await for asynchronous operations

### File Organization

- Commands go in `src/bot/commands/`
- Callback handlers go in `src/bot/callbacks/`
- Services go in `src/services/`
- Utilities go in `src/utils/`
- Types go in `src/types/`

### Best Practices

- Keep functions small and focused
- Write descriptive variable and function names
- Add comments for complex logic
- Handle errors appropriately
- Use the logger instead of console.log

## Testing

### Running Tests

```bash
# Run all tests
make test

# Run with coverage
pnpm test:coverage

# Run specific test file
pnpm test -- validators.test.ts
```

### Writing Tests

- Place unit tests in `tests/unit/`
- Use descriptive test names
- Test edge cases and error conditions
- Mock external dependencies

## Documentation

- Update relevant documentation when making changes
- Add JSDoc comments for public functions
- Keep README.md up to date

## Questions?

If you have questions, feel free to:
- Open a GitHub issue
- Check existing documentation in `/docs`

Thank you for contributing!

# Testing

This document covers testing methods for the bot.

## Unit Tests

Run unit tests with Jest:

```bash
make test
# or
pnpm test
```

Run with coverage:

```bash
pnpm test:coverage
```

## Integration Testing

### OpenOcean Integration

Test the OpenOcean integration by running the development server and using the bot's trading features. The integration is tested through:

- `/buy` command - Tests quote and swap functionality
- `/sell` command - Tests token selling
- `/limit` command - Tests limit order creation

### Manual Testing Scripts

For manual testing of specific integrations, use ts-node to run scripts directly:

```bash
# Run any TypeScript file directly
pnpm ts-node -r tsconfig-paths/register scripts/your-script.ts
```

## Load Testing

We use [k6](https://k6.io/) for load testing. Install k6 first:

```bash
# macOS
brew install k6

# Other platforms: https://k6.io/docs/getting-started/installation/
```

Run load tests:

```bash
# Full load test
pnpm test:load

# Quick version (10 iterations)
pnpm test:load:quick
```

## Test Structure

```
tests/
├── unit/                 # Unit tests
│   ├── validators.test.ts
│   ├── formatters.test.ts
│   └── encryption.test.ts
└── rate-limit.test.js    # K6 load test
```

## Writing Tests

Unit tests use Jest with ts-jest. Example:

```typescript
import { isValidAmount } from '@/utils/validators';

describe('isValidAmount', () => {
  it('should return true for positive numbers', () => {
    expect(isValidAmount(100)).toBe(true);
  });

  it('should return false for zero', () => {
    expect(isValidAmount(0)).toBe(false);
  });
});
```

Run specific test files:

```bash
pnpm test -- validators.test.ts
```

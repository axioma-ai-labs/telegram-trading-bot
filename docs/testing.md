# Testing separate methods (OpenOcean, Wallet Generation, etc.)

## OpenOcean + QuickNode

You can test the OpenOcean integration directly using:

```bash
make run CMD="src/services/openocean/index.ts swap"
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

## Wallet Creation

**IMPORTANT**: Before running, uncomment code at the bottom.

```bash
make run CMD="scripts/create_test_wallet.ts"
```

## Rate limiting tests

For the rate limiting tests, we need to install `k6`. For Mac it's as simple as:

```bash
brew install k6
```

Then we can run the test with:

```bash
pnpm test:load
```

or a quick version:

```bash
pnpm test:load:quick
``` 
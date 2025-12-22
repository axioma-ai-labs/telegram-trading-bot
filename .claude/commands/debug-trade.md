---
description: Debug trading execution issues in the Telegram Trading bot
allowed-tools: Read, Grep, Bash(make test:*)
---

# Debug Trading Issue

Investigate the trading issue described: $ARGUMENTS

## Investigation Steps

1. Check the main trading service for the issue pattern
2. Review the OpenOcean DEX integration
3. Verify blockchain RPC interactions
4. Look for error handling gaps

## Key Files to Review

- Trading engine: @src/services/engine/neurodex.ts
- DEX aggregator: @src/services/engine/openocean.ts
- Blockchain client: @src/services/engine/viem.ts
- Buy callback: @src/bot/callbacks/buyCallback.ts
- Sell callback: @src/bot/callbacks/sellCallback.ts

## Current Test Status

```
!`pnpm test 2>&1 | tail -30`
```

## Common Issues

- Slippage too low for volatile tokens
- Insufficient gas estimation
- RPC rate limiting
- Token approval not completed

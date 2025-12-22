---
description: Create a new Telegram callback handler
allowed-tools: Read, Write, Edit, Grep
argument-hint: <callback_name>
---

# Add Callback Handler

Create a new Grammy callback handler named: $ARGUMENTS

## Reference Patterns

Review existing callback implementations:
- @src/bot/callbacks/buyCallback.ts
- @src/bot/callbacks/sellCallback.ts
- @src/bot/callbacks/walletCallback.ts

## Requirements

1. Follow the existing callback structure
2. Use TypeScript with proper typing
3. Include i18n support for all user messages
4. Handle errors gracefully with user-friendly messages
5. Add to the callback index at @src/bot/callbacks/index.ts

## Checklist

- [ ] Create callback file at `src/bot/callbacks/{name}Callback.ts`
- [ ] Export handler function
- [ ] Add i18n keys to locales if needed
- [ ] Register in index.ts
- [ ] Add any required types to `src/types/`

# Claude Code Setup Guide

This guide explains how to set up and use [Claude Code](https://claude.ai/claude-code) (Anthropic's official AI coding CLI) with this repository.

## Overview

Claude Code is an AI-powered command-line tool that helps with software engineering tasks. This repository includes configuration files that provide Claude with project-specific context, coding standards, and workflows.

## Prerequisites

- [Claude Code CLI](https://claude.ai/download) installed
- Valid Claude API subscription (Pro, Max, or API)
- Node.js 18+ and pnpm (for running project commands)

## Quick Start

```bash
# Navigate to the project
cd telegram-trading-bot

# Start Claude Code
claude

# Or start with a specific task
claude "help me understand the trading engine"
```

## Configuration Files

### File Hierarchy

```
telegram-trading-bot/
├── CLAUDE.md                      # Project instructions (shared)
├── CLAUDE.local.md                # Personal preferences (gitignored)
├── .claude/
│   ├── settings.json              # Project settings (shared)
│   ├── settings.local.json        # Personal settings (gitignored)
│   ├── commands/                  # Custom slash commands
│   │   ├── debug-trade.md         # Debug trading issues
│   │   ├── add-callback.md        # Add new callback handler
│   │   └── check-i18n.md          # Verify translations
│   └── rules/                     # Modular instruction files
│       ├── typescript.md          # TypeScript standards
│       └── telegram-bot.md        # Grammy/bot patterns
└── .mcp.json                      # MCP server configs (optional)
```

### CLAUDE.md

The root `CLAUDE.md` file provides Claude with essential project context:

- Quick commands (`make dev`, `make test`, etc.)
- Tech stack overview
- Project structure
- Coding guidelines (DO's and DON'Ts)
- Database models
- Key services and their locations

This file is **checked into git** and shared with the team. Keep it updated as the project evolves.

### CLAUDE.local.md (Personal)

Create `CLAUDE.local.md` in the project root for personal preferences:

```markdown
# Personal Preferences

- I prefer verbose explanations
- Always show git diffs before committing
- Use Russian for commit messages
```

This file is **gitignored** and won't be shared.

## Project Settings

### .claude/settings.json

Shared project settings that define permissions, environment variables, and hooks:

```json
{
  "permissions": {
    "allow": [
      "Bash(make:*)",
      "Bash(pnpm:*)",
      "Bash(git status:*)",
      "Bash(git diff:*)",
      "Bash(git log:*)",
      "Read"
    ],
    "deny": [
      "Read(.env)",
      "Read(.env.*)",
      "Bash(rm -rf:*)"
    ]
  },
  "env": {
    "NODE_ENV": "development"
  }
}
```

### .claude/settings.local.json (Personal)

Personal overrides that won't be committed:

```json
{
  "permissions": {
    "allow": [
      "Bash(git commit:*)",
      "Bash(git push:*)"
    ]
  }
}
```

## Custom Slash Commands

Create reusable workflows in `.claude/commands/`. Each `.md` file becomes a slash command.

### Example: Debug Trading Issues

`.claude/commands/debug-trade.md`:

```markdown
---
description: Debug trading execution issues
allowed-tools: Read, Grep, Bash(make test:*)
---

# Debug Trading Issue

Investigate the trading issue described: $ARGUMENTS

## Steps

1. Check the TradingApi service at @src/services/engine/neurodex.ts
2. Review the OpenOcean integration at @src/services/engine/openocean.ts
3. Check recent transaction logs
4. Look for error patterns in the callback handlers

Current test status:
!`make test 2>&1 | tail -20`
```

Usage: `/debug-trade "buy order failing with slippage error"`

### Example: Add New Callback Handler

`.claude/commands/add-callback.md`:

```markdown
---
description: Create a new Telegram callback handler
allowed-tools: Read, Write, Edit
argument-hint: <callback_name>
---

# Add Callback Handler

Create a new callback handler named: $ARGUMENTS

## Reference existing patterns

Check existing callbacks for patterns:
@src/bot/callbacks/buyCallback.ts
@src/bot/callbacks/sellCallback.ts

## Requirements

1. Follow Grammy callback patterns
2. Add proper TypeScript types
3. Include i18n support
4. Handle errors gracefully
5. Update the callback index if needed
```

### Example: Check Translations

`.claude/commands/check-i18n.md`:

```markdown
---
description: Verify translation completeness
allowed-tools: Read, Grep, Bash(cat:*)
---

# Check i18n Translations

Verify all translation keys are complete across locales.

## Locale files
- @locales/en/main.ftl
- @locales/ru/main.ftl
- @locales/es/main.ftl
- @locales/de/main.ftl

## Check for missing keys

Find all i18n usages in the codebase:
!`grep -r "t\(" src/ --include="*.ts" | head -30`
```

## Rules Directory

For modular instructions, use `.claude/rules/`. All `.md` files are automatically loaded.

### .claude/rules/typescript.md

```markdown
# TypeScript Standards

- Use strict mode (already configured in tsconfig.json)
- Always add explicit return types to functions
- Use async/await, never raw Promises
- Prefer `type` over `interface` for simple types
- Use Zod for runtime validation (see config/config.ts)
```

### .claude/rules/telegram-bot.md

```markdown
# Telegram Bot Patterns

## Grammy Framework
- Use `ctx.reply()` for messages
- Use `ctx.answerCallbackQuery()` for button responses
- Always handle errors with try/catch

## Callbacks
- Location: src/bot/callbacks/
- Follow naming: `{action}Callback.ts`
- Register in src/bot/callbacks/index.ts

## Commands
- Location: src/bot/commands/
- Follow naming: `{command}Command.ts`
- Use i18n for all user-facing text

## Message Formatting
- Location: src/bot/messages/
- Use inline keyboards from Grammy
- Format with Markdown v2
```

## MCP Server Integration (Optional)

For external tool integrations, create `.mcp.json`:

```json
{
  "mcpServers": {
    "github": {
      "type": "http",
      "url": "https://api.githubcopilot.com/mcp/",
      "headers": {
        "Authorization": "Bearer ${GITHUB_TOKEN}"
      }
    }
  }
}
```

## Recommended Workflows

### Development Session

```bash
# Start Claude Code
claude

# Useful commands during development
/help                    # Show available commands
/debug-trade "..."       # Debug trading issues
/add-callback wallet     # Add new callback
/check-i18n              # Verify translations
```

### Code Review

```bash
# Review changes before commit
claude "review my staged changes for potential issues"

# Check for security issues
claude "scan src/ for security vulnerabilities"
```

### Testing

```bash
# Run tests with Claude's help
claude "run tests and fix any failures"

# Add tests for a feature
claude "add unit tests for src/services/engine/neurodex.ts"
```

## Troubleshooting

### Claude doesn't see project context

1. Ensure you're in the project root directory
2. Check that `CLAUDE.md` exists and is readable
3. Run `claude --version` to verify CLI is updated

### Permission errors

Check `.claude/settings.json` and ensure the command is allowed:

```json
{
  "permissions": {
    "allow": ["Bash(your-command:*)"]
  }
}
```

### Slow responses

- Large files may slow down context loading
- Use `.claude/rules/` to split instructions into focused files
- Ensure `docs/auto/` (TypeDoc output) is gitignored

## Security Considerations

**Never add these to Claude's context:**
- `.env` files with secrets
- Private keys or credentials
- `node_modules/` directory
- Production database URLs

**The settings.json denies access to:**
- `.env` and `.env.*` files
- Any files in `keys/` or `wallets/` directories

## Further Reading

- [Claude Code Documentation](https://claude.ai/claude-code/docs)
- [CLAUDE.md Best Practices](https://www.claude.com/blog/using-claude-md-files)
- [Claude Code Settings Reference](https://code.claude.com/docs/en/settings)
- [Custom Slash Commands](https://code.claude.com/docs/en/slash-commands)

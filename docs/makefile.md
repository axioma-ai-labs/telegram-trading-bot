# Makefile Commands

The project includes a Makefile with common commands for development. Run `make help` to see all available commands.

## Quick Reference

```bash
make help       # Show all available commands
make deps       # Install dependencies
make dev        # Start development server with hot reload
make build      # Compile TypeScript to dist/
make lint       # Run ESLint
make lint-fix   # Auto-fix linting errors
make format     # Format code with Prettier
make test       # Run tests
make check      # Run all checks (lint + typecheck)
make migrate    # Run Prisma migrations
```

## Command Details

### `make deps`
Installs all project dependencies using pnpm.

```bash
make deps
# Equivalent to: pnpm install
```

### `make dev`
Starts the development server with hot reloading. Changes to source files automatically restart the bot.

```bash
make dev
# Equivalent to: pnpm run dev
# Uses ts-node-dev with --respawn --transpile-only
```

### `make build`
Compiles TypeScript source files to JavaScript in the `dist/` directory.

```bash
make build
# Equivalent to: pnpm run build
# Output: dist/
```

### `make lint`
Runs ESLint to check for code quality issues.

```bash
make lint
# Checks all .ts files
# Reports errors and warnings
```

### `make lint-fix`
Automatically fixes ESLint issues where possible.

```bash
make lint-fix
# Equivalent to: pnpm run lint:fix
# Auto-fixes formatting and simple issues
```

### `make format`
Formats code using Prettier and formats Prisma schema.

```bash
make format
# Formats src/**/*.ts and scripts/**/*.ts
# Also runs: pnpm prisma format
```

### `make test`
Runs the Jest test suite.

```bash
make test
# Equivalent to: pnpm test
```

### `make typecheck`
Runs TypeScript type checking without emitting files.

```bash
make typecheck
# Equivalent to: tsc --noEmit
```

### `make check`
Runs all quality checks (lint + typecheck).

```bash
make check
# Runs: make lint && make typecheck
# Outputs: "All checks passed!" on success
```

### `make migrate`
Runs Prisma migrations in development mode.

```bash
make migrate
# Equivalent to: pnpm prisma migrate dev
# Creates and applies new migrations
```

## Additional pnpm Scripts

These commands are available via pnpm but not in the Makefile:

```bash
pnpm run start        # Start production server
pnpm run docs         # Generate TypeDoc documentation
pnpm run docs:watch   # Generate docs and watch for changes
pnpm test:load        # Run K6 load tests
pnpm test:load:quick  # Quick load test (10 iterations)
```

## Workflow Examples

### Starting Development
```bash
make deps      # Install dependencies
make dev       # Start with hot reload
```

### Before Committing
```bash
make format    # Format code
make check     # Run all checks
make test      # Run tests
```

### Database Changes
```bash
# Edit prisma/schema.prisma
make migrate   # Create and apply migration
```

### Production Build
```bash
make build           # Compile TypeScript
pnpm run start       # Start production server
```

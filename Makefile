# Neurodex Bot

# Variables
NODE_BIN = ./node_modules/.bin
PNPM = pnpm
TS_NODE = $(NODE_BIN)/ts-node
TSC = $(NODE_BIN)/tsc
ESLINT = $(NODE_BIN)/eslint
PRETTIER = $(NODE_BIN)/prettier

.PHONY: help install dev build start lint format clean test check setup docker-build docker-run lint-fix

# Default target
help:
	@echo "Available commands:"
	@echo "  make install     - Install dependencies"
	@echo "  make dev         - Run development server with hot reload"
	@echo "  make lint        - Run eslint"
	@echo "  make lint-fix    - Fix linting errors automatically"
	@echo "  make format      - Format code with prettier"
	@echo "  make test        - Run tests"
	@echo "  make test-db-conn - Run test db connection"
	@echo "  make check       - Run all checks (lint + type check)"

install:
	$(PNPM) install

# Development mode with hot reload
dev:
	$(PNPM) run dev

# Run ESLint
lint:
	$(ESLINT) . --ext .ts

# Fix linting errors automatically
lint-fix:
	$(PNPM) run lint:fix

# Fix imports and format code
format:
	$(PRETTIER) --write "src/**/*.ts"

# Run tests
test:
	$(PNPM) test

# Run test db connection
test-db-conn:
	$(PNPM) run test:db-conn

# Run type checking
typecheck:
	$(TSC) --noEmit

# Run all checks
check: lint typecheck
	@echo "🟢 All checks passed!"

# Generate Prisma migrations
prisma-migrate-dev:
	$(PNPM) prisma migrate dev

# Neurodex Bot

# Variables
NODE_BIN = ./node_modules/.bin
PNPM = pnpm
TS_NODE = $(NODE_BIN)/ts-node
TSC = $(NODE_BIN)/tsc
ESLINT = $(NODE_BIN)/eslint
PRETTIER = $(NODE_BIN)/prettier
PRISMA = $(PNPM) prisma

.PHONY: help install dev build start lint format clean test check setup docker-build docker-run lint-fix

# Default target
help:
	@echo "Available commands:"
	@echo "  make deps        - Install dependencies"
	@echo "  make dev         - Run development server with hot reload"
	@echo "  make build       - Build the project"
	@echo "  make lint        - Run eslint"
	@echo "  make lint-fix    - Fix linting errors automatically"
	@echo "  make format      - Format code with prettier"
	@echo "  make test        - Run tests"
	@echo "  make check       - Run all checks (lint + type check)"
	@echo "  make migrate     - Run Prisma migrations"

# Install dependencies
deps:
	$(PNPM) install

# Development mode with hot reload
dev:
	$(PNPM) run dev

# Build the project
build:
	$(PNPM) run build

# Run ESLint
lint:
	$(ESLINT) . --ext .ts

# Fix linting errors automatically
lint-fix:
	$(PNPM) run lint:fix

# Fix imports and format code
format:
	$(PRETTIER) --write "src/**/*.ts"
	$(PRETTIER) --write "scripts/**/*.ts"
	$(PRISMA) format

# Run tests
test:
	$(PNPM) test

# Run type checking
typecheck:
	$(TSC) --noEmit

# Run all checks
check: lint typecheck
	@echo "🟢 All checks passed!"

# Generate Prisma migrations
migrate:
	$(PRISMA) migrate dev

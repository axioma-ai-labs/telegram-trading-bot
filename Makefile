# Neurodex Bot

# Variables
NODE_BIN = ./node_modules/.bin
NPM = npm
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
	@echo "  make check       - Run all checks (lint + type check)"

install:
	$(NPM) install

# Development mode with hot reload
dev:
	$(NPM) run dev

# Run ESLint
lint:
	$(ESLINT) . --ext .ts

# Fix linting errors automatically
lint-fix:
	$(NPM) run lint:fix

# Fix imports and format code
format:
	$(PRETTIER) --write "src/**/*.ts"

# Run tests
test:
	$(NPM) test

# Run type checking
typecheck:
	$(TSC) --noEmit

# Run all checks
check: lint typecheck
	@echo "🟢 All checks passed!"
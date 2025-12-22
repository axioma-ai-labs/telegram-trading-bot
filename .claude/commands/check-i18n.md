---
description: Verify translation completeness across all locales
allowed-tools: Read, Grep
---

# Check i18n Translations

Verify all translation keys are complete and consistent across locales.

## Supported Locales

- English (primary): @locales/en/
- Russian: @locales/ru/
- Spanish: @locales/es/
- German: @locales/de/

## i18n Service

Configuration: @src/services/i18n/i18n.ts

## Find Translation Usages

Search for i18n function calls in the codebase to identify all required keys.

## Verification Steps

1. List all keys used in the English locale (source of truth)
2. Compare with other locales for missing translations
3. Check for unused translation keys
4. Verify placeholder consistency (e.g., `{amount}`, `{token}`)

## Common Issues

- Missing keys in non-English locales
- Inconsistent placeholder names
- Hardcoded strings that should use i18n

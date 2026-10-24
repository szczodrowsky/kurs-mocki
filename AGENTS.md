# Repository Guidelines

## Project Overview

This is a TypeScript Playwright automation project with Faker.js mock data. Organize UI automation with the Page Object Model: put page classes in `src/pages/`, fixtures in `src/fixtures/`, specs in `src/tests/`, reusable generators in `src/helpers/`, enums in `src/enums/`, and types in `src/types/`. Playwright is configured in `playwright.config.ts`. The `src/tests/` directory currently has no tracked specs.

## Development Commands

- `npm ci` installs the exact versions from the lockfile.
- `npm run typecheck` runs strict TypeScript checking without emitting files.
- `npm test` runs Playwright tests under `src/tests/`.
- `npm run check:ci` runs Biome checks without writing changes.
- `npm run format:check` checks formatting; `npm run format` applies formatting.

Use Node `24.14.0` from `.nvmrc` and npm `11.9.0` from `package.json`. There is no build or local server script. `npm run check` uses `--write --unsafe` and can modify files; use `check:ci` for read-only checks.

## TypeScript and Naming

Strict TypeScript settings are enabled. Avoid `any` and type assertions unless necessary; use `import type` for type-only imports. Use the configured aliases for imports across `src/`:

| Alias | Directory |
| --- | --- |
| `@components/*` | `src/components/*` |
| `@enums/*` | `src/enums/*` |
| `@fixtures/*` | `src/fixtures/*` |
| `@helpers/*` | `src/helpers/*` |
| `@pages/*` | `src/pages/*` |
| `@tests/*` | `src/tests/*` |
| `@models/*` | `src/types/*` |

Follow Biome: tabs (two-column width), single quotes, semicolons, no trailing commas, and parenthesized arrow parameters. Use kebab-case filenames, camelCase functions and variables, PascalCase types and enum names, and `UPPER_SNAKE_CASE` enum keys. Enum values should match backend strings.


## Hooks, Commits, and Configuration

Husky runs `lint-staged` and typecheck before commits. Staged TypeScript gets Biome checks; staged JSON and Markdown are formatted. Recent commit subjects are short but inconsistent; prefer concise prefixes such as `feat:`, `fix:`, or `ci:`. PRs should describe changes and list validation results.

Use `.env.example` and `config/.env.local.dist` as templates. Keep credentials out of tracked files and check Git status before committing environment changes. `config/.env.local` is currently tracked despite the ignore pattern; do not add secrets to it.

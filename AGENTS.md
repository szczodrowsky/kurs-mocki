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

Always finish work by running the Biome scripts from `package.json`: `npm run check:ci` and `npm run format:check`. Resolve any reported issues before completing the task.

## TypeScript and Naming

Strict TypeScript settings are enabled. Avoid `any` and type assertions unless necessary; use `import type` for type-only imports. Use the configured aliases for imports across `src/`:

Always define custom types and interfaces in separate files under `src/types/`, outside implementation files. Import them with `import type` using the `@models/*` alias.

Do not add comments when generating or editing code files. Use clear names and simple structure to convey intent.

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

Page Object filenames are an exception: use camelCase, such as `loginPage.ts`. Keep class names in PascalCase (`LoginPage`) and instance names in camelCase (`loginPage`). Group locators by element kind into readonly objects such as `inputs`, `buttons`, `links`, `headings`, and `selects`, as applicable. Define group types separately in `src/types/`. Keep Page Objects simple: expose locators for individual actions and add methods only for useful workflows or navigation. Avoid wrappers around a single `fill()` or `click()` and unnecessary abstraction layers.

Use the same locator grouping convention on every page, including `checkboxes` where applicable. For repeated elements such as product cards, scope single-element actions to the intended item instead of silently selecting the first match.

For Page Objects, use `getByTestId` with existing `data-testid` attributes by default. Verify locators against the current page with Playwright CLI. Use `getByRole` or `getByLabel` only when a suitable test ID is unavailable.

## Language and Interactive API Mocking

Write repository content in English unless a specific task explicitly requests another language.

Use the local `.env` file for test credentials. For `https://aitesters.byst.re`, use `ADMIN_LOGIN_USERNAME` and `ADMIN_LOGIN_PASSWORD`. Never print credential values or authentication tokens, copy them into tracked files, or commit `.env`.

Run tests and all browser automation commands outside the sandbox (`sandbox_permissions: "require_escalated"`). Sandboxed process creation fails with Windows access denied in this environment; do not treat that failure as an application issue.

For interactive API mock creation, inspection, and demonstrations with Playwright CLI, use a visible browser (`--headed`) in a named project session and keep the session between commands. If the current session is headless, start a headed session and set up the required mocks again before triggering requests. Leave the browser open after the demonstration unless the user asks to close it. This rule applies to interactive CLI work; automated tests and CI may run headless.

## Hooks, Commits, and Configuration

Husky runs `lint-staged` and typecheck before commits. Staged TypeScript gets Biome checks; staged JSON and Markdown are formatted. Recent commit subjects are short but inconsistent; prefer concise prefixes such as `feat:`, `fix:`, or `ci:`. PRs should describe changes and list validation results.

Use `.env.example` and `config/.env.local.dist` as templates. Keep credentials out of tracked files and check Git status before committing environment changes. `config/.env.local` is currently tracked despite the ignore pattern; do not add secrets to it.

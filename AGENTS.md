# Repository Guidelines

## Project Overview

This is a TypeScript Playwright automation project with Faker.js mock data. Organize UI automation with the Page Object Model: put page classes in `src/pages/`, fixtures in `src/fixtures/`, specs in `src/tests/`, reusable generators in `src/helpers/`, enums in `src/enums/`, and types in `src/types/`. Playwright is configured in `playwright.config.ts`.

## Development Commands

- `npm ci` installs the exact versions from the lockfile.
- `npm run typecheck` runs strict TypeScript checking without emitting files.
- `npm test` runs all Playwright tests under `src/tests/` with two workers.
- `npm run test:login`, `npm run test:products`, and `npm run test:cart` select a Playwright project. `npm run test:ui` opens the test runner UI.
- `npm run check:ci` runs Biome checks without writing changes.
- `npm run format:check` checks formatting; `npm run format` applies formatting.

Use Node `24.14.0` from `.nvmrc` and npm `11.9.0` from `package.json`. There is no build or local server script. `npm run check` uses `--write --unsafe` and can modify files; use `check:ci` for read-only checks.

Always finish work by running the Biome scripts from `package.json`: `npm run check:ci` and `npm run format:check`. Resolve any reported issues before completing the task.

## Playwright Sharding

GitHub Actions runs four shards on separate runners after the quality checks pass. The `login`, `products`, and `cart` projects are included in the sharded suite. Each runner uses two Playwright workers and signs in through the API for its own storage state.

Each shard uploads a blob report. The `merge-reports` job combines the available blobs into one HTML report, including when a shard reports test failures. Download `playwright-report` from the workflow run's artifacts. The intermediate blobs are kept for one day and the HTML report for seven days.

Run the full suite locally with `npm test`, or reproduce a shard with `npm test -- --shard=1/4`. Local runs generate HTML reports and can include traces. CI uses blob reports and disables traces to keep them out of uploaded artifacts.

To merge downloaded shard ZIPs locally, put them in `blob-report/` and run `npx playwright merge-reports --reporter=html blob-report`.

## TypeScript and Naming

Strict TypeScript settings are enabled. Avoid `any` and type assertions unless necessary; use `import type` for type-only imports. Use the configured aliases for imports across `src/`:

Always define custom types and interfaces in separate files under `src/types/`, outside implementation files. Import them with `import type` using the `@models/*` alias.

Do not add comments when generating or editing code files. Use clear names and simple structure to convey intent.

| Alias | Directory |
| --- | --- |
| `@enums/*` | `src/enums/*` |
| `@fixtures/*` | `src/fixtures/*` |
| `@helpers/*` | `src/helpers/*` |
| `@pages/*` | `src/pages/*` |
| `@models/*` | `src/types/*` |

Follow Biome: tabs (two-column width), single quotes, semicolons, no trailing commas, and parenthesized arrow parameters. Use kebab-case filenames, camelCase functions and variables, PascalCase types and enum names, and `UPPER_SNAKE_CASE` enum keys. Enum values should match backend strings.

Page Object filenames are an exception: use camelCase, such as `loginPage.ts`. Keep class names in PascalCase (`LoginPage`) and instance names in camelCase (`loginPage`). Group locators by element kind into readonly objects such as `inputs`, `buttons`, `links`, `headings`, and `selects`, as applicable. Define group types separately in `src/types/`. Keep Page Objects simple: expose locators for individual actions and add methods only for useful workflows or navigation. Avoid wrappers around a single `fill()` or `click()` and unnecessary abstraction layers.

Use the same locator grouping convention on every page, including `checkboxes` where applicable. For repeated elements such as product cards, scope single-element actions to the intended item instead of silently selecting the first match.

For Page Objects, use `getByTestId` with existing `data-testid` attributes by default. Verify locators against the current page with Playwright CLI. Use `getByRole` or `getByLabel` only when a suitable test ID is unavailable.

Define locators in the Page Object constructor and store them in readonly fields or groups. Methods must use those existing locators rather than define new ones. Do not embed selectors or call `getByTestId`, `getByRole`, `getByLabel`, or `locator` directly inside action or navigation methods. Dynamic item scoping should reuse declared locators instead of introducing new selector definitions inside methods.

## Test Fixtures

Global setup signs in through the API once per run. The `storageState` fixture loads the resulting file from `.playwright/.auth/`. Global teardown removes the run's file. Set `skipAutoLogin: true` for login-form tests and `freshSession: true` for tests that exercise session refresh or invalidation. Tests with custom `credentials` use their own API session.
UI specs import `test` and `expect` from `@fixtures/page-fixtures.js` and use the provided Page Objects.
Use flat `test.describe` groups and assign each test to one category with `@login`, `@products`, or `@cart`. Test recordings go in the individual test's output directory.
The live product availability test runs in the `products` project and requires the configured backend to have product `8` in stock.
Follow the [api-login skill](.agents/skills/api-login/SKILL.md) for authentication details, new roles, and Playwright CLI/MCP sessions.

## Language and Interactive API Mocking

Write repository content in English unless a specific task explicitly requests another language.

Use the [har-to-mock skill](.agents/skills/har-to-mock/SKILL.md) for manual HAR-to-JSON refreshes of `src/mocks/product.json`, keeping new recordings and temporary files local. JSON-based tests use that fixture independently of HAR; refreshing it does not change existing HAR methods, tests, or recording configuration.

Use the local `.env` file for test credentials. For `https://aitesters.byst.re`, use `ADMIN_LOGIN_USERNAME` and `ADMIN_LOGIN_PASSWORD`. Never print credential values or authentication tokens, copy them into tracked files, or commit `.env`.

Run tests and all browser automation commands outside the sandbox (`sandbox_permissions: "require_escalated"`). Sandboxed process creation fails with Windows access denied in this environment; do not treat that failure as an application issue.

For Playwright CLI work, use a named headless project session (`npx --no-install playwright-cli -s=kurs-mocki-headless open`) and reuse it between commands. Use `--headed` only for an explicitly requested visible session. Remove temporary routes after verification and leave the session running unless the user asks to close it.

## Environment Variables

`playwright.config.ts` loads `.env` through `dotenv/config`. Read required variables with `getRequiredEnv` from `src/helpers/get-required-env.ts`. The helper returns a `string` and throws an error naming the variable when it is missing or empty. Do not replace missing values with empty strings or use non-null assertions to suppress environment typing errors. Never include secret values in error messages.

| Variable | Purpose |
| --- | --- |
| `BASE_URL` | Application origin used by Playwright `use.baseURL` for relative navigation. |
| `ADMIN_LOGIN_USERNAME` | Default admin username used by the configurable `credentials` fixture option. |
| `ADMIN_LOGIN_PASSWORD` | Default admin password used by the configurable `credentials` fixture option. |

`getAdminCredentials` reads the login variables through `getRequiredEnv` when the default credentials fixture is used. Keep actual values in the local ignored `.env` file or the process environment; `.env.example` contains only the public URL and empty credential placeholders. In CI, the workflow supplies `BASE_URL` from a repository variable with a default application URL and the login variables from repository secrets.

## Hooks, Commits, and Configuration

Husky runs `lint-staged` and typecheck before commits. Staged TypeScript gets Biome checks; staged JSON and Markdown are formatted. Recent commit subjects are short but inconsistent; prefer concise prefixes such as `feat:`, `fix:`, or `ci:`. PRs should describe changes and list validation results.

Use `.env.example` as the template for the local `.env` file. UI tests use `BASE_URL`, `ADMIN_LOGIN_USERNAME`, and `ADMIN_LOGIN_PASSWORD`. Keep credentials out of tracked files and check Git status before committing environment changes.

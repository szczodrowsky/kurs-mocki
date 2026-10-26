---
name: api-login
description: >-
  Use when adding or changing API authentication for Playwright tests, adding a test
  user or role, configuring loginViaApi or skipAutoLogin, or authenticating a live
  Playwright CLI/MCP browser for verification in this project. Login-form behavior
  itself remains a UI test with automatic authentication disabled.
---

# API login

## Locate the existing implementation

Read `AGENTS.md` and these sources before changing authentication:

| Responsibility | Current source |
| --- | --- |
| API sign-in and browser session seeding | `src/helpers/login-via-api.ts` |
| Automatic `loginViaApi`, `credentials`, and `skipAutoLogin` fixtures | `src/fixtures/page-fixtures.ts` |
| Default test user | `src/helpers/login-credentials.ts` |
| Credential and fixture types | `src/types/login-credentials.ts`, `src/types/page-fixtures.ts` |

The `loginViaApi` helper performs both API sign-in and session seeding.
Reuse it through the automatic fixture; a new user role normally needs only different credentials, not another authentication helper.

## Authenticate tests and additional roles

- API sign-in in `loginViaApi`: POST JSON containing `username` and `password` to `/api/v1/users/signin` on the configured application origin. Send `X-Client-Session-Id`; use a fresh ID for each isolated test session. Validate the HTTP status and JSON, require non-empty string `token` and `refreshToken` values, and reject an unfinished MFA challenge. Do not log the request body, response body, credentials, or tokens.
- Session seeding in the same helper: initialize the application origin's local storage with `token`, `refreshToken`, and `clientSessionId` before application scripts run. Prefer the session ID returned in `x-client-session-id` when present; otherwise retain the ID sent with sign-in. The helper uses `context.setStorageState` on a fresh test context. The observed sign-in response does not set authentication cookies; preserve any required cookies if the contract changes.
- Keep `loginViaApi` test-scoped and automatic with `{ auto: true }`. It uses the configured `credentials` and yields `true` after authentication. With `skipAutoLogin: true`, it sends no sign-in request, does not seed authentication state, and yields `false`.
- UI specs import `test` and `expect` from `@fixtures/page-fixtures.js` and receive Page Objects through fixtures. They do not repeat authentication setup or call `loginPage.login()` to prepare unrelated scenarios.
- Add a requested role to the existing user-definition helper using `LoginCredentials`. Resolve credentials lazily, following `getAdminCredentials`, so unused roles do not require unrelated environment variables during test discovery. Read that role's secrets with `getRequiredEnv`; keep actual values in ignored `.env` or CI secrets. Add only empty placeholders to `.env.example` when new variables are needed. Do not create accounts or change permissions unless requested.
- Select a role with `test.use({ credentials: roleCredentials })`. For tests of the login form itself, scope `test.use({ skipAutoLogin: true })` to the relevant file or `test.describe` group, then navigate through `loginPage` explicitly.
- Keep custom types under `src/types/`, import them with `import type` through `@models/*`, and follow the existing aliases. Keep selectors in Page Object constructors and prefer existing `getByTestId` locators. Do not add code comments.

## Authenticate a real browser through Playwright CLI or MCP

Use API authentication for browser inspection and verification too. Do not fill the login form as a shortcut for establishing a session; interact with it only when the login form is the behavior under test.

1. Reuse the current browser session. For interactive CLI work, use a headed browser in a named project session and leave it open after verification. Preserve existing storage-state files, cookies, and unrelated browser storage. Do not reset the context, call `localStorage.clear()`, clear cookies, or delete storage state to authenticate.
2. Read the selected user's credentials through `getRequiredEnv` in the local environment. Never hardcode secrets in tracked files or emit them in tool results. CLI `run-code` has no Node imports or `process.env`; use a local harness to supply credentials and suppress raw CLI output if it echoes credential-bearing code. Emit only safe verification results.
3. On the target application origin, call `/api/v1/users/signin` using an API request or browser-side fetch with the same JSON payload, session header, and validation as the test helper. Do not return the authentication response from `browser_evaluate` or `run-code`.
4. Use MCP `browser_evaluate`, or CLI `run-code` with `page.evaluate`, to update only the authentication keys in the existing page's local storage. Reuse its `clientSessionId` when available, or generate one for the sign-in request. Do not call the test helper's context-replacing `setStorageState` on an existing interactive session.

```ts
await page.evaluate(({ token, refreshToken, clientSessionId }) => {
	localStorage.setItem('token', token);
	localStorage.setItem('refreshToken', refreshToken);
	localStorage.setItem('clientSessionId', clientSessionId);
}, session);
await page.reload();
```

Here `session` contains the validated sign-in tokens and the matching client session ID; never print it.
Reload or navigate to the requested page after seeding, verify `/api/v1/users/me` succeeds using that session, and assert the requested UI state with existing test IDs.
Report visible results and HTTP statuses without exposing tokens or credentials.

## Verify the change

Run the affected tests and required project checks, including `npm run check:ci` and `npm run format:check`.
When changing authentication code, verify both default API login and the `skipAutoLogin` branch without weakening existing assertions.
Keep generated authentication state and raw HARs ignored by Git.

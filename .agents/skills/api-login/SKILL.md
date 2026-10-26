---
name: api-login
description: >-
  Authenticate an administrator and continue in an authenticated Playwright CLI/MCP
  browser. Use for requests to log in as admin, open the admin panel, or prepare a
  session for inspection or verification; also use when adding or changing API
  authentication for Playwright tests, adding a test user or role, or configuring
  loginViaApi or skipAutoLogin. Session preparation uses the API; testing login-form
  behavior remains a UI test with automatic authentication disabled.
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

## Load configuration safely

- Load `dotenv/config` in the local Node harness, as `playwright.config.ts` does. Read `BASE_URL`, `ADMIN_LOGIN_USERNAME`, and `ADMIN_LOGIN_PASSWORD` through `getRequiredEnv` from `src/helpers/get-required-env.ts`, following the mapping in `getAdminCredentials()`. Preflight all three; if any are missing, report only their names and stop before requesting login.
- Keep `.env` ignored. `.env.example` contains only the public application URL and empty credential placeholders. Never hardcode credentials or persist passwords, tokens, or full login responses in source, shell history, or storage-state exports. Existing local HAR and trace diagnostics may contain secrets only when Git-ignored and untracked; verify both conditions before recording. Never stage, commit, upload, or share those artifacts.
- Pass secrets between the local harness and browser in memory. Do not interpolate secret values into tool-call text or return them from browser evaluation. CLI output can echo executed code: capture stdout/stderr privately, suppress raw output and exception details, and emit only whitelisted statuses and verification booleans. Do not dump cookies, storage, request headers, or response bodies.

## Authenticate tests and additional roles

- API sign-in in `loginViaApi`: POST JSON containing `username` and `password` to `/api/v1/users/signin` on the configured application origin. Send `X-Client-Session-Id`; use a fresh ID for each isolated test session. Validate the HTTP status and JSON, require non-empty string `token` and `refreshToken` values, and reject an unfinished MFA challenge. Do not print the request body, response body, credentials, or tokens.
- Session seeding in the same helper: initialize the application origin's local storage with `token`, `refreshToken`, and `clientSessionId` before application scripts run. Prefer the session ID returned in `x-client-session-id` when present; otherwise retain the ID sent with sign-in. The helper uses `context.setStorageState` on a fresh test context. The observed sign-in response does not set authentication cookies; preserve any required cookies if the contract changes.
- Keep `loginViaApi` test-scoped and automatic with `{ auto: true }`. It uses the configured `credentials` and yields `true` after authentication. With `skipAutoLogin: true`, it sends no sign-in request, does not seed authentication state, and yields `false`.
- UI specs import `test` and `expect` from `@fixtures/page-fixtures.js` and receive Page Objects through fixtures. They do not repeat authentication setup or call `loginPage.login()` to prepare unrelated scenarios.
- Add a requested role to the existing user-definition helper using `LoginCredentials`. Resolve credentials lazily, following `getAdminCredentials`, so unused roles do not require unrelated environment variables during test discovery. Read that role's secrets with `getRequiredEnv`; keep actual values in ignored `.env` or CI secrets. Add only empty placeholders to `.env.example` when new variables are needed. Do not create accounts or change permissions unless requested.
- Select a role with `test.use({ credentials: roleCredentials })`. For tests of the login form itself, scope `test.use({ skipAutoLogin: true })` to the relevant file or `test.describe` group, then navigate through `loginPage` explicitly.
- Keep custom types under `src/types/`, import them with `import type` through `@models/*`, and follow the existing aliases. Keep selectors in Page Object constructors and prefer existing `getByTestId` locators. Do not add code comments.

## Authenticate a real browser through Playwright CLI or MCP

Use API authentication for browser inspection and verification too. Do not fill the login form as a shortcut for establishing a session; interact with it only when the login form is the behavior under test.

1. Reuse the current browser session. For interactive CLI work, use a headed browser in a named project session and leave it open after verification. Preserve existing storage-state files, cookies, and unrelated browser storage. Do not reset the context, call `localStorage.clear()`, clear cookies, or delete storage state to authenticate.
2. Follow the `playwright-cli` skill for session commands. Reuse the named headed project session, or open one with `-s=<project-session> open --headed` if none exists. Run browser commands outside the sandbox as required by `AGENTS.md`. CLI `run-code` has no Node imports or `process.env`; supply environment-derived values through the local harness described above.
3. Navigate to the configured `BASE_URL` origin if necessary. Reuse its existing `clientSessionId`, or generate one for the request. Call `/api/v1/users/signin` with the same JSON payload, session header, and validation as the helper. Prefer the response's `x-client-session-id`, falling back to the request ID. Keep the validated tokens in memory.
4. Before replacing browser authentication, verify the candidate identity and requested role through `/api/v1/users/me`. For administrator access, also apply the authorization checks below. If verification fails, leave the existing authentication keys untouched.
5. Use MCP `browser_evaluate`, or CLI `run-code` with `page.evaluate`, to update only the three authentication keys. Do not call the helper's context-replacing `setStorageState` on an existing interactive session.

```ts
await page.evaluate(({ token, refreshToken, clientSessionId }) => {
	localStorage.setItem('token', token);
	localStorage.setItem('refreshToken', refreshToken);
	localStorage.setItem('clientSessionId', clientSessionId);
}, session);
await page.reload();
```

Here `session` contains the validated sign-in tokens and the matching client session ID; never print it.
Reload or navigate to the requested page after seeding. Verify `/api/v1/users/me` and the requested UI using the browser's stored session; apply the checks below for administrator access. Continue the requested work in that same open browser.

## Verify administrator access

- Send `Authorization: Bearer <token>` and `X-Client-Session-Id` from the candidate session to `GET /api/v1/users/me`. Require HTTP 200 and an explicit `ROLE_ADMIN` or `ADMIN` entry in `roles`, matching the application's admin route guard. Receiving a token, decoding a JWT, or recognizing a username does not prove authorization.
- Require HTTP 200 from the read-only `GET /api/v1/admin/inventory` with the same headers. Do not modify products, accounts, or permissions to verify access. Recheck the current frontend/API contract if these endpoints or role values change; do not weaken the check to make it pass.
- After seeding, open `/admin/inventory`, require visible `getByTestId('admin-inventory')`, and repeat the identity and read-only authorization checks using the browser's stored session. Then navigate to the user's requested page if different. Report only the role label, HTTP statuses, visible UI result, and whether the named headed session remains open.

## Handle authentication failures

- On rejected credentials, stop and report the operation and HTTP status without bodies or secret values. Do not guess passwords or repeatedly retry. Ask the user to correct the environment privately.
- If the identity lacks the admin role or an admin request returns 403, report missing authorization and preserve the previous browser session. Request an authorized administrator account; do not create accounts, alter roles, or bypass route guards.
- If sign-in returns `mfaRequired` or an MFA challenge, stop automatic session seeding and ask the user to complete the application's supported MFA flow. Never expose challenge tokens, fabricate completion, or bypass MFA. Verify the identity and admin access again after completion.
- Treat malformed JSON, missing tokens, expired authentication, and network failures as unsuccessful verification. Report only a safe error category or HTTP status, leaving existing session data intact where authentication has not yet been replaced.

## Verify the change

Run the affected tests and required project checks, including `npm run check:ci` and `npm run format:check`.
When changing authentication code, verify both default API login and the `skipAutoLogin` branch without weakening existing assertions.
Keep generated authentication state and raw HARs ignored by Git.

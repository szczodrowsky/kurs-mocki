# Playwright CLI workflow

Use Playwright CLI to inspect and mock the target application at <https://aitesters.byst.re/login>.
There is no separate local demo server. Run commands from the repository root in PowerShell.

## Open the application

Install dependencies with `npm ci` before the first run. The project pins `@playwright/cli`;
use `npx --no-install playwright-cli`, which is separate from the Playwright test runner.

```powershell
npx --no-install playwright-cli -s=kurs-mocki open https://aitesters.byst.re/login --browser=chromium --headed
npx --no-install playwright-cli -s=kurs-mocki snapshot
```

Log in with an existing test account in the visible browser. Do not put credentials in this document,
CLI snippets, or tracked files. Use the same named session for subsequent commands and leave it open
after the demonstration. If a session is headless, start a headed session and reinstall its mocks
before triggering requests.

## Inspect before mocking

1. Navigate to the screen under test and capture a fresh snapshot.
2. Perform the action that loads its data. Use element references from the current snapshot;
   references such as `e5` are not stable selectors.
3. Inspect the network requests:

```powershell
npx --no-install playwright-cli -s=kurs-mocki requests
```

Confirm the request URL, method, response shape, and visible result before writing a mock.
Do not assume that the application uses `/api/products` or that the existing product generator
matches its response contract.

## First mocking scenario

Use one verified data-loading screen for the first scenario:

1. Log in and open the screen using the real application.
2. Install a mock for the observed request before triggering it again.
3. Return a successful response matching the observed contract and assert the rendered data.
4. Replace it with an HTTP error and assert the application's error state.
5. Remove the mock and confirm that the screen loads its real data again.

For automated coverage, put page interactions in `src/pages/`, fixtures in `src/fixtures/`,
and specs in `src/tests/`. Reuse `src/helpers/generate-products.ts` only if the observed product
contract matches, or adapt its types and generator first. Mock only the data request under test;
keep authentication real.

The authenticated screen, endpoint, and UI assertions still need browser verification before this
scenario can become a runnable test.

For CLI syntax and mocking examples, see the
[Playwright CLI skill](../.agents/skills/playwright-cli/SKILL.md) and its
[request mocking reference](../.agents/skills/playwright-cli/references/request-mocking.md).

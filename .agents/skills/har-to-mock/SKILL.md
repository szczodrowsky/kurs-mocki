---
name: har-to-mock
description: >-
  Use when refreshing src/mocks/product.json from the real products API through
  a temporary Playwright HAR recording in this project. The agent records,
  validates, whitelists, and publishes product data, then removes its temporary
  artifacts. Do not use for routine test runs, HAR replay, or CI recording.
---

# HAR to product mock

## Read the current contract

Read `AGENTS.md`, the [api-login skill](../api-login/SKILL.md), `src/fixtures/page-fixtures.ts`, `src/pages/productsPage.ts`, `src/types/product.ts`, `src/enums/product-category.enum.ts`, and `playwright.config.ts` before recording.
Use the existing automatic API login and Page Objects. Preserve `mockResponse()`, `mockFromJson()`, existing HAR methods and tests, recording configuration, and fixtures.
The JSON-based test reads `src/mocks/product.json` through `mockFromJson()` without requiring a HAR or starting a recording. Its assertions check visibility and a non-empty list, not fixed names or product counts.

The only durable output of a refresh is `src/mocks/product.json`.
Do not add a permanent recording script, recording test, environment flag, or dependency. Do not remove existing HAR recording or replay functionality.
Run this workflow manually outside CI, with tests outside the sandbox as required by `AGENTS.md`.

## Protect existing work

- Inspect Git status and preserve user edits. Snapshot the current JSON before starting and refuse to replace it if someone changes it during the refresh.
- Reserve `src/tests/record-har.tmp.spec.ts` with exclusive creation. If it already exists, stop without overwriting or deleting it.
- The recording path is `src/hars/network.har`. If a file already exists there, move it to a unique, unused sibling backup and restore it in cleanup. Do not overwrite or discard existing HARs, directories, storage state, or browser sessions.
- Reserve the recording path for this run before launching Playwright. Track which files this run owns and avoid concurrent recordings.
- Reserve a unique results directory inside `src/hars/` and pass it through Playwright's `--output` option, so the temporary run cannot clear another run's results.
- Wrap creation, execution, extraction, and cleanup in an ephemeral harness with `try/finally`. Do not leave the harness in the repository.

## Record with a temporary test

Create only this temporary spec, using the shared fixtures and automatic login:

```ts
import { expect, test } from '@fixtures/page-fixtures.js';

test.use({ contextOptions: {}, trace: 'off', screenshot: 'off' });

test('records the products response for a JSON mock', async ({ page, productsPage }) => {
	await page.routeFromHAR('src/hars/network.har', {
		url: '**/api/v1/products',
		update: true,
		updateMode: 'minimal',
		updateContent: 'embed'
	});
	await productsPage.goto();
	await expect(productsPage.productCards.first()).toBeVisible();
});
```

Run it from the repository root in the existing project, with `$recordingOutput` set to this run's reserved results directory:

```powershell
npx --no-install playwright test src/tests/record-har.tmp.spec.ts --project=mocking_tests --reporter=line --output="$recordingOutput"
```

Wait for the command to finish: Playwright closes the context and flushes the HAR during teardown.
A failed test is not a valid refresh. On any exit path, remove only the temporary spec created by this run, after the test process has stopped.
This is an automated recording test; headed mode is not required. Do not replace automatic API authentication with UI login.
The temporary test's empty `contextOptions` disables inherited diagnostic HAR recording only for this run, avoiding extra recordings in another test's results. Leave the shared fixture and global recording configuration unchanged.

## Extract and validate before publishing

Use an ephemeral process and existing tooling; do not install packages or add a conversion script.
Read only the HAR created by this run. Select the last successful 2xx `GET` entry whose parsed URL pathname is exactly `/api/v1/products`; do not use another endpoint, a failed response, or an older recording.
Decode `response.content.text` as UTF-8 after base64 decoding when `response.content.encoding` is `base64`; otherwise use the plain text. Reject missing content, unsupported encodings, and malformed JSON.

Require a non-empty array and validate every record against the current `Product` interface and runtime `ProductCategory` values:

- Each record is a non-null object, not an array, and has every required field.
- `id` is a positive safe integer and IDs are unique in the array.
- `name`, `description`, and `imageUrl` are non-empty strings.
- `price` is finite and non-negative; `stockQuantity` is a non-negative safe integer.
- `category` is one of the current `ProductCategory` values. Read the enum instead of guessing or maintaining a second category list.
- `createdAt` and `updatedAt` are non-empty, parseable date strings in the backend's ISO-style format.
- Re-read the contract when it changes; do not silently ignore newly required Product fields or use type assertions instead of validation.

Construct each output record with this explicit whitelist, updating it only when the Product contract changes:

```ts
{
	id: product.id,
	name: product.name,
	description: product.description,
	price: product.price,
	stockQuantity: product.stockQuantity,
	category: product.category,
	imageUrl: product.imageUrl,
	createdAt: product.createdAt,
	updatedAt: product.updatedAt
}
```

Never spread or copy a complete source record into the output. Discard all additional fields, request headers, cookies, tokens, and HAR metadata. Do not print raw HAR content, credentials, or authentication values.

Serialize only the validated, whitelisted array using the repository's JSON formatting.
Write a uniquely named candidate inside ignored `src/hars/`; validate the serialized candidate and keep the previous JSON untouched until the whole recording workflow succeeds.
After successful cleanup, confirm the destination still matches its initial snapshot and atomically replace `src/mocks/product.json` with the candidate on the same filesystem.
If recording, extraction, validation, cleanup, or publication fails, retain the previous JSON and report the failure without exposing payloads or secrets.

## Cleanup and verify

In `finally`, after the Playwright process exits, remove this run's recording and temporary spec on both success and failure, then restore any pre-existing HAR from its backup without overwriting another file.
Remove this run's unused candidate on failure. If an artifact was changed by someone else, stop and preserve it instead of deleting or overwriting it.
Remove the uniquely reserved results directory after the process exits; verify its resolved path is inside `src/hars/` before any recursive removal.
Do not remove other recordings, result directories, cookies, or storage-state files.

Run typecheck, the affected product tests in `mocking_tests`, `npm run check:ci`, and `npm run format:check` after cleanup.
Verify new raw recordings remain local and are not staged, any pre-existing HAR is restored byte-for-byte, and the temporary spec and this run's backups/candidates are gone. Do not change existing tracking rules or publish changes to an existing HAR as part of refreshing JSON.
Review the diff for unrelated user changes and secret-bearing content. Do not stage or commit HARs, credentials, or temporary files.
Report the number of validated products, checks actually run, and cleanup status. Do not commit unless the user separately requests it.

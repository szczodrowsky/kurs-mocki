---
name: cover-page-with-mocks
description: Explore a page and add mock-driven Playwright integration coverage in this repository. Use for a new page or flow whose UI and API contract need verification before writing scenarios.
---

# Cover a page with mocks

1. Read `AGENTS.md` and nearby specs, fixtures, Page Objects, and API helpers. Identify the mocks and test projects the new flow can reuse.
2. Explore the page with the requested Playwright tool. For protected pages, follow [API login](../api-login/SKILL.md). For public flows, start with an unauthenticated context. Install a write guard before interacting with the page. Fulfill expected mutations locally and abort unexpected writes.
3. Compare observed requests with OpenAPI. Record the method, path, payload, status, and visible result. Verify test IDs against the page. Probe a successful response and an API failure before choosing assertions. Use the [mock-api-errors skill](../mock-api-errors/SKILL.md) for HTTP errors, aborts, or retries.
4. Share the proposed scenarios and files before editing when the user requests approval. Choose a small set that covers distinct behavior. Keep Page Objects focused on UI and install routes in the spec or a test-scoped mock. Put paths in `apiEndpoints`, reuse stateful mocks, and install the write guard once per test.
5. Register response, request, or dialog waits before triggering the relevant action. For aborted requests, use `requestfailed`. Use locator assertions and route gates for timing. Remove temporary routes and leave the existing browser session available after exploration.
6. Run the targeted spec, typecheck, and both Biome checks. Verify project selection and the full suite when adding a project. Report observed behavior and coverage gaps without including credentials, tokens, or raw recordings.

For a public flow with local validation, a successful submission, and an API field error, see `src/tests/register.spec.ts`.

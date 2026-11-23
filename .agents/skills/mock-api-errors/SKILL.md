---
name: mock-api-errors
description: Mock and verify HTTP errors, network failures, retry recovery, and live response overrides in this project's Playwright tests and headless browser sessions.
---

# Mock API errors

## Explore the UI behavior

1. Follow [Playwright CLI](../playwright-cli/SKILL.md) and [API login](../api-login/SKILL.md) to prepare an authenticated, named headless session. Run browser commands outside the sandbox as described in `AGENTS.md`.
2. Check the network request triggered by the UI action. Select REST in `commerce-transport` if the catalog is set to GraphQL. REST currently sends `GET /api/v1/products/search` with query parameters. Use the paginated response shape for product-data mocks and HAR replay.
3. Register the route before navigation or reload. Match the endpoint by URL pathname so query parameters can vary. Use `run-code` for method-specific interception and call `route.fallback()` for other methods. Return a JSON error with `route.fulfill()` and keep the route active through retries.
4. Confirm the requested HTTP status and wait for the final UI state. Use the page locator for that state because the client can retry after the network first goes idle. Remove each temporary route in `finally` and check `route-list` for CLI rules. Leave the named session running after the exploration.

Compare HTTP and network failures with `route.fulfill({ status: 500 })` and `route.abort()`. Count matching GET attempts and record `response` or `requestfailed` events. In the catalog, both produced four attempts and `Error loading products` during verification. Only the HTTP failure produced responses.

## Add a regression test

- Keep endpoint paths in `src/helpers/api-endpoints.ts`. Reuse `mockGetError()` from `src/helpers/mock-api-error.ts` through a method on the relevant Page Object. Declare any new UI locators in its constructor.
- Use the shared page fixtures. Start `page.waitForResponse()` with both the expected path and HTTP method before triggering the request, assert its status, then assert the UI result.
- For catalog 404 and 500, check `productsPage.texts.loadError` for `Error loading products` and verify there are zero product cards. Allow time for the 500 retries to finish.
- For a persistent abort, count the matching `requestfailed` events and wait for the error UI. For recovery, use `ProductsPage.mockProductsNetworkError` with the rows from `src/mocks/product.json`. The mock aborts two GETs and serves the paginated search payload on the third. Start the response wait before navigation and use it for the recovery response, then verify the failed attempts and rendered products.
- For current-user 401, set `freshSession: true` to give the test its own valid session. Open the protected catalog, register `loginPage.mockCurrentUserUnauthorized()`, and reload. The client can refresh and retry `/me`. Keep returning 401 and check for `/login` and the visible sign-in heading.
- For the product details scenarios, see `src/tests/product-details.spec.ts`. Reuse `apiEndpoints.product(id)` for both routing and response matching. `ProductDetailsPage` extends `BasePage<number>` and waits for the common page container so `goto(id)` completes for both the success and 404 views. Match POST explicitly for add-to-cart. Use a 200 response with `stockQuantity: 0` to exercise the out-of-stock UI.
- Keep live response overrides in a separate spec, such as `src/tests/product-details-live.spec.ts`. Use `route.fetch()` to obtain the real product and fulfill with that response, overriding only `stockQuantity` in the JSON. Pass upstream errors through so the test can surface backend failures.
- Run the affected spec, `npm run typecheck`, `npm run check:ci`, and `npm run format:check`.

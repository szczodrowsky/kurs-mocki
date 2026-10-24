---
name: ui-api-mocking
description: Create or refactor Playwright UI tests driven by mocked API responses, including Faker data, page objects, fixtures, and assertions for edge cases. Use for browser behavior under controlled network data, rather than backend-only API tests.
---

# UI Tests with API Mocks

Build small, readable tests that control API data and verify the resulting UI behavior. Keep the scenario visible in the test and reuse the project's existing browser automation infrastructure.

## Establish the Scenario

Read `AGENTS.md`, nearby specs, fixtures, POMs, generators, and relevant types before changing code. Follow the project's aliases, locator policy, environment handling, and execution requirements instead of copying paths or conventions from another repository.

Identify the behavior the user wants to prove, which response fields control it, and the minimum data needed. Ask about a genuinely ambiguous expected behavior before encoding it as an assertion.

When inspecting an unfamiliar screen or contract, use the available `playwright-cli` skill and the project's authorized test account. Verify the request method, URL, response shape, selectors, and relevant UI state. Do not copy bearer tokens or browser headers into tests. A screenshot or live page is evidence to investigate, not permission to change the requirement.

## Prefer Faker, Choose Overrides Deliberately

Prefer Faker.js through existing typed factories for realistic baseline data. Favor a single-item factory with optional overrides, such as `generateProduct(id, overrides)`, alongside the existing list factory. Keep custom types in the location required by the project.

Overriding a generated field is a test-design decision, not a default cleanup step. Ask whether the override establishes a precondition, exercises a boundary, improves scenario clarity, or satisfies the API contract. If none applies, preserve the generated value.

| Scenario | Data decision |
| --- | --- |
| Ordinary catalog rendering | Keep Faker names, descriptions, prices, and categories. Compare the UI against the generated objects instead of renaming everything to numbered placeholders. |
| Empty catalog | Return `[]`; a generator is unnecessary. |
| Very long text | Override only the relevant name and description with explicitly long values, using Faker word counts or a readable repeated phrase. Keep the exact expected strings. |
| Stock availability | Explicitly create one product with zero stock and one with positive stock. Random stock cannot reliably establish these conditions. Clear names may identify each product's role. |
| Contract or resource requirements | Preserve valid dates, enum values, identifiers, and known image assets when broken resources are not the scenario. |

Ensure fields used to identify repeated items are unique within the generated batch, or scope by a verified unique identifier. Faker does not guarantee unique names by itself. A random seed can help reproduce failures; it does not replace uniqueness or guarantee a boundary condition.

Keep data local and editable in the test. Do not silently override generated fields merely to make an unrelated assertion pass. If availability is not under test, do not force all stock to a positive number just to assert that every cart button is enabled.

## Install the Mock Before Navigation

Reuse the existing fixture-provided POMs and authentication flow. Ensure authentication has actually completed before starting navigation that depends on it; a resolved sign-in click alone may be insufficient.

Install interception before `goto()`, reload, or the action that triggers the request. Intercept the intended endpoint and method, and let unrelated requests continue. Keep tests isolated so handlers and data do not leak between scenarios.

If endpoint mocking repeats across tests, reuse or extract a small method in the layer chosen by the project, for example `productsPage.mockProducts(products)`. Centralize the endpoint and fulfillment mechanics there; keep data and UI assertions in the test. Do not build a generic mocking framework for a single repeated endpoint.

Navigate directly to the target screen when the scenario concerns its data. Traverse dashboard links only when navigation itself is part of the behavior being tested. Installing a mock should not also trigger navigation implicitly.

## Make Assertions Match the Requirement

- Empty state: assert the actual empty message, a summary showing zero products, and no product cards. A visible heading or an immediate zero count during loading is insufficient. Match counts precisely: the substring `0 products` also occurs in `10 products`.
- Long text: compare the rendered name and description against their full expected values. Exact DOM text does not prove that every character is visually exposed; line clamping and ellipsis may be intentional. Add layout assertions only when the requirement calls for them.
- Availability: use two explicit products as a negative case and a positive control. Assert `toBeDisabled()` for zero stock and `toBeEnabled()` for positive stock. Do not confuse the selected purchase quantity with available stock.
- Repeated cards: scope assertions and actions to the intended item, using the project's POM interface. Do not select the first match to hide an ambiguous locator.

Use a loop when applying the same assertions to a collection. For a small number of cases with different expected outcomes, use named variables and explicit assertions. Do not hide missing data behind `if (firstProduct)` or reduce assertions until a broken application passes.

Do not add unrelated search, filtering, cart writes, forced clicks, or response-body checks solely to make a scenario look thorough. Add them when the requirement needs them. Avoid real data mutations when testing that an action is unavailable.

## Preferred Test Shape

The following illustrates intent; adapt names to the repository's existing interfaces:

```ts
const soldOut = generateProduct(1, { name: 'Sold Out Speaker', stockQuantity: 0 });
const available = generateProduct(2, { name: 'Available Speaker', stockQuantity: 25 });

await productsPage.mockProducts([soldOut, available]);
await productsPage.goto();

const soldOutCard = productsPage.scopeProductCard(soldOut.name);
const availableCard = productsPage.scopeProductCard(available.name);

await expect(soldOutCard.buttons.addToCart).toBeDisabled();
await expect(availableCard.buttons.addToCart).toBeEnabled();
```

Keep tests for the same feature together when that fits the existing suite. Keep locators in POMs, grouped according to project conventions; avoid selector definitions in tests or action methods. Do not add methods that merely wrap individual clicks or fills.

## Verify and Report

Respect explicit instructions not to run tests. Otherwise run the affected scenarios and required project checks; run the relevant suite when shared fixtures, generators, or POMs change. Run browser commands with the permissions and browser visibility required by the environment. Reuse a named interactive session and leave it open when required by the project.

If the observed UI violates the requested behavior, preserve the meaningful failing assertion and report the mismatch. Distinguish application defects, test setup problems, and environment blockers before changing expectations.

Report what changed, which checks actually ran, and any failures or limitations. Do not claim a test ran based on typechecking or test discovery alone. Do not commit or push unless requested.

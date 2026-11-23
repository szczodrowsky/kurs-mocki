import { readFile } from 'node:fs/promises';
import { expect, test } from '@fixtures/page-fixtures.js';
import { apiEndpoints } from '@helpers/api-endpoints.js';
import type { Product } from '@models/product.js';
import type { Request } from '@playwright/test';

function isProductSearchRequest(request: Request): boolean {
	return request.method() === 'GET' && new URL(request.url()).pathname === apiEndpoints.productSearch;
}

test.describe('Catalog API errors', { tag: '@products' }, () => {
	for (const status of [404, 500] as const) {
		test(`shows a catalog error when product search returns HTTP ${status}`, async ({ page, productsPage }) => {
			await productsPage.mockProductsError(status);

			const [response] = await Promise.all([
				page.waitForResponse((response) => isProductSearchRequest(response.request())),
				productsPage.goto()
			]);

			expect(response.status()).toBe(status);
			await expect(productsPage.texts.loadError).toBeVisible({ timeout: 15_000 });
			await expect(productsPage.texts.loadError).toHaveText('Error loading products');
			await expect(productsPage.productCards).toHaveCount(0);
		});
	}

	test('shows the catalog error after the products connection fails on all attempts', async ({
		page,
		productsPage
	}) => {
		const failures: string[] = [];
		page.on('requestfailed', (request) => {
			if (isProductSearchRequest(request)) failures.push(request.url());
		});
		await productsPage.mockProductsNetworkError();
		await productsPage.goto();

		await expect(productsPage.texts.loadError).toBeVisible({ timeout: 15_000 });
		await expect(productsPage.texts.loadError).toHaveText('Error loading products');
		await expect(productsPage.productCards).toHaveCount(0);
		expect(failures).toHaveLength(4);
	});

	test('renders the catalog when the third attempt succeeds after two connection failures', async ({
		page,
		productsPage
	}) => {
		const products: Product[] = JSON.parse(await readFile(new URL('../mocks/product.json', import.meta.url), 'utf8'));
		const failures: string[] = [];
		page.on('requestfailed', (request) => {
			if (isProductSearchRequest(request)) failures.push(request.url());
		});
		await productsPage.mockProductsNetworkError(products);

		const [response] = await Promise.all([
			page.waitForResponse((response) => isProductSearchRequest(response.request())),
			productsPage.goto()
		]);

		expect(response.status()).toBe(200);
		expect(failures).toHaveLength(2);
		await expect(productsPage.productCards).toHaveCount(products.length);
		await expect(productsPage.cardLocators.heading).toHaveText(products.map(({ name }) => name));
		await expect(productsPage.texts.loadError).toBeHidden();
	});
});

test.describe('Session expiration', { tag: '@login' }, () => {
	test.use({ freshSession: true });

	test('redirects a signed-in user to login when the current-user API returns HTTP 401', async ({
		page,
		productsPage,
		loginPage
	}) => {
		await productsPage.goto();
		await loginPage.mockCurrentUserUnauthorized();

		const [response] = await Promise.all([
			page.waitForResponse(
				(response) =>
					response.request().method() === 'GET' && new URL(response.url()).pathname === apiEndpoints.currentUser
			),
			page.reload()
		]);

		expect(response.status()).toBe(401);
		await expect(page).toHaveURL('/login');
		await expect(loginPage.heading).toBeVisible();
	});
});

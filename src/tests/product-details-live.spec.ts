import { expect, test } from '@fixtures/page-fixtures.js';
import { apiEndpoints } from '@helpers/api-endpoints.js';
import type { Product } from '@models/product.js';
import type { Response } from '@playwright/test';

test.use({ contextOptions: {} });

test.describe('Live product availability', { tag: '@products' }, () => {
	test('shows a live product as out of stock after overriding its stock quantity', async ({
		page,
		productDetailsPage
	}) => {
		const productId = 8;
		const endpoint = apiEndpoints.product(productId);
		const isProductResponse = (response: Response) =>
			response.request().method() === 'GET' && new URL(response.url()).pathname === endpoint;

		const [originalResponse] = await Promise.all([
			page.waitForResponse(isProductResponse),
			productDetailsPage.goto(productId)
		]);
		expect(originalResponse.status()).toBe(200);
		const originalProduct: Product = await originalResponse.json();
		expect(originalProduct.stockQuantity).toBeGreaterThan(0);
		await expect(productDetailsPage.buttons.addToCart).toBeEnabled();

		const readUpstreamProduct = await productDetailsPage.mockProductOutOfStock(productId);
		const [response] = await Promise.all([page.waitForResponse(isProductResponse), page.reload()]);

		expect(response.status()).toBe(200);
		const upstreamProduct = readUpstreamProduct();
		const mockedProduct: Product = await response.json();
		expect(upstreamProduct).toBeDefined();
		expect(mockedProduct).toEqual({ ...upstreamProduct, stockQuantity: 0 });
		await expect(productDetailsPage.headings.product).toHaveText(mockedProduct.name);
		await expect(productDetailsPage.texts.stock).toBeVisible();
		await expect(productDetailsPage.texts.stock).toHaveText('Out of stock');
		await expect(productDetailsPage.buttons.addToCart).toBeVisible();
		await expect(productDetailsPage.buttons.addToCart).toBeDisabled();
		await expect(productDetailsPage.quantityControls).toBeHidden();
	});
});

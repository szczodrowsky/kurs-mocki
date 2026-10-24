import { expect, test } from '@fixtures/page-fixtures.js';
import { generateProducts } from '@helpers/generate-products.js';

test('displays mocked products in the catalog', async ({ page, baseURL, dashboardPage, productsPage }) => {
	const mockedProducts = generateProducts(10);
	const productsEndpoint = new URL('/api/v1/products', baseURL).href;

	await expect(dashboardPage.heading).toBeVisible();

	await page.route(productsEndpoint, async (route) => {
		if (route.request().method() !== 'GET') {
			await route.fallback();
			return;
		}

		await route.fulfill({ status: 200, json: mockedProducts });
	});

	await dashboardPage.buttons.products.click();

	await expect(productsPage.headings.page).toBeVisible();
	await expect(productsPage.productCards).toHaveCount(mockedProducts.length);

	for (const product of mockedProducts) {
		const card = productsPage.scopeProductCard(product.name);

		await expect(card.root).toBeVisible();
		await expect(card.heading).toHaveText(product.name);
		await expect(card.texts.price).toHaveText(`$${product.price.toFixed(2)}`);
		await expect(card.texts.description).toHaveText(product.description);
		await expect(card.texts.category).toHaveText(product.category);
	}
});

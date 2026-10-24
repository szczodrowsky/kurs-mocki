import { expect, test } from '@fixtures/page-fixtures.js';
import { generateProduct, generateProducts } from '@helpers/generate-products.js';
import type { Product } from '@models/product.js';

test('displays mocked products in the catalog', async ({ productsPage }) => {
	const mockedProducts = generateProducts(10);

	await productsPage.mockProducts(mockedProducts);
	await productsPage.goto();

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

test('shows the empty catalog state when the products API returns no items', async ({ productsPage }) => {
	const mockedProducts: Product[] = [];

	await productsPage.mockProducts(mockedProducts);
	await productsPage.goto();

	await expect(productsPage.texts.noProducts).toHaveText('No products found');
	await expect(productsPage.texts.summary).toHaveText(/^0 products\b/);
	await expect(productsPage.productCards).toHaveCount(0);
});

test('displays the full long product name and description', async ({ productsPage }) => {
	const product = generateProduct(1, {
		name: 'Long product name '.repeat(30).trim(),
		description: 'Detailed product description '.repeat(100).trim()
	});

	await productsPage.mockProducts([product]);
	await productsPage.goto();

	await expect(productsPage.productCards).toHaveCount(1);

	const card = productsPage.scopeProductCard(product.name);

	await expect(card.root).toBeVisible();
	await expect(card.heading).toHaveText(product.name);
	await expect(card.texts.description).toBeVisible();
	await expect(card.texts.description).toHaveText(product.description);
});

test('disables Add to Cart only for the out-of-stock product', async ({ productsPage }) => {
	const soldOut = generateProduct(1, { name: 'Sold Out Speaker', stockQuantity: 0 });
	const available = generateProduct(2, { name: 'Available Speaker', stockQuantity: 25 });

	await productsPage.mockProducts([soldOut, available]);
	await productsPage.goto();

	await expect(productsPage.productCards).toHaveCount(2);

	const soldOutCard = productsPage.scopeProductCard(soldOut.name);
	const availableCard = productsPage.scopeProductCard(available.name);

	await expect(soldOutCard.root).toBeVisible();
	await expect(availableCard.root).toBeVisible();
	await expect(soldOutCard.buttons.addToCart).toBeDisabled();
	await expect(availableCard.buttons.addToCart).toBeEnabled();
});

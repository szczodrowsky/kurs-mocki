import { fileURLToPath } from 'node:url';
import { expect, test } from '@fixtures/page-fixtures.js';
import { generateProduct, generateProducts } from '@helpers/generate-products.js';
import type { Product } from '@models/product.js';

test('displays products using mockResponse', async ({ productsPage }) => {
	const mockedProducts = generateProducts(10);

	await productsPage.mockResponse(mockedProducts);
	await productsPage.goto();

	await expect(productsPage.headings.page).toBeVisible();
	await expect(productsPage.productCards).toHaveCount(mockedProducts.length);

	for (const product of mockedProducts) {
		const card = productsPage.scopeProductCard(product.name);

		await expect(card.root).toBeVisible();
		await expect(card.heading).toHaveText(product.name);
		await expect(card.texts.price).toHaveText(
			product.price.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
		);
		await expect(card.texts.description).toHaveText(product.description);
		await expect(card.texts.category).toHaveText(product.category);
	}
});

test('shows the empty catalog state when the products API returns no items', async ({ productsPage }) => {
	const mockedProducts: Product[] = [];

	await productsPage.mockResponse(mockedProducts);
	await productsPage.goto();

	await expect(productsPage.texts.noProducts).toHaveText('No products found');
	await expect(productsPage.texts.summary).toHaveText(/^0 products\b/);
	await expect(productsPage.productCards).toHaveCount(0);
});

test('renders products with long names and descriptions', async ({ productsPage }) => {
	const product = generateProduct(1, {
		name: 'Long product name '.repeat(30).trim(),
		description: 'Detailed product description '.repeat(100).trim()
	});

	await productsPage.mockResponse([product]);
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

	await productsPage.mockResponse([soldOut, available]);
	await productsPage.goto();

	await expect(productsPage.productCards).toHaveCount(2);

	const soldOutCard = productsPage.scopeProductCard(soldOut.name);
	const availableCard = productsPage.scopeProductCard(available.name);

	await expect(soldOutCard.root).toBeVisible();
	await expect(availableCard.root).toBeVisible();
	await expect(soldOutCard.buttons.addToCart).toBeDisabled();
	await expect(availableCard.buttons.addToCart).toBeEnabled();
});

test('displays products using mockFromJson', async ({ productsPage }) => {
	const jsonPath = fileURLToPath(new URL('../mocks/product.json', import.meta.url));

	await productsPage.mockFromJson(jsonPath);
	await productsPage.goto();

	await expect(productsPage.productCards.first()).toBeVisible();
	await expect(productsPage.productCards).not.toHaveCount(0);
});

test('displays products using mockFromHar', async ({ productsPage }) => {
	await productsPage.mockFromHar();
	await productsPage.goto();

	await expect(productsPage.productCards).toHaveCount(8);
	await expect(productsPage.texts.summary).toHaveText('8 products across 7 categories');
	await expect(productsPage.scopeProductCard('iPhone 13 Pro').heading).toHaveText('iPhone 13 Pro');
	await expect(productsPage.scopeProductCard('Sony WH-1000XM4').heading).toHaveText('Sony WH-1000XM4');
});

test.describe('product search', () => {
	const headphones = generateProduct(1, {
		name: 'Aurora Headphones',
		description: 'Wireless sound with velvet ear cushions',
		stockQuantity: 10
	});
	const keyboard = generateProduct(2, {
		name: 'Summit Keyboard',
		description: 'Mechanical switches with backlit keys',
		stockQuantity: 10
	});
	const mockedProducts = [headphones, keyboard];

	test.beforeEach(async ({ productsPage }) => {
		await productsPage.mockResponse(mockedProducts);
		await productsPage.goto();
		await expect(productsPage.productCards).toHaveCount(mockedProducts.length);
	});

	test('finds one product by name and restores all products when cleared', async ({ productsPage }) => {
		await expect(productsPage.buttons.clearSearch).toBeHidden();
		await productsPage.inputs.search.fill(headphones.name);

		await expect(productsPage.productCards).toHaveCount(1);
		await expect(productsPage.scopeProductCard(headphones.name).heading).toHaveText(headphones.name);
		await expect(productsPage.texts.noProducts).toBeHidden();

		await productsPage.buttons.clearSearch.click();

		await expect(productsPage.inputs.search).toHaveValue('');
		await expect(productsPage.buttons.clearSearch).toBeHidden();
		await expect(productsPage.productCards).toHaveCount(mockedProducts.length);
		await expect(productsPage.cardLocators.heading).toHaveText(mockedProducts.map((product) => product.name));
	});

	test('finds one product by description', async ({ productsPage }) => {
		await productsPage.inputs.search.fill('Mechanical switches');

		await expect(productsPage.productCards).toHaveCount(1);
		const card = productsPage.scopeProductCard(keyboard.name);
		await expect(card.heading).toHaveText(keyboard.name);
		await expect(card.texts.description).toHaveText(keyboard.description);
		await expect(productsPage.texts.noProducts).toBeHidden();
	});

	test('shows an empty search state and restores all products when cleared', async ({ productsPage }) => {
		await productsPage.inputs.search.fill('nonexistent-product');

		await expect(productsPage.productCards).toHaveCount(0);
		await expect(productsPage.texts.noProducts).toBeVisible();
		await expect(productsPage.texts.noProducts).toContainText('No products found');

		await productsPage.buttons.clearSearch.click();

		await expect(productsPage.inputs.search).toHaveValue('');
		await expect(productsPage.buttons.clearSearch).toBeHidden();
		await expect(productsPage.texts.noProducts).toBeHidden();
		await expect(productsPage.productCards).toHaveCount(mockedProducts.length);
		await expect(productsPage.cardLocators.heading).toHaveText(mockedProducts.map((product) => product.name));
	});
});

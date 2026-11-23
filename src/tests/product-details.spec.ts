import { expect, test } from '@fixtures/page-fixtures.js';
import { apiEndpoints } from '@helpers/api-endpoints.js';
import { generateProduct } from '@helpers/generate-products.js';

test.use({ contextOptions: {} });

const productId = 1_000_008;
const productEndpoint = apiEndpoints.product(productId);

test('shows the not-found page when the product API returns 404', async ({ page, productDetailsPage }) => {
	await productDetailsPage.mockProductNotFound(productId);

	const [response] = await Promise.all([
		page.waitForResponse(
			(response) => response.request().method() === 'GET' && new URL(response.url()).pathname === productEndpoint
		),
		productDetailsPage.goto(productId)
	]);

	expect(response.status()).toBe(404);
	await expect(productDetailsPage.headings.notFound).toBeVisible();
	await expect(productDetailsPage.headings.notFound).toHaveText('Product not found');
	await expect(productDetailsPage.texts.notFoundDescription).toBeVisible();
	await expect(productDetailsPage.texts.notFoundDescription).toHaveText(
		'This product does not exist or may have been removed.'
	);
	await expect(productDetailsPage.links.notFoundBack).toBeVisible();
	await expect(productDetailsPage.links.notFoundBack).toHaveText('Back to Products');
	await expect(productDetailsPage.links.notFoundBack).toHaveAttribute('href', '/products');
	await expect(productDetailsPage.headings.product).toBeHidden();
	await expect(productDetailsPage.buttons.addToCart).toBeHidden();
	await expect(productDetailsPage.quantityControls).toBeHidden();
});

test('shows a cart error when adding a product returns 500', async ({ page, productDetailsPage }) => {
	const product = generateProduct(productId, { stockQuantity: 5 });
	await productDetailsPage.mockProduct(product);
	await productDetailsPage.mockAddToCartError();
	await productDetailsPage.goto(productId);
	await expect(productDetailsPage.headings.product).toHaveText(product.name);
	await expect(productDetailsPage.buttons.addToCart).toBeEnabled();

	const [response] = await Promise.all([
		page.waitForResponse(
			(response) =>
				response.request().method() === 'POST' && new URL(response.url()).pathname === apiEndpoints.cartItems
		),
		productDetailsPage.buttons.addToCart.click()
	]);

	expect(response.status()).toBe(500);
	await expect(productDetailsPage.texts.cartErrorTitle).toHaveText('Error');
	await expect(productDetailsPage.texts.cartErrorDescription).toBeVisible();
	await expect(productDetailsPage.texts.cartErrorDescription).toHaveText('Failed to update cart. Please try again.');
	await expect(productDetailsPage.buttons.addToCart).toBeEnabled();
});

test('shows an out-of-stock product with the add button disabled and quantity controls hidden', async ({
	page,
	productDetailsPage
}) => {
	const product = generateProduct(productId, { stockQuantity: 0 });
	await productDetailsPage.mockProduct(product);

	const [response] = await Promise.all([
		page.waitForResponse(
			(response) => response.request().method() === 'GET' && new URL(response.url()).pathname === productEndpoint
		),
		productDetailsPage.goto(productId)
	]);

	expect(response.status()).toBe(200);
	await expect(productDetailsPage.headings.product).toHaveText(product.name);
	await expect(productDetailsPage.texts.stock).toBeVisible();
	await expect(productDetailsPage.texts.stock).toHaveText('Out of stock');
	await expect(productDetailsPage.buttons.addToCart).toBeVisible();
	await expect(productDetailsPage.buttons.addToCart).toBeDisabled();
	await expect(productDetailsPage.quantityControls).toBeHidden();
	await expect(productDetailsPage.buttons.decreaseQuantity).toBeHidden();
	await expect(productDetailsPage.texts.quantity).toBeHidden();
	await expect(productDetailsPage.buttons.increaseQuantity).toBeHidden();
});

import { expect, test } from '@fixtures/page-fixtures.js';
import { apiEndpoints } from '@helpers/api-endpoints.js';
import { generateProduct } from '@helpers/generate-products.js';
import { mockCart } from '@helpers/mock-cart.js';
import type { Response } from '@playwright/test';

test.use({ contextOptions: {} });

const product = generateProduct(1_000_008, { name: 'Cart Test Headphones', price: 12.5, stockQuantity: 10 });

function cartResponse(method: string, path: string) {
	return (response: Response) => response.request().method() === method && new URL(response.url()).pathname === path;
}

test.beforeEach(async ({ page, credentials, productDetailsPage }) => {
	await mockCart(page, credentials.username, [product]);
	await productDetailsPage.mockProduct(product);
});

test.describe('Empty cart', { tag: '@cart' }, () => {
	test('starts with an empty cart and hides the cart counter', async ({ page, cartPage }) => {
		const [response] = await Promise.all([
			page.waitForResponse(cartResponse('GET', apiEndpoints.cart)),
			cartPage.goto()
		]);

		expect(response.status()).toBe(200);
		expect(await response.json()).toMatchObject({ items: [], totalItems: 0, totalPrice: 0 });
		await expect(cartPage.heading).toBeVisible();
		await expect(cartPage.texts.empty).toBeVisible();
		await expect(cartPage.texts.empty).toContainText('Your cart is empty');
		await expect(cartPage.itemRows).toHaveCount(0);
		await expect(cartPage.cartCounter).toBeHidden();
	});
});

test.describe('Cart with a product', { tag: '@cart' }, () => {
	test.beforeEach(async ({ page, productDetailsPage }) => {
		await productDetailsPage.goto(product.id);
		await expect(productDetailsPage.buttons.addToCart).toHaveText('Add to Cart');
		await expect(productDetailsPage.cartCounter).toBeHidden();

		const [response] = await Promise.all([
			page.waitForResponse(cartResponse('POST', apiEndpoints.cartItems)),
			productDetailsPage.buttons.addToCart.click()
		]);

		expect(response.status()).toBe(200);
		expect(response.request().postDataJSON()).toEqual({ productId: product.id, quantity: 1 });
		expect(await response.json()).toMatchObject({
			items: [{ productId: product.id, quantity: 1 }],
			totalItems: 1,
			totalPrice: 12.5
		});
		await expect(productDetailsPage.cartCounter).toHaveText('1');
	});

	test('shows the added item when the cart is opened', async ({ cartPage }) => {
		await cartPage.goto();

		await expect(cartPage.texts.empty).toBeHidden();
		await expect(cartPage.itemRows).toHaveCount(1);
		await expect(cartPage.texts.itemNames).toHaveText(product.name);
		await expect(cartPage.texts.itemQuantities).toHaveText('1');
		await expect(cartPage.cartCounter).toHaveText('1');
	});

	test('updates the existing item and counts units across pages', async ({ page, productDetailsPage, cartPage }) => {
		await expect(productDetailsPage.buttons.addToCart).toHaveText('Update Cart');
		await productDetailsPage.buttons.increaseQuantity.click();
		await expect(productDetailsPage.texts.quantity).toHaveText('2');

		const [updated] = await Promise.all([
			page.waitForResponse(cartResponse('PUT', apiEndpoints.cartItem(product.id))),
			productDetailsPage.buttons.addToCart.click()
		]);

		const expectedCart = { items: [{ productId: product.id, quantity: 2 }], totalItems: 2, totalPrice: 25 };
		expect(updated.status()).toBe(200);
		expect(updated.request().postDataJSON()).toEqual({ quantity: 2 });
		expect(await updated.json()).toMatchObject(expectedCart);
		await expect(productDetailsPage.cartCounter).toHaveText('2');

		const [read] = await Promise.all([page.waitForResponse(cartResponse('GET', apiEndpoints.cart)), cartPage.goto()]);
		expect(read.status()).toBe(200);
		expect(await read.json()).toMatchObject(expectedCart);
		await expect(cartPage.itemRows).toHaveCount(1);
		await expect(cartPage.texts.itemQuantities).toHaveText('2');
		await expect(cartPage.cartCounter).toHaveText('2');
	});
});

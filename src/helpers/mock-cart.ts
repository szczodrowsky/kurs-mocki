import { apiEndpoints } from '@helpers/api-endpoints.js';
import type { Product } from '@models/product.js';
import type { Page } from '@playwright/test';

export async function mockCart(page: Page, username: string, products: readonly Product[]): Promise<void> {
	const quantities = new Map<Product, number>();
	const itemPathPrefix = `${apiEndpoints.cartItems}/`;
	const snapshot = () => {
		const entries = [...quantities];
		return {
			username,
			items: entries.map(([product, quantity]) => ({ productId: product.id, quantity })),
			totalItems: entries.reduce((total, [, quantity]) => total + quantity, 0),
			totalPrice:
				entries.reduce((total, [product, quantity]) => total + Math.round(product.price * 100) * quantity, 0) / 100
		};
	};

	await page.route(
		({ pathname }) =>
			pathname === apiEndpoints.cart || pathname === apiEndpoints.cartItems || pathname.startsWith(itemPathPrefix),
		async (route) => {
			const request = route.request();
			const path = new URL(request.url()).pathname;
			const method = request.method();
			if (method === 'GET' && path === apiEndpoints.cart) {
				await route.fulfill({ json: snapshot() });
				return;
			}

			const adding = method === 'POST' && path === apiEndpoints.cartItems;
			const updating = method === 'PUT' && path.startsWith(itemPathPrefix);
			if (!adding && !updating) {
				await route.fulfill({ status: 405 });
				return;
			}

			let body: unknown;
			try {
				body = request.postDataJSON();
			} catch {
				await route.fulfill({ status: 400 });
				return;
			}
			if (
				typeof body !== 'object' ||
				body === null ||
				!('quantity' in body) ||
				typeof body.quantity !== 'number' ||
				!Number.isSafeInteger(body.quantity) ||
				body.quantity < 1 ||
				(adding && !('productId' in body))
			) {
				await route.fulfill({ status: 400 });
				return;
			}

			const productId = 'productId' in body ? body.productId : undefined;
			const product = products.find(({ id }) => (adding ? id === productId : apiEndpoints.cartItem(id) === path));
			if (!product || (updating && !quantities.has(product))) {
				await route.fulfill({ status: 404 });
				return;
			}

			quantities.set(product, body.quantity);
			await route.fulfill({ json: snapshot() });
		}
	);
}

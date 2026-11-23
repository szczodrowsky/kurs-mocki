import { apiEndpoints } from '@helpers/api-endpoints.js';
import { mockGetError } from '@helpers/mock-api-error.js';
import type { Product } from '@models/product.js';
import type {
	ProductDetailsPageButtons,
	ProductDetailsPageHeadings,
	ProductDetailsPageLinks,
	ProductDetailsPageTexts
} from '@models/product-details-page.js';
import { BasePage } from '@pages/basePage.js';
import type { Locator, Page } from '@playwright/test';

export class ProductDetailsPage extends BasePage<number> {
	readonly buttons: ProductDetailsPageButtons;
	readonly headings: ProductDetailsPageHeadings;
	readonly links: ProductDetailsPageLinks;
	readonly texts: ProductDetailsPageTexts;
	readonly quantityControls: Locator;

	constructor(page: Page) {
		const root = page.getByTestId('product-details-page');
		super(page, (id) => `/products/${id}`, root);

		const notFound = root.getByTestId('product-not-found');
		const toasts = page.getByTestId('toast-viewport');

		this.headings = {
			product: root.getByTestId('product-title'),
			notFound: notFound.getByRole('heading', { level: 1 })
		};

		this.links = {
			notFoundBack: notFound.getByTestId('product-not-found-back-link')
		};

		this.quantityControls = root.getByTestId('product-quantity-controls');
		this.buttons = {
			addToCart: root.getByTestId('add-to-cart'),
			decreaseQuantity: this.quantityControls.getByTestId('decrease-quantity'),
			increaseQuantity: this.quantityControls.getByTestId('increase-quantity')
		};

		this.texts = {
			notFoundDescription: notFound.getByRole('paragraph'),
			stock: root.getByTestId('product-stock'),
			quantity: this.quantityControls.getByTestId('quantity-value'),
			cartErrorTitle: toasts.getByTestId('toast-title'),
			cartErrorDescription: toasts.getByTestId('toast-description')
		};
	}

	async mockProductNotFound(id: number): Promise<void> {
		await mockGetError(this.page, apiEndpoints.product(id), 404);
	}

	async mockAddToCartError(): Promise<void> {
		await this.page.route(
			(url) => url.pathname === apiEndpoints.cartItems,
			async (route) => {
				if (route.request().method() !== 'POST') {
					await route.fallback();
					return;
				}

				await route.fulfill({ status: 500, json: { message: 'Internal Server Error' } });
			}
		);
	}

	async mockProduct(product: Product): Promise<void> {
		await this.page.route(
			(url) => url.pathname === apiEndpoints.product(product.id),
			async (route) => {
				if (route.request().method() !== 'GET') {
					await route.fallback();
					return;
				}

				await route.fulfill({ status: 200, json: product });
			}
		);
	}

	async mockProductOutOfStock(id: number): Promise<() => Product | undefined> {
		let upstreamProduct: Product | undefined;
		await this.page.route(
			(url) => url.pathname === apiEndpoints.product(id),
			async (route) => {
				if (route.request().method() !== 'GET') {
					await route.fallback();
					return;
				}

				const response = await route.fetch();
				if (response.status() !== 200) {
					await route.fulfill({ response });
					return;
				}

				const product: Product = await response.json();
				upstreamProduct = product;
				await route.fulfill({ response, json: { ...product, stockQuantity: 0 } });
			}
		);
		return () => upstreamProduct;
	}
}

import type { Product } from '@models/product.js';
import type {
	ProductCardLocators,
	ProductsPageButtons,
	ProductsPageCheckboxes,
	ProductsPageHeadings,
	ProductsPageInputs,
	ProductsPageLinks,
	ProductsPageSelects,
	ProductsPageTexts
} from '@models/products-page.js';
import { BasePage } from '@pages/basePage.js';
import type { Locator, Page } from '@playwright/test';

export class ProductsPage extends BasePage {
	readonly inputs: ProductsPageInputs;
	readonly buttons: ProductsPageButtons;
	readonly links: ProductsPageLinks;
	readonly headings: ProductsPageHeadings;
	readonly selects: ProductsPageSelects;
	readonly checkboxes: ProductsPageCheckboxes;
	readonly texts: ProductsPageTexts;
	readonly productCards: Locator;
	readonly cardLocators: ProductCardLocators;

	constructor(page: Page) {
		const heading = page.getByTestId('products-title');
		super(page, () => '/products', heading);

		this.inputs = {
			search: page.getByTestId('product-search')
		};

		this.buttons = {
			allProducts: page.getByTestId('products-category-all'),
			audio: page.getByTestId('products-category-audio'),
			books: page.getByTestId('products-category-books'),
			computers: page.getByTestId('products-category-computers'),
			electronics: page.getByTestId('products-category-electronics'),
			gaming: page.getByTestId('products-category-gaming'),
			homeAndKitchen: page.getByTestId('products-category-home-&-kitchen'),
			wearables: page.getByTestId('products-category-wearables')
		};

		this.links = {
			brand: page.getByTestId('brand-link'),
			products: page.getByTestId('desktop-menu-products'),
			sendEmail: page.getByTestId('desktop-menu-send-email'),
			qrCode: page.getByTestId('desktop-menu-qr-code'),
			llm: page.getByTestId('desktop-menu-llm'),
			trafficMonitor: page.getByTestId('desktop-menu-traffic-monitor'),
			admin: page.getByTestId('desktop-menu-admin'),
			cart: page.getByTestId('desktop-cart-icon'),
			profile: page.getByTestId('username-profile-link'),
			blog: page.getByTestId('footer-blog-link'),
			linkedIn: page.getByTestId('footer-linkedin-link'),
			buyMeACoffee: page.getByTestId('footer-coffee-link')
		};

		this.headings = {
			page: heading,
			categories: page.getByTestId('products-categories-title'),
			list: page.getByTestId('product-list-title')
		};

		this.selects = {
			sort: page.getByTestId('product-sort'),
			shopApi: page.getByTestId('commerce-transport')
		};

		this.checkboxes = {
			inStockOnly: page.getByTestId('product-in-stock-only')
		};

		this.productCards = page.getByTestId('product-item');
		this.cardLocators = {
			root: this.productCards,
			heading: page.getByTestId('product-name'),
			image: page.getByTestId('product-image'),
			buttons: {
				decreaseQuantity: page.getByTestId('product-decrease-quantity'),
				increaseQuantity: page.getByTestId('product-increase-quantity'),
				addToCart: page.getByTestId('product-add-button')
			},
			texts: {
				price: page.getByTestId('product-price'),
				description: page.getByTestId('product-description'),
				category: page.getByTestId('product-category'),
				quantity: page.getByTestId('product-quantity-value')
			}
		};

		this.texts = {
			noProducts: page.getByTestId('no-products-message'),
			summary: page.getByTestId('products-count-summary')
		};
	}

	async mockResponse(products: Product[]): Promise<void> {
		await this.page.route('**/api/v1/products', async (route) => {
			if (route.request().method() !== 'GET') {
				await route.fallback();
				return;
			}

			await route.fulfill({ status: 200, json: products });
		});
	}

	async mockFromJson(jsonPath: string): Promise<void> {
		await this.page.route('**/api/v1/products', async (route) => {
			if (route.request().method() !== 'GET') {
				await route.fallback();
				return;
			}

			await route.fulfill({ status: 200, contentType: 'application/json', path: jsonPath });
		});
	}

	async mockFromHar(): Promise<void> {
		await this.page.routeFromHAR('src/hars/network.har', {
			url: '**/api/v1/products'
		});
	}

	scopeProductCard(name: string): ProductCardLocators {
		const exactName = new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`);
		const root = this.productCards.filter({
			has: this.cardLocators.heading.filter({ hasText: exactName })
		});

		return {
			root,
			heading: root.locator(this.cardLocators.heading),
			image: root.locator(this.cardLocators.image),
			buttons: {
				decreaseQuantity: root.locator(this.cardLocators.buttons.decreaseQuantity),
				increaseQuantity: root.locator(this.cardLocators.buttons.increaseQuantity),
				addToCart: root.locator(this.cardLocators.buttons.addToCart)
			},
			texts: {
				price: root.locator(this.cardLocators.texts.price),
				description: root.locator(this.cardLocators.texts.description),
				category: root.locator(this.cardLocators.texts.category),
				quantity: root.locator(this.cardLocators.texts.quantity)
			}
		};
	}
}

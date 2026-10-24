import type {
	ProductCardLocators,
	ProductsPageButtons,
	ProductsPageCheckboxes,
	ProductsPageHeadings,
	ProductsPageInputs,
	ProductsPageLinks,
	ProductsPageSelects
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
	readonly productCards: Locator;

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
	}

	scopeProductCard(name: string): ProductCardLocators {
		const root = this.productCards.filter({
			has: this.page.getByTestId('product-name').and(this.page.getByText(name, { exact: true }))
		});

		return {
			root,
			heading: root.getByTestId('product-name'),
			image: root.getByTestId('product-image'),
			buttons: {
				decreaseQuantity: root.getByTestId('product-decrease-quantity'),
				increaseQuantity: root.getByTestId('product-increase-quantity'),
				addToCart: root.getByTestId('product-add-button')
			},
			texts: {
				price: root.getByTestId('product-price'),
				description: root.getByTestId('product-description'),
				category: root.getByTestId('product-category'),
				quantity: root.getByTestId('product-quantity-value')
			}
		};
	}
}

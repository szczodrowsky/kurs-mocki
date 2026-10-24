import type {
	ProductPageButtons,
	ProductPageHeadings,
	ProductPageLinks,
	ProductPageTexts
} from '@models/product-page.js';
import { BasePage } from '@pages/basePage.js';
import type { Locator, Page } from '@playwright/test';

export class ProductPage extends BasePage<number> {
	readonly buttons: ProductPageButtons;
	readonly links: ProductPageLinks;
	readonly headings: ProductPageHeadings;
	readonly texts: ProductPageTexts;
	readonly image: Locator;

	constructor(page: Page) {
		const heading = page.getByTestId('product-title');
		super(page, (productId) => `/products/${productId}`, heading);

		this.buttons = {
			decreaseQuantity: page.getByTestId('decrease-quantity'),
			increaseQuantity: page.getByTestId('increase-quantity'),
			addToCart: page.getByTestId('add-to-cart')
		};

		this.links = {
			backToProducts: page.getByTestId('product-back-link'),
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
			name: heading,
			description: page.getByTestId('product-description-title'),
			category: page.getByTestId('product-category-title'),
			availability: page.getByTestId('product-availability-title'),
			quantity: page.getByTestId('product-quantity-title')
		};

		this.texts = {
			price: page.getByTestId('product-price'),
			description: page.getByTestId('product-description'),
			category: page.getByTestId('product-category'),
			stock: page.getByTestId('product-stock'),
			quantity: page.getByTestId('quantity-value')
		};

		this.image = page.getByTestId('product-image');
	}
}

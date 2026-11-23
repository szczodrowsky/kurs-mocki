import type { CartPageTexts } from '@models/cart-page.js';
import { BasePage } from '@pages/basePage.js';
import type { Locator, Page } from '@playwright/test';

export class CartPage extends BasePage {
	readonly heading: Locator;
	readonly itemRows: Locator;
	readonly texts: CartPageTexts;

	constructor(page: Page) {
		const root = page.getByTestId('cart-page');
		const heading = root.getByTestId('cart-title');
		super(page, () => '/cart', heading);

		this.heading = heading;
		this.itemRows = root.getByTestId(/^cart-item-\d+$/);
		this.texts = {
			empty: root.getByTestId('cart-empty'),
			itemNames: this.itemRows.getByTestId(/^cart-item-name-\d+$/),
			itemQuantities: this.itemRows.getByTestId(/^cart-item-quantity-\d+$/)
		};
	}
}

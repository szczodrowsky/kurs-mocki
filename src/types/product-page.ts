import type { Locator } from '@playwright/test';

export interface ProductPageButtons {
	readonly decreaseQuantity: Locator;
	readonly increaseQuantity: Locator;
	readonly addToCart: Locator;
}

export interface ProductPageLinks {
	readonly backToProducts: Locator;
	readonly brand: Locator;
	readonly products: Locator;
	readonly sendEmail: Locator;
	readonly qrCode: Locator;
	readonly llm: Locator;
	readonly trafficMonitor: Locator;
	readonly admin: Locator;
	readonly cart: Locator;
	readonly profile: Locator;
	readonly blog: Locator;
	readonly linkedIn: Locator;
	readonly buyMeACoffee: Locator;
}

export interface ProductPageHeadings {
	readonly name: Locator;
	readonly description: Locator;
	readonly category: Locator;
	readonly availability: Locator;
	readonly quantity: Locator;
}

export interface ProductPageTexts {
	readonly price: Locator;
	readonly description: Locator;
	readonly category: Locator;
	readonly stock: Locator;
	readonly quantity: Locator;
}

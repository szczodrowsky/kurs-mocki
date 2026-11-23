import type { Locator } from '@playwright/test';

export interface ProductCardButtons {
	readonly decreaseQuantity: Locator;
	readonly increaseQuantity: Locator;
	readonly addToCart: Locator;
}

export interface ProductsPageLinks {
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

export interface ProductsPageHeadings {
	readonly page: Locator;
	readonly categories: Locator;
	readonly list: Locator;
}

export interface ProductsPageTexts {
	readonly loadError: Locator;
	readonly noProducts: Locator;
	readonly summary: Locator;
}

export interface ProductCardTexts {
	readonly price: Locator;
	readonly description: Locator;
	readonly category: Locator;
	readonly quantity: Locator;
}

export interface ProductCardLocators {
	readonly root: Locator;
	readonly heading: Locator;
	readonly image: Locator;
	readonly buttons: ProductCardButtons;
	readonly texts: ProductCardTexts;
}

export interface ProductsPageInputs {
	readonly search: Locator;
}

export interface ProductsPageButtons {
	readonly clearSearch: Locator;
	readonly allProducts: Locator;
	readonly audio: Locator;
	readonly books: Locator;
	readonly computers: Locator;
	readonly electronics: Locator;
	readonly gaming: Locator;
	readonly homeAndKitchen: Locator;
	readonly wearables: Locator;
}

export interface ProductsPageSelects {
	readonly sort: Locator;
	readonly shopApi: Locator;
}

export interface ProductsPageCheckboxes {
	readonly inStockOnly: Locator;
}

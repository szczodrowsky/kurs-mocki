import type { Locator } from '@playwright/test';

export interface ProductDetailsPageButtons {
	readonly addToCart: Locator;
	readonly decreaseQuantity: Locator;
	readonly increaseQuantity: Locator;
}

export interface ProductDetailsPageHeadings {
	readonly product: Locator;
	readonly notFound: Locator;
}

export interface ProductDetailsPageLinks {
	readonly notFoundBack: Locator;
}

export interface ProductDetailsPageTexts {
	readonly notFoundDescription: Locator;
	readonly stock: Locator;
	readonly quantity: Locator;
	readonly cartErrorTitle: Locator;
	readonly cartErrorDescription: Locator;
}

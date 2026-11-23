import type { Locator } from '@playwright/test';

export interface CartPageTexts {
	readonly empty: Locator;
	readonly itemNames: Locator;
	readonly itemQuantities: Locator;
}

import { BasePage } from '@pages/basePage.js';
import type { Locator, Page } from '@playwright/test';

export class DashboardPage extends BasePage {
	readonly heading: Locator;

	constructor(page: Page) {
		const heading = page.getByTestId('home-welcome-title');
		super(page, () => '/', heading);
		this.heading = heading;
	}
}

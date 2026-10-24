import type { Locator, Page } from '@playwright/test';

export abstract class BasePage<T = void> {
	constructor(
		protected readonly page: Page,
		private readonly path: (parameter: T) => string,
		private readonly readyLocator: Locator
	) {}

	async goto(parameter: T): Promise<void> {
		await this.page.goto(this.path(parameter));
		await this.readyLocator.waitFor({ state: 'visible' });
	}
}

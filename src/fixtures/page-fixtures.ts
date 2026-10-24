import { adminCredentials } from '@helpers/login-credentials.js';
import type { PageFixtures } from '@models/page-fixtures.js';
import { DashboardPage } from '@pages/dashboardPage.js';
import { LoginPage } from '@pages/loginPage.js';
import { ProductsPage } from '@pages/productsPage.js';
import { test as base, expect } from '@playwright/test';

export const test = base.extend<PageFixtures>({
	credentials: [adminCredentials, { option: true }],
	loginPage: async ({ page, credentials }, use) => {
		await use(new LoginPage(page, credentials));
	},
	dashboardPage: async ({ page }, use) => {
		await use(new DashboardPage(page));
	},
	productsPage: async ({ page }, use) => {
		await use(new ProductsPage(page));
	},
	login: [
		async ({ loginPage }, use) => {
			await loginPage.goto();
			await loginPage.login();
			await use(true);
		},
		{ auto: true }
	]
});

export { expect };

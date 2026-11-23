import { basename, resolve } from 'node:path';
import { getRequiredEnv } from '@helpers/get-required-env.js';
import { getAdminCredentials } from '@helpers/login-credentials.js';
import { loginViaApi } from '@helpers/login-via-api.js';
import type { PageFixtures } from '@models/page-fixtures.js';
import { DashboardPage } from '@pages/dashboardPage.js';
import { LoginPage } from '@pages/loginPage.js';
import { ProductDetailsPage } from '@pages/productDetailsPage.js';
import { ProductsPage } from '@pages/productsPage.js';
import { test as base, expect } from '@playwright/test';

export const test = base.extend<PageFixtures>({
	credentials: [
		async ({}, use) => {
			await use(getAdminCredentials());
		},
		{ option: true }
	],
	skipAutoLogin: [false, { option: true }],
	contextOptions: async ({ contextOptions }, use, testInfo) => {
		if (!contextOptions.recordHar) {
			await use(contextOptions);
			return;
		}

		await use({
			...contextOptions,
			recordHar: {
				...contextOptions.recordHar,
				path: resolve('src/hars/test-results', basename(testInfo.outputDir), contextOptions.recordHar.path)
			}
		});
	},
	loginPage: async ({ page, credentials }, use) => {
		await use(new LoginPage(page, credentials));
	},
	dashboardPage: async ({ page }, use) => {
		await use(new DashboardPage(page));
	},
	productsPage: async ({ page }, use) => {
		await use(new ProductsPage(page));
	},
	productDetailsPage: async ({ page }, use) => {
		await use(new ProductDetailsPage(page));
	},
	loginViaApi: [
		async ({ context, credentials, baseURL, skipAutoLogin }, use) => {
			if (!skipAutoLogin) {
				await loginViaApi(context, credentials, baseURL ?? getRequiredEnv('BASE_URL'));
			}
			await use(!skipAutoLogin);
		},
		{ auto: true }
	]
});

export { expect };

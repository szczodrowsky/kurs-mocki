import { getRequiredEnv } from '@helpers/get-required-env.js';
import { getAdminCredentials } from '@helpers/login-credentials.js';
import { loginViaApi } from '@helpers/login-via-api.js';
import type { PageFixtures } from '@models/page-fixtures.js';
import { CartPage } from '@pages/cartPage.js';
import { DashboardPage } from '@pages/dashboardPage.js';
import { LoginPage } from '@pages/loginPage.js';
import { ProductDetailsPage } from '@pages/productDetailsPage.js';
import { ProductsPage } from '@pages/productsPage.js';
import { RegisterPage } from '@pages/registerPage.js';
import { test as base, expect } from '@playwright/test';

export const test = base.extend<PageFixtures>({
	credentials: [
		async ({}, use) => {
			await use(getAdminCredentials());
		},
		{ option: true }
	],
	skipAutoLogin: [false, { option: true }],
	freshSession: [false, { option: true }],
	storageState: async ({ credentials, baseURL, skipAutoLogin, freshSession }, use) => {
		if (skipAutoLogin) {
			await use(undefined);
			return;
		}

		const defaultURL = getRequiredEnv('BASE_URL');
		const defaultCredentials = getAdminCredentials();
		if (
			freshSession ||
			credentials.username !== defaultCredentials.username ||
			credentials.password !== defaultCredentials.password ||
			(baseURL !== undefined && baseURL !== defaultURL)
		) {
			await use(await loginViaApi(credentials, baseURL ?? defaultURL));
			return;
		}

		await use(getRequiredEnv('KURS_MOCKI_STORAGE_STATE'));
	},
	contextOptions: async ({ contextOptions }, use, testInfo) => {
		if (!contextOptions.recordHar) {
			await use(contextOptions);
			return;
		}

		await use({
			...contextOptions,
			recordHar: {
				...contextOptions.recordHar,
				path: testInfo.outputPath('network.har')
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
	cartPage: async ({ page }, use) => {
		await use(new CartPage(page));
	},
	registerPage: async ({ page }, use) => {
		await use(new RegisterPage(page));
	}
});

export { expect };

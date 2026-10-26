import type { LoginCredentials } from '@models/login-credentials.js';
import type { DashboardPage } from '@pages/dashboardPage.js';
import type { LoginPage } from '@pages/loginPage.js';
import type { ProductsPage } from '@pages/productsPage.js';

export interface PageFixtures {
	readonly credentials: LoginCredentials;
	readonly skipAutoLogin: boolean;
	readonly loginViaApi: boolean;
	readonly loginPage: LoginPage;
	readonly dashboardPage: DashboardPage;
	readonly productsPage: ProductsPage;
}

import type { LoginCredentials } from '@models/login-credentials.js';
import type { CartPage } from '@pages/cartPage.js';
import type { DashboardPage } from '@pages/dashboardPage.js';
import type { LoginPage } from '@pages/loginPage.js';
import type { ProductDetailsPage } from '@pages/productDetailsPage.js';
import type { ProductsPage } from '@pages/productsPage.js';
import type { RegisterPage } from '@pages/registerPage.js';

export interface PageFixtures {
	readonly credentials: LoginCredentials;
	readonly skipAutoLogin: boolean;
	readonly freshSession: boolean;
	readonly loginPage: LoginPage;
	readonly dashboardPage: DashboardPage;
	readonly productsPage: ProductsPage;
	readonly productDetailsPage: ProductDetailsPage;
	readonly cartPage: CartPage;
	readonly registerPage: RegisterPage;
}

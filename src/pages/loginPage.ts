import { apiEndpoints } from '@helpers/api-endpoints.js';
import { mockGetError } from '@helpers/mock-api-error.js';
import type { LoginCredentials } from '@models/login-credentials.js';
import type { LoginPageButtons, LoginPageErrors, LoginPageInputs, LoginPageLinks } from '@models/login-page.js';
import { BasePage } from '@pages/basePage.js';
import type { Locator, Page } from '@playwright/test';

export class LoginPage extends BasePage {
	readonly inputs: LoginPageInputs;
	readonly buttons: LoginPageButtons;
	readonly errors: LoginPageErrors;
	readonly links: LoginPageLinks;

	readonly heading: Locator;

	constructor(
		page: Page,
		private readonly credentials: LoginCredentials
	) {
		const heading = page.getByTestId('login-title');
		super(page, () => '/login', heading);

		this.inputs = {
			username: page.getByTestId('login-username-input'),
			password: page.getByTestId('login-password-input')
		};

		this.buttons = {
			signIn: page.getByTestId('login-submit-button'),
			forgotPassword: page.getByTestId('login-forgot-link'),
			register: page.getByTestId('login-register-link')
		};

		this.errors = {
			username: page.getByTestId('login-username-error'),
			password: page.getByTestId('login-password-error'),
			signIn: page.getByTestId('toast-viewport').getByTestId('toast-description')
		};

		this.links = {
			brand: page.getByTestId('brand-link'),
			login: page.getByTestId('login-link'),
			register: page.getByTestId('register-link'),
			blog: page.getByTestId('footer-blog-link'),
			linkedIn: page.getByTestId('footer-linkedin-link'),
			buyMeACoffee: page.getByTestId('footer-coffee-link')
		};

		this.heading = heading;
	}

	async login({ username, password }: LoginCredentials = this.credentials): Promise<void> {
		await this.inputs.username.fill(username);
		await this.inputs.password.fill(password);
		await this.buttons.signIn.click();
	}

	async mockCurrentUserUnauthorized(): Promise<void> {
		await mockGetError(this.page, apiEndpoints.currentUser, 401);
	}
}

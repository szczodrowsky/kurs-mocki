import type { LoginPageButtons, LoginPageInputs, LoginPageLinks } from '@models/login-page.js';
import { BasePage } from '@pages/basePage.js';
import type { Locator, Page } from '@playwright/test';

export class LoginPage extends BasePage {
	readonly inputs: LoginPageInputs;
	readonly buttons: LoginPageButtons;
	readonly links: LoginPageLinks;

	readonly heading: Locator;

	constructor(page: Page) {
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

	async login(username: string, password: string): Promise<void> {
		await this.inputs.username.fill(username);
		await this.inputs.password.fill(password);
		await this.buttons.signIn.click();
	}
}

import type { RegisterPageButtons, RegistrationData, RegistrationFields } from '@models/register-page.js';
import { BasePage } from '@pages/basePage.js';
import type { Locator, Page } from '@playwright/test';

export class RegisterPage extends BasePage {
	readonly form: Locator;
	readonly inputs: RegistrationFields;
	readonly errors: RegistrationFields;
	readonly buttons: RegisterPageButtons;
	readonly successMessage: Locator;

	constructor(page: Page) {
		super(page, () => '/register', page.getByTestId('register-title'));
		this.form = page.getByTestId('register-form');
		this.inputs = {
			username: this.form.getByTestId('register-username-input'),
			email: this.form.getByTestId('register-email-input'),
			password: this.form.getByTestId('register-password-input'),
			firstName: this.form.getByTestId('register-firstname-input'),
			lastName: this.form.getByTestId('register-lastname-input')
		};
		this.errors = {
			username: this.form.getByTestId('register-username-error'),
			email: this.form.getByTestId('register-email-error'),
			password: this.form.getByTestId('register-password-error'),
			firstName: this.form.getByTestId('register-firstname-error'),
			lastName: this.form.getByTestId('register-lastname-error')
		};
		this.buttons = { submit: this.form.getByTestId('register-submit-button') };
		this.successMessage = page.getByTestId('toast-viewport').getByTestId('toast-description');
	}

	async fillForm({ username, email, password, firstName, lastName }: RegistrationData): Promise<void> {
		await this.inputs.username.fill(username);
		await this.inputs.email.fill(email);
		await this.inputs.password.fill(password);
		await this.inputs.firstName.fill(firstName);
		await this.inputs.lastName.fill(lastName);
	}
}

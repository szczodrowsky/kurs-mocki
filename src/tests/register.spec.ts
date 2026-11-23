import { expect, test } from '@fixtures/page-fixtures.js';
import { apiEndpoints } from '@helpers/api-endpoints.js';
import { getRequiredEnv } from '@helpers/get-required-env.js';
import type { RegistrationData } from '@models/register-page.js';
import type { Page, Request } from '@playwright/test';

const registration: RegistrationData = {
	username: 'qa_mock_registration',
	email: 'qa-registration@example.test',
	password: 'FakeOnly-789!',
	firstName: 'Avery',
	lastName: 'Tester'
};

const usernameError = 'Username is already in use';

function isSignup(request: Request, origin: string): boolean {
	const url = new URL(request.url());
	return request.method() === 'POST' && url.origin === origin && url.pathname === apiEndpoints.signUp;
}

async function mockSignup(page: Page, baseURL: string | undefined, status: 201 | 400) {
	const origin = new URL(baseURL ?? getRequiredEnv('BASE_URL')).origin;
	const requests: Request[] = [];
	const unexpectedWrites: string[] = [];
	await page.context().route('**/*', async (route) => {
		const request = route.request();
		if (isSignup(request, origin)) {
			requests.push(request);
			await route.fulfill(status === 201 ? { status } : { status, json: { username: usernameError } });
			return;
		}
		if (['GET', 'HEAD', 'OPTIONS'].includes(request.method())) {
			await route.fallback();
			return;
		}
		unexpectedWrites.push(`${request.method()} ${new URL(request.url()).pathname}`);
		await route.abort('blockedbyclient');
	});
	return { requests, unexpectedWrites, matches: (request: Request) => isSignup(request, origin) };
}

test.use({ skipAutoLogin: true, serviceWorkers: 'block', contextOptions: {} });

test.describe('Registration', { tag: '@register' }, () => {
	test('shows required field errors without submitting an empty form', async ({ page, baseURL, registerPage }) => {
		const signup = await mockSignup(page, baseURL, 201);
		await registerPage.goto();
		await registerPage.buttons.submit.click();

		await expect(registerPage.errors.username).toHaveText('Username is required');
		await expect(registerPage.errors.email).toHaveText('Email is required');
		await expect(registerPage.errors.password).toHaveText('Password is required');
		await expect(registerPage.errors.firstName).toHaveText('First name is required');
		await expect(registerPage.errors.lastName).toHaveText('Last name is required');
		await expect(page).toHaveURL('/register');
		expect(signup.requests).toHaveLength(0);
		expect(signup.unexpectedWrites).toEqual([]);
	});

	test('submits the registration data and redirects to login on success', async ({
		page,
		baseURL,
		registerPage,
		loginPage
	}) => {
		const signup = await mockSignup(page, baseURL, 201);
		await registerPage.goto();
		await registerPage.fillForm(registration);

		const [response] = await Promise.all([
			page.waitForResponse((response) => signup.matches(response.request())),
			registerPage.buttons.submit.click()
		]);

		expect(response.status()).toBe(201);
		expect(response.request().postDataJSON()).toEqual(registration);
		expect(response.request().headers().authorization).toBeUndefined();
		await expect(page).toHaveURL('/login');
		await expect(loginPage.heading).toBeVisible();
		await expect(registerPage.successMessage).toHaveText('Registration successful! You can now log in.');
		await expect(registerPage.form).toBeHidden();
		expect(signup.requests).toHaveLength(1);
		expect(signup.unexpectedWrites).toEqual([]);
	});

	test('shows the API error for a username that is already in use', async ({ page, baseURL, registerPage }) => {
		const signup = await mockSignup(page, baseURL, 400);
		await registerPage.goto();
		await registerPage.fillForm(registration);

		const [response] = await Promise.all([
			page.waitForResponse((response) => signup.matches(response.request())),
			registerPage.buttons.submit.click()
		]);

		expect(response.status()).toBe(400);
		await expect(registerPage.errors.username).toHaveText(usernameError);
		await expect(registerPage.form).toBeVisible();
		await expect(registerPage.buttons.submit).toBeEnabled();
		await expect(page).toHaveURL('/register');
		expect(signup.requests).toHaveLength(1);
		expect(signup.unexpectedWrites).toEqual([]);
	});
});

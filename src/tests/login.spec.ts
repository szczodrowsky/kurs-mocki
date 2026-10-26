import { faker } from '@faker-js/faker';
import { expect, test } from '@fixtures/page-fixtures.js';

test.use({
	skipAutoLogin: true,
	contextOptions: {},
	trace: 'off',
	screenshot: 'off'
});

test.beforeEach(async ({ loginPage }) => {
	await loginPage.goto();
});

test('redirects to the dashboard after signing in with valid credentials', async ({
	loginPage,
	dashboardPage,
	page
}) => {
	await loginPage.login();

	await expect(page).toHaveURL('/');
	await expect(dashboardPage.heading).toBeVisible();
});

test('shows an error when signing in with invalid credentials', async ({ loginPage, page }) => {
	await loginPage.login({
		username: `unknown-user-${faker.string.uuid()}`,
		password: faker.internet.password()
	});

	await expect(loginPage.errors.signIn).toHaveText('Invalid username/password');
	await expect(page).toHaveURL('/login');
	await expect(loginPage.heading).toBeVisible();
});

test('requires a username before submitting the login form', async ({ loginPage, page }) => {
	await loginPage.login({ username: '', password: faker.internet.password() });

	await expect(loginPage.errors.username).toHaveText('Username is required');
	await expect(loginPage.errors.password).not.toBeVisible();
	await expect(page).toHaveURL('/login');
	await expect(loginPage.heading).toBeVisible();
});

test('requires a password before submitting the login form', async ({ loginPage, page }) => {
	await loginPage.login({ username: faker.internet.username(), password: '' });

	await expect(loginPage.errors.password).toHaveText('Password is required');
	await expect(loginPage.errors.username).not.toBeVisible();
	await expect(page).toHaveURL('/login');
	await expect(loginPage.heading).toBeVisible();
});

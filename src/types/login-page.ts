import type { Locator } from '@playwright/test';

export interface LoginPageInputs {
	readonly username: Locator;
	readonly password: Locator;
}

export interface LoginPageButtons {
	readonly signIn: Locator;
	readonly forgotPassword: Locator;
	readonly register: Locator;
}

export interface LoginPageErrors {
	readonly username: Locator;
	readonly password: Locator;
	readonly signIn: Locator;
}

export interface LoginPageLinks {
	readonly brand: Locator;
	readonly login: Locator;
	readonly register: Locator;
	readonly blog: Locator;
	readonly linkedIn: Locator;
	readonly buyMeACoffee: Locator;
}

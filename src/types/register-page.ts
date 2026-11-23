import type { Locator } from '@playwright/test';

export interface RegistrationData {
	username: string;
	email: string;
	password: string;
	firstName: string;
	lastName: string;
}

export type RegistrationFields = Readonly<Record<keyof RegistrationData, Locator>>;

export interface RegisterPageButtons {
	readonly submit: Locator;
}

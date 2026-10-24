import type { Locator } from '@playwright/test';

export interface DashboardPageButtons {
	readonly products: Locator;
	readonly users: Locator;
	readonly profileAndOrders: Locator;
	readonly aiAssistant: Locator;
	readonly trafficMonitor: Locator;
	readonly qrCodes: Locator;
	readonly sendEmails: Locator;
}

export interface DashboardPageLinks {
	readonly brand: Locator;
	readonly products: Locator;
	readonly sendEmail: Locator;
	readonly qrCode: Locator;
	readonly llm: Locator;
	readonly trafficMonitor: Locator;
	readonly admin: Locator;
	readonly cart: Locator;
	readonly profile: Locator;
	readonly blog: Locator;
	readonly linkedIn: Locator;
	readonly buyMeACoffee: Locator;
}

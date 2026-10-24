import type { DashboardPageButtons, DashboardPageLinks } from '@models/dashboard-page.js';
import { BasePage } from '@pages/basePage.js';
import type { Locator, Page } from '@playwright/test';

export class DashboardPage extends BasePage {
	readonly buttons: DashboardPageButtons;
	readonly links: DashboardPageLinks;
	readonly heading: Locator;

	constructor(page: Page) {
		const heading = page.getByTestId('home-welcome-title');
		super(page, () => '/', heading);

		this.buttons = {
			products: page.getByTestId('home-products-button'),
			users: page.getByTestId('home-users-button'),
			profileAndOrders: page.getByTestId('home-profile-button'),
			aiAssistant: page.getByTestId('home-llm-button'),
			trafficMonitor: page.getByTestId('home-traffic-button'),
			qrCodes: page.getByTestId('home-qr-button'),
			sendEmails: page.getByTestId('home-email-button')
		};

		this.links = {
			brand: page.getByTestId('brand-link'),
			products: page.getByTestId('desktop-menu-products'),
			sendEmail: page.getByTestId('desktop-menu-send-email'),
			qrCode: page.getByTestId('desktop-menu-qr-code'),
			llm: page.getByTestId('desktop-menu-llm'),
			trafficMonitor: page.getByTestId('desktop-menu-traffic-monitor'),
			admin: page.getByTestId('desktop-menu-admin'),
			cart: page.getByTestId('desktop-cart-icon'),
			profile: page.getByTestId('username-profile-link'),
			blog: page.getByTestId('footer-blog-link'),
			linkedIn: page.getByTestId('footer-linkedin-link'),
			buyMeACoffee: page.getByTestId('footer-coffee-link')
		};

		this.heading = heading;
	}
}

import { STATUS_CODES } from 'node:http';
import type { Page } from '@playwright/test';

export async function mockGetError(page: Page, endpoint: string, status: number): Promise<void> {
	await page.route(
		(url) => url.pathname === endpoint,
		async (route) => {
			if (route.request().method() !== 'GET') {
				await route.fallback();
				return;
			}

			await route.fulfill({ status, json: { message: STATUS_CODES[status] } });
		}
	);
}

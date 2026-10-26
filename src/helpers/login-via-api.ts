import { randomUUID } from 'node:crypto';
import type { LoginCredentials } from '@models/login-credentials.js';
import type { BrowserContext } from '@playwright/test';

export async function loginViaApi(
	context: BrowserContext,
	credentials: LoginCredentials,
	baseURL: string
): Promise<void> {
	const clientSessionId = randomUUID();
	const response = await context.request.post(new URL('/api/v1/users/signin', baseURL).href, {
		data: credentials,
		headers: { 'X-Client-Session-Id': clientSessionId }
	});

	if (!response.ok()) {
		throw new Error(`API login failed with HTTP ${response.status()}`);
	}

	let authentication: unknown;
	try {
		authentication = await response.json();
	} catch {
		throw new Error('API login returned invalid JSON');
	}

	if (
		typeof authentication !== 'object' ||
		authentication === null ||
		!('token' in authentication) ||
		typeof authentication.token !== 'string' ||
		!authentication.token ||
		!('refreshToken' in authentication) ||
		typeof authentication.refreshToken !== 'string' ||
		!authentication.refreshToken ||
		('mfaRequired' in authentication && authentication.mfaRequired === true)
	) {
		throw new Error('API login did not return a completed token session');
	}

	await context.setStorageState({
		cookies: [],
		origins: [
			{
				origin: new URL(baseURL).origin,
				localStorage: [
					{ name: 'token', value: authentication.token },
					{ name: 'refreshToken', value: authentication.refreshToken },
					{ name: 'clientSessionId', value: response.headers()['x-client-session-id'] || clientSessionId }
				]
			}
		]
	});
}

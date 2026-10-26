import { getRequiredEnv } from '@helpers/get-required-env.js';
import type { LoginCredentials } from '@models/login-credentials.js';

export function getAdminCredentials(): LoginCredentials {
	return {
		username: getRequiredEnv('ADMIN_LOGIN_USERNAME'),
		password: getRequiredEnv('ADMIN_LOGIN_PASSWORD')
	};
}

import type { LoginCredentials } from '@models/login-credentials.js';

export const adminCredentials: LoginCredentials = {
	username: process.env.ADMIN_LOGIN_USERNAME ?? '',
	password: process.env.ADMIN_LOGIN_PASSWORD ?? ''
};

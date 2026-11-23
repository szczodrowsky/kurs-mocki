import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';
import { getRequiredEnv } from './src/helpers/get-required-env.js';

const baseURL = getRequiredEnv('BASE_URL');
const isCI = Boolean(process.env.CI);

export default defineConfig({
	testDir: './src/tests',
	globalSetup: './src/fixtures/global-setup.ts',
	outputDir: './tests-results',
	fullyParallel: true,
	retries: 0,
	workers: 2,
	reporter: isCI ? 'blob' : 'html',
	use: {
		...devices['Desktop Chrome'],
		baseURL,
		trace: isCI ? 'off' : 'on',
		screenshot: { mode: 'on', fullPage: true },
		contextOptions: {
			recordHar: {
				path: 'network.har',
				content: 'embed',
				mode: 'full'
			}
		}
	},
	projects: [
		{ name: 'login', grep: /@login\b/ },
		{ name: 'products', grep: /@products\b/ },
		{ name: 'cart', grep: /@cart\b/ },
		{ name: 'register', grep: /@register\b/ }
	]
});

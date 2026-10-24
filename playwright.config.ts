import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL;

export default defineConfig({
	testDir: './src/tests',
	outputDir: './tests-results',
	fullyParallel: true,
	retries: 0,
	workers: 1,
	reporter: 'html',
	use: {
		baseURL,
		trace: 'on',
		screenshot: { mode: 'on', fullPage: true }
	},
	projects: [
		{
			name: 'mocking_tests',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});

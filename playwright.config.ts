import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	testDir: './src/tests',
	outputDir: './tests-results',
	fullyParallel: true,
	retries: 0,
	workers: 1,
	reporter: 'html',
	use: {
		trace: 'on-first-retry'
	},
	projects: [
		{
			name: 'mocking_tests',
			use: { ...devices['Desktop Chrome'] }
		}
	]
});

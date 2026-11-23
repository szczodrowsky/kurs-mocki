import { mkdir, mkdtemp, rm, rmdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getRequiredEnv } from '@helpers/get-required-env.js';
import { getAdminCredentials } from '@helpers/login-credentials.js';
import { loginViaApi } from '@helpers/login-via-api.js';

export default async function globalSetup() {
	const storageState = await loginViaApi(getAdminCredentials(), getRequiredEnv('BASE_URL'));
	const authRoot = fileURLToPath(new URL('../../.playwright/.auth/', import.meta.url));
	await mkdir(authRoot, { recursive: true });
	const runDirectory = await mkdtemp(join(authRoot, 'run-'));
	const statePath = join(runDirectory, 'storage-state.json');
	const cleanup = async () => {
		delete process.env.KURS_MOCKI_STORAGE_STATE;
		await rm(statePath, { force: true });
		await rmdir(runDirectory);
	};

	try {
		await writeFile(statePath, JSON.stringify(storageState), { flag: 'wx', mode: 0o600 });
		process.env.KURS_MOCKI_STORAGE_STATE = statePath;
	} catch (error) {
		await cleanup();
		throw error;
	}

	return cleanup;
}

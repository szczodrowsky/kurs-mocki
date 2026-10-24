export function getRequiredEnv(name: string): string {
	const value = process.env[name];

	if (!value) {
		throw new Error(`Set the required environment variable ${name} in .env or the process environment.`);
	}

	return value;
}

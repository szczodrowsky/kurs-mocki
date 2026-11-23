import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const hooksDirectory = dirname(fileURLToPath(import.meta.url));

function runHook(script, input, env = process.env) {
	return spawnSync('pwsh', ['-NoProfile', '-File', script], {
		input: JSON.stringify(input),
		encoding: 'utf8',
		env,
		timeout: 15000
	});
}

test('PreToolUse blocks force flags and allows safer alternatives', () => {
	const cases = [
		['git push --force --dry-run', 2],
		['git push -f --dry-run', 2],
		['git push origin main -vf', 2],
		['git -C "F:/Projects/kurs-mocki" push origin main --force', 2],
		['git status; git push --force', 2],
		['& "C:/Program Files/Git/bin/git.exe" push "--force"', 2],
		['git push --force-with-lease --force', 2],
		['git push --force-with-lease', 0],
		['git push --force-with-lease=main:abc123 --force-if-includes', 0],
		['git push --force-if-includes', 0],
		['git push origin main', 0],
		['git fetch -f', 0],
		['Write-Output "git push --force"', 0]
	];
	for (const [command, status] of cases) {
		const result = runHook(join(hooksDirectory, 'pre-tool-use.ps1'), { tool_input: { command } });
		assert.equal(result.status, status, `${command}: ${result.stderr}`);
		assert.equal(result.stdout, '');
		if (status === 2) assert.match(result.stderr, /PreToolUse hook: blocked/);
	}
	const invalid = runHook(join(hooksDirectory, 'pre-tool-use.ps1'), { tool_input: {} });
	assert.equal(invalid.status, 2);
});

test('Stop runs all checks, reports failures and skips repeated continuation', () => {
	const fixture = mkdtempSync(join(tmpdir(), 'kurs-mocki-hooks-'));
	try {
		const script = join(fixture, '.codex', 'hooks', 'stop.ps1');
		mkdirSync(dirname(script), { recursive: true });
		copyFileSync(join(hooksDirectory, 'stop.ps1'), script);
		writeFileSync(
			join(fixture, 'npm.cmd'),
			'@echo off\r\necho %*>>checks.log\r\necho check output\r\nif "%HOOK_TEST_FAIL%"=="1" exit /b 1\r\nexit /b 0\r\n'
		);
		const env = { ...process.env, PATH: `${fixture};${process.env.PATH}` };
		for (const fail of ['0', '1']) {
			writeFileSync(join(fixture, 'checks.log'), '');
			const result = runHook(script, { stop_hook_active: false }, { ...env, HOOK_TEST_FAIL: fail });
			assert.equal(result.status, fail === '1' ? 2 : 0, result.stderr);
			assert.equal(result.stdout, '');
			assert.deepEqual(readFileSync(join(fixture, 'checks.log'), 'utf8').trim().split(/\r?\n/), [
				'run typecheck',
				'run check:ci',
				'run format:check'
			]);
			if (fail === '1') assert.match(result.stderr, /check output/);
		}
		writeFileSync(join(fixture, 'checks.log'), '');
		const repeated = runHook(script, { stop_hook_active: true }, env);
		assert.equal(repeated.status, 0, repeated.stderr);
		assert.equal(readFileSync(join(fixture, 'checks.log'), 'utf8'), '');
	} finally {
		assert.equal(dirname(fixture), resolve(tmpdir()));
		rmSync(fixture, { recursive: true, force: true });
	}
});

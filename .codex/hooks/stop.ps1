$ErrorActionPreference = 'Stop'

try {
	$event = [Console]::In.ReadToEnd() | ConvertFrom-Json
	if ($event.stop_hook_active -eq $true) {
		exit 0
	}

	Set-Location (Join-Path $PSScriptRoot '../..')
	$failed = $false
	foreach ($check in @('typecheck', 'check:ci', 'format:check')) {
		$output = & npm.cmd run $check 2>&1 | Out-String
		if ($LASTEXITCODE -ne 0) {
			[Console]::Error.WriteLine("Stop hook: npm run $check failed.`n$output")
			$failed = $true
		}
	}

	if ($failed) {
		exit 2
	}
} catch {
	[Console]::Error.WriteLine("Stop hook failed: $_")
	exit 2
}

exit 0

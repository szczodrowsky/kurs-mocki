$ErrorActionPreference = 'Stop'

try {
	$event = [Console]::In.ReadToEnd() | ConvertFrom-Json
	$command = $event.tool_input.command
	if ($command -isnot [string]) {
		throw 'Expected tool_input.command to be a string.'
	}

	$tokens = $null
	$parseErrors = $null
	$ast = [System.Management.Automation.Language.Parser]::ParseInput($command, [ref]$tokens, [ref]$parseErrors)
	$commands = $ast.FindAll({ param($node) $node -is [System.Management.Automation.Language.CommandAst] }, $true)
	foreach ($invocation in $commands) {
		$name = $invocation.GetCommandName()
		if (!$name -or [IO.Path]::GetFileName($name) -notmatch '^git(?:\.exe)?$') {
			continue
		}

		$arguments = @($invocation.CommandElements | Select-Object -Skip 1 | ForEach-Object {
			if ($_ -is [System.Management.Automation.Language.StringConstantExpressionAst]) {
				$_.Value
			} else {
				$_.Extent.Text
			}
		})
		$pushIndex = [Array]::IndexOf($arguments, 'push')
		if ($pushIndex -lt 0) {
			continue
		}

		foreach ($argument in $arguments | Select-Object -Skip ($pushIndex + 1)) {
			if ($argument -eq '--') {
				break
			}
			if ($argument -ceq '--force' -or $argument -cmatch '^-[a-zA-Z]*f[a-zA-Z]*$') {
				[Console]::Error.WriteLine('PreToolUse hook: blocked git push --force/-f. Use --force-with-lease or --force-if-includes instead.')
				exit 2
			}
		}
	}
} catch {
	[Console]::Error.WriteLine("PreToolUse hook failed: $_")
	exit 2
}

exit 0

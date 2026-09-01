$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$setupScript = Join-Path $repoRoot 'skills-visual\flint-chart-mcp\scripts\setup-flint-runtime.ps1'
$visualInstaller = Join-Path $repoRoot 'install-visual.ps1'
$registry = 'https://packagefeedproxy.microsoft.io/npm/'

function Assert-Contains {
  param(
    [string]$Output,
    [string]$Expected
  )

  if (-not $Output.Contains($Expected)) {
    throw "Expected output to contain: $Expected`nActual output:`n$Output"
  }
}

$setupOutput = & $setupScript -NpmRegistry $registry *>&1 | Out-String
Assert-Contains $setupOutput "npm registry: $registry"
Assert-Contains $setupOutput "--registry `"$registry`""

$installerOutput = & $visualInstaller -SetupFlintMcp -NpmRegistry $registry *>&1 | Out-String
Assert-Contains $installerOutput "npm registry: $registry"
Assert-Contains $installerOutput "--registry `"$registry`""

$temporaryRuntime = Join-Path ([System.IO.Path]::GetTempPath()) "alex-act-scout-flint-test-$([guid]::NewGuid())"
$staleCli = Join-Path $temporaryRuntime 'node_modules\flint-chart-mcp\dist\cli.js'
$previousRetries = $env:NPM_CONFIG_FETCH_RETRIES
$previousTimeout = $env:NPM_CONFIG_FETCH_TIMEOUT
$setupFailed = $false

try {
  New-Item -ItemType Directory -Path (Split-Path -Parent $staleCli) -Force | Out-Null
  Set-Content -LiteralPath $staleCli -Value '// stale test CLI'
  $env:NPM_CONFIG_FETCH_RETRIES = '0'
  $env:NPM_CONFIG_FETCH_TIMEOUT = '1000'

  try {
    & $setupScript -Apply -RuntimeRoot $temporaryRuntime -NpmRegistry 'http://127.0.0.1:9/' *>&1 | Out-Null
  } catch {
    $setupFailed = $true
  }

  if (-not $setupFailed) {
    throw 'Expected Flint setup to fail when npm exits unsuccessfully, even when a stale CLI exists.'
  }
} finally {
  Remove-Item -LiteralPath $temporaryRuntime -Recurse -Force -ErrorAction SilentlyContinue
  if ($null -eq $previousRetries) {
    Remove-Item Env:NPM_CONFIG_FETCH_RETRIES -ErrorAction SilentlyContinue
  } else {
    $env:NPM_CONFIG_FETCH_RETRIES = $previousRetries
  }
  if ($null -eq $previousTimeout) {
    Remove-Item Env:NPM_CONFIG_FETCH_TIMEOUT -ErrorAction SilentlyContinue
  } else {
    $env:NPM_CONFIG_FETCH_TIMEOUT = $previousTimeout
  }
}

Write-Host 'Visual installer registry override tests passed.'
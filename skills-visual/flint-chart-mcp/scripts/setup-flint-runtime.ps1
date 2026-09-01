[CmdletBinding()]
param(
  [string]$RuntimeRoot = (Join-Path $env:USERPROFILE '.scout\plugin-data\alex-act-scout\flint-runtime'),
  [string]$PackageVersion = '0.5.0',
  [string]$NpmRegistry,
  [switch]$Apply,
  [switch]$Help
)

$ErrorActionPreference = 'Stop'

function Show-Usage {
  @"
Usage:
  .\setup-flint-runtime.ps1 [-RuntimeRoot <path>] [-PackageVersion <version>] [-NpmRegistry <url>] [-Apply] [-Help]

Installs flint-chart-mcp into a Scout-owned local runtime folder.
Dry-run mode is used unless -Apply is supplied.
"@
}

if ($Help) {
  Show-Usage
  return
}

if ([string]::IsNullOrWhiteSpace($RuntimeRoot)) {
  throw 'RuntimeRoot cannot be empty.'
}

$runtimeFullPath = [System.IO.Path]::GetFullPath($RuntimeRoot)
$runtimeRootPath = [System.IO.Path]::GetPathRoot($runtimeFullPath)
if ($runtimeFullPath.TrimEnd('\', '/') -eq $runtimeRootPath.TrimEnd('\', '/')) {
  throw "Refusing to install into filesystem root: $runtimeFullPath"
}

$npm = Get-Command npm -ErrorAction Stop
$registry = if ([string]::IsNullOrWhiteSpace($NpmRegistry)) {
  (& $npm.Source config get registry).Trim()
} else {
  $NpmRegistry.Trim()
}
$packageSpec = "flint-chart-mcp@$PackageVersion"
$dryRun = -not $Apply

if ($dryRun) {
  Write-Host 'DRY RUN: no files will be changed. Re-run with -Apply to install.'
} else {
  Write-Host "APPLY: installing $packageSpec into $runtimeFullPath"
}

Write-Host "npm: $($npm.Source)"
Write-Host "npm registry: $registry"
Write-Host "runtime root: $runtimeFullPath"
Write-Host "package: $packageSpec"

if ($dryRun) {
  Write-Host "Would create runtime folder: $runtimeFullPath"
  Write-Host "Would run: npm install --prefix `"$runtimeFullPath`" --save-exact `"$packageSpec`" --registry `"$registry`""
  return
}

New-Item -ItemType Directory -Path $runtimeFullPath -Force | Out-Null
& $npm.Source install --prefix $runtimeFullPath --save-exact $packageSpec --registry $registry
$npmExitCode = $LASTEXITCODE
if ($npmExitCode -ne 0) {
  throw "npm install failed with exit code $npmExitCode."
}

$cliPath = Join-Path $runtimeFullPath 'node_modules\flint-chart-mcp\dist\cli.js'
if (-not (Test-Path -LiteralPath $cliPath)) {
  throw "Expected Flint MCP CLI was not installed: $cliPath"
}

Write-Host "Installed Flint MCP CLI: $cliPath"

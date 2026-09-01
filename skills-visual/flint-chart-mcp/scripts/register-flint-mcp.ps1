[CmdletBinding()]
param(
  [string]$RegistryPath = (Join-Path $env:USERPROFILE '.scout\m-mcp-servers.json'),
  [string]$LauncherPath,
  [switch]$Apply,
  [switch]$Help
)

$ErrorActionPreference = 'Stop'

function Show-Usage {
  @"
Usage:
  .\register-flint-mcp.ps1 [-RegistryPath <path>] [-LauncherPath <path>] [-Apply] [-Help]

Registers the Flint MCP launcher in Scout's local MCP registry.
Dry-run mode is used unless -Apply is supplied.
"@
}

if ($Help) {
  Show-Usage
  return
}

if ([string]::IsNullOrWhiteSpace($RegistryPath)) {
  throw 'RegistryPath cannot be empty.'
}

if ([string]::IsNullOrWhiteSpace($LauncherPath)) {
  $LauncherPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) 'runtime-launcher.mjs'
}

$registryFullPath = [System.IO.Path]::GetFullPath($RegistryPath)
$launcherFullPath = [System.IO.Path]::GetFullPath($LauncherPath)
$dryRun = -not $Apply

if (-not (Test-Path -LiteralPath $launcherFullPath)) {
  if ($dryRun) {
    Write-Host "Would use runtime launcher after visual skill install: $launcherFullPath"
  } else {
    throw "Missing runtime launcher: $launcherFullPath"
  }
}

if (Test-Path -LiteralPath $registryFullPath) {
  $registry = Get-Content -LiteralPath $registryFullPath -Raw | ConvertFrom-Json
} else {
  $registry = [pscustomobject]@{ servers = [pscustomobject]@{} }
}

if (-not $registry.PSObject.Properties['servers']) {
  $registry | Add-Member -MemberType NoteProperty -Name servers -Value ([pscustomobject]@{})
}

$flintEntry = [pscustomobject]@{
  builtin = $false
  config = [pscustomobject]@{
    name = 'flint'
    type = 'command'
    command = 'node'
    args = @($launcherFullPath, 'flint')
  }
  tools = @()
}

$registry.servers | Add-Member -MemberType NoteProperty -Name flint -Value $flintEntry -Force

if ($dryRun) {
  Write-Host 'DRY RUN: no files will be changed. Re-run with -Apply to register.'
  Write-Host "Would update registry: $registryFullPath"
  Write-Host "Would set flint launcher: $launcherFullPath"
  $registry | ConvertTo-Json -Depth 20
  return
}

$registryDir = Split-Path -Parent $registryFullPath
New-Item -ItemType Directory -Path $registryDir -Force | Out-Null

if (Test-Path -LiteralPath $registryFullPath) {
  $timestamp = Get-Date -Format 'yyyyMMdd-HHmmss'
  Copy-Item -LiteralPath $registryFullPath -Destination "$registryFullPath.bak-$timestamp"
}

$registry | ConvertTo-Json -Depth 20 | Set-Content -LiteralPath $registryFullPath -Encoding UTF8
Write-Host "Registered Flint MCP in $registryFullPath"
Write-Host 'Restart Scout so the MCP tool inventory refreshes.'

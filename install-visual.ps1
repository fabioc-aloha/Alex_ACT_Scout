[CmdletBinding()]
param(
  [string]$Destination = (Join-Path $env:USERPROFILE '.scout\skills'),
  [switch]$Apply,
  [switch]$Force,
  [switch]$SetupFlintMcp,
  [switch]$RegisterFlintMcp,
  [switch]$WithFlintMcp,
  [string]$NpmRegistry,
  [switch]$Help
)

$ErrorActionPreference = 'Stop'

function Show-Usage {
  @"
Usage:
  .\install-visual.ps1 [-Destination <path>] [-Apply] [-Force] [-SetupFlintMcp] [-RegisterFlintMcp] [-WithFlintMcp] [-NpmRegistry <url>] [-Help]

Options:
  -Destination <path>             Install into a custom Scout skills folder.
                                  Default: %USERPROFILE%\.scout\skills
  -Apply                          Apply changes. Without this flag, the script runs in dry-run mode.
  -Force                          Overwrite existing visual skill folders when applying.
  -SetupFlintMcp                  Also run the Flint runtime setup step.
  -RegisterFlintMcp               Also register Flint in Scout's MCP registry.
  -WithFlintMcp                   Shortcut for -SetupFlintMcp -RegisterFlintMcp.
  -NpmRegistry <url>              Use this npm registry for Flint runtime setup only.
  -Help                           Show this help.
"@
}

if ($Help) {
  Show-Usage
  return
}

if ([string]::IsNullOrWhiteSpace($Destination)) {
  throw 'Destination cannot be empty.'
}

$destinationFullPath = [System.IO.Path]::GetFullPath($Destination)
$destinationRoot = [System.IO.Path]::GetPathRoot($destinationFullPath)
if ($destinationFullPath.TrimEnd('\', '/') -eq $destinationRoot.TrimEnd('\', '/')) {
  throw "Refusing to install into filesystem root: $destinationFullPath"
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$skillsRoot = Join-Path $repoRoot 'skills-visual'
$dryRun = -not $Apply

if ($WithFlintMcp) {
  $SetupFlintMcp = $true
  $RegisterFlintMcp = $true
}

if (-not (Test-Path -LiteralPath $skillsRoot)) {
  throw "Missing visual skills directory: $skillsRoot"
}

if ($dryRun) {
  Write-Host 'DRY RUN: no files will be changed. Re-run with -Apply to install.'
} else {
  Write-Host "APPLY: installing visual skills into $Destination"
}

if (-not (Test-Path -LiteralPath $Destination)) {
  if ($dryRun) {
    Write-Host "Would create destination: $Destination"
  } else {
    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
  }
}

$installed = 0
$skipped = 0

Get-ChildItem -Directory -LiteralPath $skillsRoot | Sort-Object Name | ForEach-Object {
  $target = Join-Path $Destination $_.Name
  $targetExists = Test-Path -LiteralPath $target

  if ($targetExists -and -not $Force) {
    Write-Host "Skipping existing visual skill: $($_.Name) (use -Force to overwrite)"
    $script:skipped++
    return
  }

  if ($dryRun) {
    if ($targetExists) {
      Write-Host "Would overwrite visual skill: $($_.Name)"
    } else {
      Write-Host "Would install visual skill: $($_.Name)"
    }
  } else {
    if ($targetExists) {
      Remove-Item -Recurse -Force -LiteralPath $target
    }
    Copy-Item -Recurse -LiteralPath $_.FullName -Destination $Destination
    Write-Host "Installed visual skill: $($_.Name)"
  }
  $script:installed++
}

if ($dryRun) {
  Write-Host "Dry run complete: would install/overwrite $installed visual skill(s), skip $skipped existing visual skill(s). Re-run with -Apply to make changes."
} else {
  Write-Host "Installed $installed visual skill(s); skipped $skipped existing visual skill(s). Restart Scout to refresh the skill list."
}

if ($SetupFlintMcp) {
  $setupScript = Join-Path $skillsRoot 'flint-chart-mcp\scripts\setup-flint-runtime.ps1'
  if (-not (Test-Path -LiteralPath $setupScript)) {
    throw "Missing Flint setup script: $setupScript"
  }

  $setupArguments = @{}
  if (-not [string]::IsNullOrWhiteSpace($NpmRegistry)) {
    $setupArguments.NpmRegistry = $NpmRegistry
  }
  if (-not $dryRun) {
    $setupArguments.Apply = $true
  }
  & $setupScript @setupArguments
}

if ($RegisterFlintMcp) {
  $registerScript = Join-Path $skillsRoot 'flint-chart-mcp\scripts\register-flint-mcp.ps1'
  $launcherPath = Join-Path $Destination 'flint-chart-mcp\scripts\runtime-launcher.mjs'
  if (-not (Test-Path -LiteralPath $registerScript)) {
    throw "Missing Flint registration script: $registerScript"
  }

  if ($dryRun) {
    & $registerScript -LauncherPath $launcherPath
  } else {
    & $registerScript -LauncherPath $launcherPath -Apply
  }
}

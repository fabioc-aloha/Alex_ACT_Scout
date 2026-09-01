[CmdletBinding()]
param(
  # Scout's default custom-skill directory on Windows.
  [string]$Destination = (Join-Path $env:USERPROFILE '.scout\skills'),

  # Actually modify files. Without -Apply, the script only prints planned work.
  [switch]$Apply,

  # Overwrite existing skill folders instead of leaving them untouched.
  [switch]$Force,

  # Print usage and exit.
  [switch]$Help
)

$ErrorActionPreference = 'Stop'

function Show-Usage {
  @"
Usage:
  .\install.ps1 [-Destination <path>] [-Apply] [-Force] [-Help]

Options:
  -Destination <path>             Install into a custom Scout skills folder.
                                  Default: %USERPROFILE%\.scout\skills
  -Apply                          Apply changes. Without this flag, the script runs in dry-run mode.
  -Force                          Overwrite existing skill folders when applying.
  -Help                           Show this help.

Examples:
  .\install.ps1
  .\install.ps1 -Apply
  .\install.ps1 -Apply -Force
  .\install.ps1 -Destination "D:\ScoutSkills" -Apply
"@
}

if ($Help) {
  Show-Usage
  return
}

if ([string]::IsNullOrWhiteSpace($Destination)) {
  throw "Destination cannot be empty."
}

$destinationFullPath = [System.IO.Path]::GetFullPath($Destination)
$destinationRoot = [System.IO.Path]::GetPathRoot($destinationFullPath)
if ($destinationFullPath.TrimEnd('\', '/') -eq $destinationRoot.TrimEnd('\', '/')) {
  throw "Refusing to install into filesystem root: $destinationFullPath"
}

# Resolve paths from the script location so the command works from any cwd.
$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$skillsRoot = Join-Path $repoRoot 'skills'
$dryRun = -not $Apply

if (-not (Test-Path -LiteralPath $skillsRoot)) {
  throw "Missing skills directory: $skillsRoot"
}

if ($dryRun) {
  Write-Host "DRY RUN: no files will be changed. Re-run with -Apply to install."
} else {
  Write-Host "APPLY: installing skills into $Destination"
}

# Ensure Scout's skill folder exists before cleanup or copy operations. In dry
# run mode, only report that the folder would be created.
if (-not (Test-Path -LiteralPath $Destination)) {
  if ($dryRun) {
    Write-Host "Would create destination: $Destination"
  } else {
    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
  }
}

$installed = 0
$skipped = 0
$removed = 0

# The current package stores source prompts/instructions as resources under
# related skills, so always remove stale top-level folders if they are present.
if (Test-Path -LiteralPath $Destination) {
  Get-ChildItem -Directory -LiteralPath $Destination -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like 'alex-instruction-*' -or $_.Name -like 'alex-prompt-*' } |
    ForEach-Object {
      if ($dryRun) {
        Write-Host "Would remove legacy top-level converted skill: $($_.Name)"
      } else {
        Remove-Item -Recurse -Force -LiteralPath $_.FullName
        Write-Host "Removed legacy top-level converted skill: $($_.Name)"
      }
      $script:removed++
    }
}

# These source skills are not shipped, and the retired message-bus capabilities
# have been removed from the package. Remove leftovers from older installs.
$obsoleteSkills = @(
  'browser-tools',
  'platform-awareness',
  'scout-message-bus',
  'scout-message-bus-heartbeat'
)
if (Test-Path -LiteralPath $Destination) {
  Get-ChildItem -Directory -LiteralPath $Destination -ErrorAction SilentlyContinue |
    Where-Object { $obsoleteSkills -contains $_.Name } |
    ForEach-Object {
      if ($dryRun) {
        Write-Host "Would remove obsolete VS Code-specific skill: $($_.Name)"
      } else {
        Remove-Item -Recurse -Force -LiteralPath $_.FullName
        Write-Host "Removed obsolete VS Code-specific skill: $($_.Name)"
      }
      $script:removed++
    }
}

# Copy every current top-level skill folder. Existing skills are protected by
# default so user edits are not overwritten unless -Force is supplied.
Get-ChildItem -Directory -LiteralPath $skillsRoot | Sort-Object Name | ForEach-Object {
  $target = Join-Path $Destination $_.Name
  $targetExists = Test-Path -LiteralPath $target

  if ($targetExists -and -not $Force) {
    Write-Host "Skipping existing skill: $($_.Name) (use -Force to overwrite)"
    $script:skipped++
    return
  }

  if ($dryRun) {
    if ($targetExists) {
      Write-Host "Would overwrite skill: $($_.Name)"
    } else {
      Write-Host "Would install skill: $($_.Name)"
    }
  } else {
    if ($targetExists) {
      # Replace the folder instead of merging into it. A merge can leave stale
      # files behind when resources or scripts are removed from this package.
      Remove-Item -Recurse -Force -LiteralPath $target
    }
    Copy-Item -Recurse -LiteralPath $_.FullName -Destination $Destination
    Write-Host "Installed skill: $($_.Name)"
  }
  $script:installed++
}

if ($dryRun) {
  Write-Host "Dry run complete: would install/overwrite $installed skill(s), skip $skipped existing skill(s), remove $removed stale skill(s). Re-run with -Apply to make changes."
} else {
  Write-Host "Installed $installed skill(s); skipped $skipped existing skill(s); removed $removed stale skill(s). Restart Scout to refresh the skill list."
}

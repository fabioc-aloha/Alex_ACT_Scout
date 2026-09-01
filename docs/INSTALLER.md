# Installer scripts

Alex ACT Scout ships two core installers and two optional visual add-on installers:

| Platform | Script | Default destination |
| --- | --- | --- |
| Windows PowerShell | `install.ps1` | `%USERPROFILE%\.scout\skills` |
| macOS/Linux shell | `install.sh` | `$HOME/.scout/skills` |
| Windows PowerShell visual add-on | `install-visual.ps1` | `%USERPROFILE%\.scout\skills` |
| macOS/Linux visual add-on | `install-visual.sh` | `$HOME/.scout/skills` |

All installers preview their work by default. They only copy, overwrite, create, or remove folders when `-Apply` or `--apply` is supplied.

The core installers include stale-skill cleanup for older package shapes. The visual installers only copy folders from `skills-visual/` and never remove unrelated core skills.

Restart Scout after installation so the skill inventory refreshes.

## Quick start

Windows:

```powershell
.\install.ps1
```

macOS/Linux:

```bash
./install.sh
```

The quick-start commands above are dry runs. To apply changes:

```powershell
.\install.ps1 -Apply
```

```bash
./install.sh --apply
```

If the Unix script is not executable after cloning, run:

```bash
chmod +x ./install.sh
```

For the optional visual add-on:

```powershell
.\install-visual.ps1
.\install-visual.ps1 -Apply
```

```bash
./install-visual.sh
./install-visual.sh --apply
```

To include the Flint MCP runtime setup and Scout MCP registration in the same visual add-on flow:

```powershell
.\install-visual.ps1 -WithFlintMcp
.\install-visual.ps1 -Apply -WithFlintMcp
```

```bash
./install-visual.sh --with-flint-mcp
./install-visual.sh --apply --with-flint-mcp
```

## Parameters

| Purpose | Windows PowerShell | macOS/Linux |
| --- | --- | --- |
| Custom destination | `-Destination <path>` | `--destination PATH` |
| Apply changes | `-Apply` | `--apply` |
| Overwrite existing skills when applying | `-Force` | `--force` |
| Show help | PowerShell `Get-Help` style is not defined | `--help` |

The visual installers support those same parameter shapes plus these optional Flint MCP flags:

| Purpose | Windows PowerShell | macOS/Linux |
| --- | --- | --- |
| Include runtime setup and MCP registration | `-WithFlintMcp` | `--with-flint-mcp` |
| Setup the local Flint runtime only | `-SetupFlintMcp` | `--setup-flint-mcp` |
| Register Flint in Scout's MCP registry only | `-RegisterFlintMcp` | `--register-flint-mcp` |
| Use a one-off npm registry for Flint setup | `-NpmRegistry <url>` | `--npm-registry URL` |

The registry option applies only to the Flint runtime setup command. It does not modify user or global npm configuration. When omitted, the setup script uses `npm config get registry`.

On the Microsoft network:

```powershell
.\install-visual.ps1 -Apply -WithFlintMcp -NpmRegistry 'https://packagefeedproxy.microsoft.io/npm/'
```

```bash
./install-visual.sh --apply --with-flint-mcp --npm-registry 'https://packagefeedproxy.microsoft.io/npm/'
```

## Common commands

### First install

Windows:

```powershell
.\install.ps1 -Apply
```

macOS/Linux:

```bash
./install.sh --apply
```

Creates the destination folder if needed, then copies every folder under `skills\` into it. Existing skill folders are skipped.

The visual add-on installers copy every folder under `skills-visual\` into the same destination. Existing visual skill folders are skipped unless force is supplied. When the Flint MCP flags are supplied, they also call the runtime setup and registration scripts from `skills-visual\flint-chart-mcp\scripts\`.

### Refresh an existing install

Windows:

```powershell
.\install.ps1 -Apply -Force
```

macOS/Linux:

```bash
./install.sh --apply --force
```

Overwrites installed copies of Alex ACT Scout skills with the current repository version.

### Install to a custom location

Windows:

```powershell
.\install.ps1 -Destination "D:\ScoutSkills" -Apply
```

macOS/Linux:

```bash
./install.sh --destination "$HOME/ScoutSkills" --apply
```

Use this only if Scout is configured to load skills from that custom folder.

## What the installers do

1. Resolve the repository root from the script location, not from the current working directory.
2. Verify that `<repo-root>\skills` or `<repo-root>/skills` exists.
3. Print the planned changes in dry-run mode, or modify files only when `-Apply` / `--apply` is supplied.
4. Create the destination folder if needed.
5. Remove stale top-level converted prompt/instruction skills if present:
   - `alex-instruction-*`
   - `alex-prompt-*`
6. Remove obsolete VS Code-specific skills from previous installs:
   - `browser-tools`
   - `platform-awareness`
   - `scout-message-bus`
   - `scout-message-bus-heartbeat`
7. Copy each top-level skill folder from `skills` into the destination.
8. Skip existing skill folders unless the overwrite flag is set.
9. Print installed/skipped/removed counts.

The scripts include inline comments describing these steps so maintainers can safely adapt them.

## What the installers do not do

- They do not restart Scout.
- They do not configure cross-instance messaging.
- They do not change Scout's active personality preset.
- They do not delete unrelated user-created skills.
- Core installers do not install dependencies or external tools.
- The visual skill installers do not install the Flint MCP runtime unless `-WithFlintMcp`, `-SetupFlintMcp`, or `--with-flint-mcp`, `--setup-flint-mcp` is supplied.

## Expected output

Typical first install:

```text
APPLY: installing skills into ...
Installed skill: act-tenets
Installed skill: alex-act-core
...
Installed 32 skill(s); skipped 0 existing skill(s); removed 0 stale skill(s). Restart Scout to refresh the skill list.
```

Typical dry run:

```text
DRY RUN: no files will be changed. Re-run with -Apply to install.
Would install skill: act-tenets
...
Dry run complete: would install/overwrite 32 skill(s), skip 0 existing skill(s), remove 0 stale skill(s). Re-run with -Apply to make changes.
```

Typical repeat install without overwrite in apply mode:

```text
Skipping existing skill: act-tenets (use -Force to overwrite)
...
Installed 0 skill(s); skipped 32 existing skill(s); removed 0 stale skill(s). Restart Scout to refresh the skill list.
```

On macOS/Linux, the skip hint says `use --force to overwrite`.

## Troubleshooting

| Problem | Cause | Fix |
| --- | --- | --- |
| Skills do not appear in Scout | Scout has not refreshed its skill inventory. | Restart Scout after running the installer. |
| A skill was not updated | Existing folders are skipped by default. | Re-run with `-Apply -Force` or `--apply --force`. |
| Duplicate `alex-prompt-*` or `alex-instruction-*` skills appear | Old package shape is still installed. | Run the installer in apply mode so stale folders are removed. |
| Retired or obsolete skills still appear | An older install remains. | Re-run with `-Apply -Force` or `--apply --force`; cleanup runs before copying. |
| Script says `Missing skills directory` | The script is not being run from this package or the repo is incomplete. | Confirm the repository has a `skills` folder. |
| Flint setup fails with `ERR_SSL_SSL/TLS_ALERT_HANDSHAKE_FAILURE` on the Microsoft network | Direct access to the public npm registry is blocked. | Re-run the visual installer with `-NpmRegistry 'https://packagefeedproxy.microsoft.io/npm/'` or `--npm-registry 'https://packagefeedproxy.microsoft.io/npm/'`. |
| Flint tools do not appear after successful setup | Scout has not refreshed its MCP inventory or Flint was not registered. | Use `-WithFlintMcp` or `--with-flint-mcp`, then restart Scout. |
| Script refuses the destination | Destination is empty or points at the filesystem root. | Choose a concrete Scout skills directory, usually the default. |
| `./install.sh: Permission denied` | The executable bit is missing. | Run `chmod +x ./install.sh`, then retry. |
| Visual skills install but Flint tools are missing | The skill installer does not register MCP servers. | Run the `flint-chart-mcp` setup and registration scripts, then restart Scout. |

## Validation commands

Use a temporary destination to test the installer without changing Scout.

Windows:

```powershell
$temp = Join-Path $env:TEMP ("alex-act-scout-" + [guid]::NewGuid())
.\install.ps1 -Destination $temp
Get-ChildItem $temp -Directory
Remove-Item -Recurse -Force $temp
```

To test applying into the temporary destination:

```powershell
$temp = Join-Path $env:TEMP ("alex-act-scout-" + [guid]::NewGuid())
.\install.ps1 -Destination $temp -Apply
Get-ChildItem $temp -Directory
Remove-Item -Recurse -Force $temp
```

macOS/Linux:

```bash
temp="$(mktemp -d)"
./install.sh --destination "$temp"
find "$temp" -mindepth 1 -maxdepth 1 -type d | sort
rm -rf "$temp"
```

To test applying into the temporary destination:

```bash
temp="$(mktemp -d)"
./install.sh --destination "$temp" --apply
find "$temp" -mindepth 1 -maxdepth 1 -type d | sort
rm -rf "$temp"
```

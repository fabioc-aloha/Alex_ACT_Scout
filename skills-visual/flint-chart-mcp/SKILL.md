---
name: flint-chart-mcp
description: >-
  Set up, diagnose, and register the optional Flint MCP runtime for Microsoft Scout.
  Use when Flint tools are missing, chart rendering fails, or the user wants to install
  or repair the visual add-on runtime.
---

# Flint Chart MCP

Provision and diagnose the optional Flint MCP runtime used by the visual add-on.

## What this skill owns

This skill is operational, not chart-authoring. It handles:

- installing the pinned local `flint-chart-mcp` npm package into a Scout-owned runtime folder
- registering a local Flint MCP server in Scout's MCP registry
- checking whether Flint tools are visible
- diagnosing common runtime failures

Use `flint-chart` after this runtime is available.

## Runtime model

The visual add-on does not install Flint globally and does not use `npx` at runtime.

Default runtime paths:

| Platform | Runtime root |
| --- | --- |
| Windows | `%USERPROFILE%\.scout\plugin-data\alex-act-scout\flint-runtime` |
| macOS/Linux | `$HOME/.scout/plugin-data/alex-act-scout/flint-runtime` |

Pinned package:

```text
flint-chart-mcp@0.5.0
```

## Scripts

This skill carries helper scripts in `scripts/`.

| Script | Purpose |
| --- | --- |
| `setup-flint-runtime.ps1` | Windows dry-run/apply installer for the local Flint runtime. |
| `setup-flint-runtime.sh` | macOS/Linux dry-run/apply installer for the local Flint runtime. |
| `register-flint-mcp.ps1` | Windows dry-run/apply registration into `%USERPROFILE%\.scout\m-mcp-servers.json`. |
| `register-flint-mcp.sh` | macOS/Linux dry-run/apply registration into `$HOME/.scout/m-mcp-servers.json`. |
| `runtime-launcher.mjs` | Node launcher that starts the pinned local Flint MCP CLI over stdio. |

## Setup workflow

The visual installer can perform the full setup:

Windows:

```powershell
.\install-visual.ps1 -WithFlintMcp
.\install-visual.ps1 -Apply -WithFlintMcp
```

macOS/Linux:

```bash
./install-visual.sh --with-flint-mcp
./install-visual.sh --apply --with-flint-mcp
```

When the default npm registry is unavailable, pass a one-off registry to the setup step. For example, on the Microsoft network:

```powershell
.\install-visual.ps1 -Apply -WithFlintMcp -NpmRegistry 'https://packagefeedproxy.microsoft.io/npm/'
```

```bash
./install-visual.sh --apply --with-flint-mcp --npm-registry 'https://packagefeedproxy.microsoft.io/npm/'
```

Manual setup remains available when you need separate control:

1. Run the setup script in dry-run mode.
2. Confirm the npm registry and install path are expected.
3. Re-run with apply.
4. Run the registration script in dry-run mode.
5. Confirm the registry path and launcher path are expected.
6. Re-run with apply.
7. Restart Scout.
8. Confirm Flint tools appear, especially `render_chart`, `validate_chart`, and `list_themes`.

Windows:

```powershell
.\skills-visual\flint-chart-mcp\scripts\setup-flint-runtime.ps1
.\skills-visual\flint-chart-mcp\scripts\setup-flint-runtime.ps1 -Apply
.\skills-visual\flint-chart-mcp\scripts\register-flint-mcp.ps1
.\skills-visual\flint-chart-mcp\scripts\register-flint-mcp.ps1 -Apply
```

macOS/Linux:

```bash
./skills-visual/flint-chart-mcp/scripts/setup-flint-runtime.sh
./skills-visual/flint-chart-mcp/scripts/setup-flint-runtime.sh --apply
./skills-visual/flint-chart-mcp/scripts/register-flint-mcp.sh
./skills-visual/flint-chart-mcp/scripts/register-flint-mcp.sh --apply
```

## Verified Scout registry shape

Scout accepted this custom server shape during local testing:

```json
{
  "servers": {
    "flint": {
      "builtin": false,
      "config": {
        "name": "flint",
        "type": "command",
        "command": "node",
        "args": [
          "<path-to-runtime-launcher.mjs>",
          "flint"
        ]
      },
      "tools": []
    }
  }
}
```

Do not add embedded quote characters around Windows paths in `args`. Scout passes `args` directly to the process.

## Diagnostics

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| Flint tools missing after install | Scout has not restarted or registry was not applied. | Restart Scout and inspect `m-mcp-servers.json`. |
| `MODULE_NOT_FOUND` | Runtime dependencies were not installed. | Re-run setup with apply. |
| Path contains escaped quotes | Registration wrote `"\"C:\\...\""` into `args`. | Remove embedded quotes; keep the raw path string. |
| `create_chart_view` returns only a card | Current Scout UI does not embed interactive app views. | Use `render_chart` for visible output. |
| Chart validates false | Invalid chart type, encoding, or theme. | Call `list_chart_types` and `list_themes`, then revise the payload. |

## Safety rules

- Dry-run by default.
- Install locally under `.scout`, never globally.
- Respect the user's configured npm registry unless they supply an explicit one-off override.
- Do not persist the one-off registry in user or global npm configuration.
- Back up the Scout MCP registry before modifying it.
- Do not remove unrelated MCP server entries.
- Do not overwrite user-created skill folders unless the user supplied the force flag through the visual installer.

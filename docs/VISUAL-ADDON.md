# Visual add-on

The visual add-on installs optional Scout skills for chart authoring, Flint MCP runtime setup, chart vocabulary, Big Idea framing, render verification, and print-safe SVG guidance.

It is separate from the core ACT skill package so users can keep the base install free of optional chart-rendering workflows.

## Included skills

| Skill | Purpose |
| --- | --- |
| `flint-chart` | Author and render Flint charts from data, intent, and audience context. |
| `flint-chart-mcp` | Set up, register, and diagnose the optional Flint MCP runtime. |
| `chart-big-idea` | Distill the claim a chart should communicate before rendering. |
| `chart-vocabulary` | Choose chart types and encodings from the analytical task. |
| `render-verify` | Check rendered visual output before delivery. |
| `print-svg-style-guide` | Keep SVG and chart exports readable in docs, PDF, and print. |

## Install the visual skills

Preview on Windows:

```powershell
.\install-visual.ps1
```

Apply on Windows:

```powershell
.\install-visual.ps1 -Apply
```

Preview on macOS/Linux:

```bash
./install-visual.sh
```

Apply on macOS/Linux:

```bash
./install-visual.sh --apply
```

Use `-Force` or `--force` to refresh existing visual skills.

## Install visual skills and Flint MCP together

The visual installers can also run the Flint MCP setup and registration process. They still dry-run by default.

Preview the full visual add-on install on Windows:

```powershell
.\install-visual.ps1 -WithFlintMcp
```

Apply the full visual add-on install on Windows:

```powershell
.\install-visual.ps1 -Apply -WithFlintMcp
```

Preview the full visual add-on install on macOS/Linux:

```bash
./install-visual.sh --with-flint-mcp
```

Apply the full visual add-on install on macOS/Linux:

```bash
./install-visual.sh --apply --with-flint-mcp
```

On the Microsoft network, use the package feed proxy for Flint's npm package:

```powershell
.\install-visual.ps1 -Apply -WithFlintMcp -NpmRegistry 'https://packagefeedproxy.microsoft.io/npm/'
```

```bash
./install-visual.sh --apply --with-flint-mcp --npm-registry 'https://packagefeedproxy.microsoft.io/npm/'
```

This override applies only to the Flint setup command and does not change global npm configuration. Without it, the scripts use the registry returned by `npm config get registry`.

Restart Scout after the MCP registration step.

## Set up Flint rendering manually

If you prefer separate steps, run the Flint runtime setup and registration scripts from the repository or installed skill folder.

Windows:

```powershell
.\skills-visual\flint-chart-mcp\scripts\setup-flint-runtime.ps1 -Apply
.\skills-visual\flint-chart-mcp\scripts\register-flint-mcp.ps1 -Apply
```

On the Microsoft network:

```powershell
.\skills-visual\flint-chart-mcp\scripts\setup-flint-runtime.ps1 -Apply -NpmRegistry 'https://packagefeedproxy.microsoft.io/npm/'
.\skills-visual\flint-chart-mcp\scripts\register-flint-mcp.ps1 -Apply
```

macOS/Linux:

```bash
./skills-visual/flint-chart-mcp/scripts/setup-flint-runtime.sh --apply
./skills-visual/flint-chart-mcp/scripts/register-flint-mcp.sh --apply
```

On the Microsoft network:

```bash
./skills-visual/flint-chart-mcp/scripts/setup-flint-runtime.sh --apply --npm-registry 'https://packagefeedproxy.microsoft.io/npm/'
./skills-visual/flint-chart-mcp/scripts/register-flint-mcp.sh --apply
```

Restart Scout after registration.

## Installer flags for Flint MCP

| Purpose | Windows PowerShell | macOS/Linux |
| --- | --- | --- |
| Install skills, setup runtime, and register MCP | `-WithFlintMcp` | `--with-flint-mcp` |
| Only setup local Flint runtime | `-SetupFlintMcp` | `--setup-flint-mcp` |
| Only register Flint MCP in Scout | `-RegisterFlintMcp` | `--register-flint-mcp` |
| Use a one-off npm registry for runtime setup | `-NpmRegistry <url>` | `--npm-registry URL` |

## Runtime notes

- Flint is installed locally under `.scout/plugin-data/alex-act-scout/flint-runtime`.
- The runtime package is pinned to `flint-chart-mcp@0.5.0`.
- A supplied npm registry applies only to Flint setup and is not persisted to npm configuration.
- The registration scripts back up `m-mcp-servers.json` before applying changes.
- Scout currently displays static `render_chart` output reliably. Interactive `create_chart_view` output may appear as a tool card depending on the UI surface.
- The visual skills also cover mixed-renderer artifacts where Flint supplies theme vocabulary but Chart.js, D3/SVG, Canvas, or HTML tables do the actual rendering. In those cases, route every renderer through shared theme tokens and verify label placement in the browser.

## Quality gate for visual refinement

Before delivering a themed gallery, dashboard, or chart-heavy artifact:

1. Switch between at least two visually different themes.
2. Confirm custom Canvas, SVG, Chart.js, D3, HTML tables, legends, badges, helper text, heatmaps, and KPI cards all follow the active theme.
3. Confirm automatic value labels do not overlap bars, line points, totals, legends, or each other.
4. Confirm there is no horizontal page overflow and no unintended chart-body overflow.
5. Confirm palette changes preserve important interaction state, such as scroll position.
6. Keep only intentional contrast colors, such as white text inside dark marks; replace fixed grays, blues, reds, and greens with semantic theme tokens.

## Samples

See the [live Flint chart gallery](FLINT-CHART-GALLERY.html) for on-demand chart renders across all installed Flint themes.

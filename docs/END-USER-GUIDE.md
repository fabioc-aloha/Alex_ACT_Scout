# Alex ACT Scout end-user guide

Alex ACT Scout installs a curated Core-derived skill set into Microsoft Scout.
It also includes Scout-native shared knowledge capture. Use it when you want Scout to
apply stronger reasoning discipline, debugging process, code-review structure,
documentation hygiene, communication craft, or risk analysis.

## Who this is for

This package is for Scout users who want the Alex ACT Core skill library without installing the original GitHub Copilot plugin. It is especially useful when you want repeatable workflows for:

- debugging and root-cause analysis
- the Alex Finch personality and voice as an invocable Scout skill
- shared knowledge-base capture for lessons, anti-patterns, gotchas, and failure modes
- critical-thinking passes before consequential decisions
- code review, security review, and risk analysis
- planning before implementation
- review-first optimization of selected skills, instructions, prompts, agents, and brain contracts
- privacy-minimizing measurement of structural importance and explicit usefulness outcomes
- end-of-session inventories of explicitly traceable skill use
- approval-first setup of shared evidence and knowledge-base storage on new devices
- read-only package readiness checks at the start of a session
- markdown, Mermaid, and documentation hygiene
- status reports and stakeholder communication
- preserving ACT instruction and prompt workflows as resources beside the skills they complement

The package intentionally excludes source skills that depend on VS Code Copilot-specific tool names or platform behavior.

## Install

### Prerequisites

- Microsoft Scout installed on the tester's device.
- Git installed to clone the package.
- PowerShell on Windows, or Bash on macOS/Linux.

Clone the package and open a shell in its root:

```powershell
git clone https://github.com/fabioc-aloha/Alex_ACT_Scout.git
cd Alex_ACT_Scout
```

Installers run in dry-run mode by default; add `-Apply` or `--apply` to change files.

Preview on Windows PowerShell:

```powershell
cd <repo-root>
.\install.ps1
```

Preview on macOS/Linux:

```bash
cd <repo-root>
./install.sh
```

Apply on Windows PowerShell:

```powershell
.\install.ps1 -Apply
```

Apply on macOS/Linux:

```bash
./install.sh --apply
```

The installer copies every folder under `skills\` into:

```text
%USERPROFILE%\.scout\skills
```

Restart Scout after installation so the skill list refreshes.

### Update an existing install

By default, the installer skips skills that already exist. Use `-Force` to overwrite installed copies:

```powershell
.\install.ps1 -Apply -Force
```

```bash
./install.sh --apply --force
```

Use this after pulling repository updates or regenerating from a newer Alex ACT Core source.

For complete installer behavior, parameters, and troubleshooting, see [INSTALLER.md](INSTALLER.md).

### Install somewhere else

If Scout is configured to load skills from another folder, pass a custom destination:

```powershell
.\install.ps1 -Destination "D:\ScoutSkills" -Apply -Force
```

```bash
./install.sh --destination "$HOME/.scout/skills" --apply --force
```

## Optional visual add-on

The visual add-on makes **Flint** a flagship capability for chart creation and
verification in Scout. It provides chart framing, chart vocabulary, Flint chart
authoring, render verification, print-safe SVG guidance, and the optional Flint
MCP runtime. It installs into the same Scout skills folder as the core package.

Install or refresh the visual skills without the MCP runtime:

```powershell
.\install-visual.ps1 -Apply -Force
```

```bash
./install-visual.sh --apply --force
```

Install the visual skills, local Flint runtime, and Scout MCP registration together:

```powershell
.\install-visual.ps1 -Apply -Force -WithFlintMcp
```

```bash
./install-visual.sh --apply --force --with-flint-mcp
```

On the Microsoft network, route only the Flint package installation through Microsoft's npm package feed proxy:

```powershell
.\install-visual.ps1 -Apply -Force -WithFlintMcp -NpmRegistry 'https://packagefeedproxy.microsoft.io/npm/'
```

```bash
./install-visual.sh --apply --force --with-flint-mcp --npm-registry 'https://packagefeedproxy.microsoft.io/npm/'
```

The registry override is process-scoped to Flint setup. It does not change user or global npm configuration. Restart Scout after installation so both its skill list and MCP tool inventory refresh.

See [VISUAL-ADDON.md](VISUAL-ADDON.md) for separate setup and registration commands, supported flags, runtime details, and visual quality checks.

## How to use the skills

Scout skills are invoked by name or by asking for the capability they describe. Examples:

```text
Use systematic-debugging on this test failure.
```

```text
Run a critical-thinking pass on this architecture choice.
```

```text
Use doc-hygiene and lint-clean-markdown to clean up this README.
```

```text
Use compile-brain to improve .github/skills/release/SKILL.md and show me the draft.
```

```text
Use component-evidence to combine my Brain Compiler assessment with recorded outcomes.
```

```text
Use git-workflow to confirm the correct GitHub CLI account before accessing owner/repository.
```

```text
Use scout-greeting-checkin to check the Alex ACT Scout installation, shared data, Flint, and available releases before we begin.
```

```text
Use scout-shared-data-setup to prepare shared OneDrive storage for meditation and component evidence.
```

```text
Use status-reporting to produce a repository status report.
```

```text
Use scout-knowledge-base to preserve the important lessons from this session.
```

```text
Use meditation to extract reusable lessons before we close this session.
```

For the shared lesson-capture pattern, see [KNOWLEDGE-BASE.md](KNOWLEDGE-BASE.md).

## Flagship skills

These skills are the highest-impact starting points:

| Skill | Why it matters |
| --- | --- |
| `scout-knowledge-base` | Preserves battle-tested lessons before sessions are closed or deleted. |
| `meditation` | Turns important session experience into reusable knowledge-base records and can inventory traceable skill use. |
| `systematic-debugging` | Keeps bug work root-cause-first instead of guess-and-check. |
| `critical-thinking` | Forces alternatives, disconfirmers, evidence quality, and bias checks before consequential decisions. |
| `plan` | Turns larger changes into concrete, verifiable task sequences before implementation. |
| `compile-brain` | Creates reviewable, optimized drafts from one explicitly selected Markdown artifact or user-provided text. |
| `component-evidence` | Combines static importance, meditation usage inventories, and explicit local outcomes while excluding task content and personal data. |
| `scout-shared-data-setup` | Prepares the shared storage required by evidence collection and knowledge capture. |
| `scout-greeting-checkin` | Checks package readiness at session start and offers explicit maintenance actions. |
| `git-workflow` | Previews a matching personal GitHub CLI account before repository operations. |
| `flint-chart` | Creates and refines charts through the optional Flint MCP runtime. |
| `big-idea` | Distills the central claim before summaries, PR titles, ADRs, slide titles, and executive framing. |
| `security-and-hardening` | Adds a safety pass for auth, input handling, storage, integrations, and untrusted data. |
| `doc-hygiene` | Reduces stale docs, wrong counts, dead links, and documentation drift. |
| `alex-finch-personality` | Gives Scout a consistent ACT-aligned stance: concise, skeptical, calibrated, and user-agency preserving. |

## Recommended starting points

| Situation | Skill |
| --- | --- |
| You are unsure why something fails | `systematic-debugging` |
| You want the Alex Finch runtime stance | `alex-finch-personality` |
| You want to preserve reusable lessons from a session | `scout-knowledge-base` |
| You want an end-of-session lesson extraction pass | `meditation` |
| A decision feels important or under-tested | `critical-thinking` |
| You need a skeptical review before shipping | `adversarial-review` or `code-review` deep review mode |
| You are about to implement a non-trivial change | `plan` |
| You want to optimize a selected skill, instruction, prompt, agent, or brain contract | `compile-brain` |
| You want evidence about a component's structural role and recorded usefulness | `component-evidence` |
| You need shared storage for meditation or component evidence on a new device | `scout-shared-data-setup` |
| You are starting a session and want package readiness checked | `scout-greeting-checkin` |
| You need to access a GitHub repository with the correct account | `git-workflow` |
| You want a chart from data | `chart-big-idea`, `chart-vocabulary`, `flint-chart`, and `render-verify` |
| You want safer code around auth, input, storage, or integrations | `security-and-hardening` |
| You need a concise stakeholder update | `status-reporting` |
| You are cleaning up docs | `doc-hygiene` and `lint-clean-markdown` |
| You are creating Mermaid diagrams | `markdown-mermaid` |
| You want the ACT operating rules visible | `act-tenets`; read `resources/instructions/act-pass.instructions.md` for the ACT pass workflow |
| You want orientation to this package | `alex-act-core` |

## Understanding the converted resources

Alex ACT Core started as a GitHub Copilot plugin. Scout does not use the same always-on instruction and slash-command model, but Scout skills can include supporting files inside each skill folder. This package keeps the main skill surface small and attaches complementary source artifacts to the skill they support:

| Source artifact | Scout placement |
| --- | --- |
| Native skill, such as `systematic-debugging` | Top-level Scout skill folder |
| Former GitHub Copilot instruction | `resources/instructions/` inside the related skill |
| Former GitHub Copilot slash-command prompt | `resources/prompts/` inside the related skill |
| Resource index | `resources/RESOURCE-INDEX.md` inside each resource-backed skill |

Converted instructions do not become always-on automatically. Read them as supporting context from the related skill folder, or copy the body into Scout's standing instruction mechanism if you want persistent behavior.

## Skill groups

### Reasoning and decision quality

- `alex-finch-personality`
- `act-tenets`
- `critical-thinking`
- `adversarial-review`
- `problem-framing-audit`
- `risk-analysis`
- `anti-hallucination`
- `ethical-reasoning`

### Engineering workflow

- `systematic-debugging`
- `test-driven-development`
- `code-review`
- `security-and-hardening`
- `mutation-testing`
- `git-workflow`
- `spike`
- `plan`

### Documentation and communication

- `doc-hygiene`
- `lint-clean-markdown`
- `markdown-mermaid`
- `communication-craft`
- `status-reporting`
- `big-idea`
- `humanizer`

### Platform and tool-building

- `mcp-builder`
- `markdown-sanitization-chain`

### ACT maintenance and knowledge capture

- `compile-brain`
- `component-evidence`
- `scout-shared-data-setup`
- `meditation`
- `scout-knowledge-base`
- related `resources/instructions/` files
- related `resources/prompts/` files

## What to expect from Scout

When a skill is relevant, Scout should load the skill instructions and apply the workflow. Some skills are process-heavy by design. For example, `systematic-debugging` should investigate before changing code, and `critical-thinking` should surface alternatives and disconfirmers instead of immediately agreeing with the first framing.

Use more specific skill names when you want deterministic behavior. Use broad descriptions when you want Scout to choose.

## Troubleshooting

### Skills do not appear

1. Confirm the install location exists:

   ```powershell
   Get-ChildItem "$env:USERPROFILE\.scout\skills"
   ```

2. Confirm Alex ACT Scout skill folders are present:

   ```powershell
   Get-ChildItem "$env:USERPROFILE\.scout\skills\systematic-debugging"
   ```

3. Restart Scout.

### A skill was not updated

Run:

```powershell
.\install.ps1 -Apply -Force
```

Then restart Scout.

### Flint MCP tools do not appear

1. Confirm the Flint server is registered:

   ```powershell
   (Get-Content "$env:USERPROFILE\.scout\m-mcp-servers.json" -Raw | ConvertFrom-Json).servers.flint
   ```

2. If setup failed with `ERR_SSL_SSL/TLS_ALERT_HANDSHAKE_FAILURE` on the Microsoft network, rerun the visual installer with `-NpmRegistry 'https://packagefeedproxy.microsoft.io/npm/'` or `--npm-registry 'https://packagefeedproxy.microsoft.io/npm/'`.
3. Restart Scout so its MCP tool inventory refreshes.

### A converted instruction is not always active

That is expected. Scout custom skills are invoked skills, not always-on Copilot repository instructions. Read the relevant file from `resources/instructions/` inside the related skill, or promote its body into Scout's persistent instruction configuration.

### You are unsure which skill to use

Ask Scout:

```text
Use alex-act-core to help me pick the right Alex ACT skill for this task.
```

You can also search `scout-skills.json` for keywords.

## Uninstall

Remove the installed skill folders from:

```text
%USERPROFILE%\.scout\skills
```

For example:

```powershell
Remove-Item -Recurse -Force "$env:USERPROFILE\.scout\skills\systematic-debugging"
```

Restart Scout after removing skills.

## Support files

- `scout-skills.json` is the generated catalog of skill names, descriptions, and paths.
- `scout-skills-visual.json` is the catalog for the optional visual add-on.
- `docs\CONVERSION-GUIDE.md` explains the criteria and process used to convert Alex ACT Core and similar Copilot plugin packages into Scout skills.
- `docs\ALEX-FINCH.md` preserves the Alex Finch source reference.

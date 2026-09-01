# Converting Copilot plugins into Scout skills

This guide defines the criteria and process used to convert Alex ACT Core into Alex ACT Scout. Use the same process for similar GitHub Copilot plugin-style repositories.

## Goal

Produce a Scout package that is useful as native Scout skills, not merely a file copy of a Copilot plugin. The converted package should:

- expose only skills that can work in Scout's runtime
- preserve complementary prompts, instructions, examples, and references as supporting resources
- remove or document plugin-host-specific behavior
- install cleanly into `%USERPROFILE%\.scout\skills`
- leave enough provenance for future refreshes from the source plugin

Use placeholders for machine-specific values in committed documentation:

| Placeholder | Meaning |
| --- | --- |
| `<repo-root>` | The current checkout of the Scout package. |
| `<source-repo-root>` | A local checkout of the source plugin, if used for regeneration. |
| `OWNER` | The GitHub owner or organization that hosts the source repository. |
| `<shared-sync-root>` | A user-selected shared folder for knowledge-base records. |
| `<instance-id>` / `<peer-id>` | User-selected Scout routing identifiers. |

## Scout-compatible skill shape

A Scout skill is a folder with a `SKILL.md` file:

```text
skills/
  skill-name/
    SKILL.md
    resources/
      RESOURCE-INDEX.md
      instructions/
      prompts/
      references/
      examples/
```

`SKILL.md` must start with frontmatter containing at least:

```yaml
---
name: skill-name
description: Short routing description for Scout
---
```

Supporting files can live inside the same skill folder. Scout can read those files when the skill instructions point to them.

## Conversion criteria

### Keep as a top-level Scout skill

Keep a source skill when all of these are true:

1. It describes a reusable workflow or capability, not only a host command.
2. It can be executed using Scout's available tools or general reasoning.
3. Its `description` is useful for routing user requests.
4. Any source-specific references are incidental, optional, or can be preserved as context.

Examples from this package:

- `systematic-debugging`
- `critical-thinking`
- `code-review`
- `doc-hygiene`
- `markdown-mermaid`
- `security-and-hardening`

### Attach as a resource

Attach a source prompt or instruction to a related skill when it complements a skill but should not appear as a separate user-facing Scout skill.

Use `resources/instructions/` for former always-on instruction files.

Use `resources/prompts/` for former slash-command prompt files.

Create or update `resources/RESOURCE-INDEX.md` for every resource-backed skill so users and maintainers can see what context was attached.

Examples from this package:

| Source artifact | Scout placement |
| --- | --- |
| `critical-thinking.instructions.md` | `skills/critical-thinking/resources/instructions/` |
| `critical-thinking.prompt.md` | `skills/critical-thinking/resources/prompts/` |
| `status.prompt.md` | `skills/status-reporting/resources/prompts/` |
| `act-pass.instructions.md` | `skills/act-tenets/resources/instructions/` |

### Omit from the Scout package

Remove a source skill, prompt, or instruction when its value depends on a non-Scout host.

Omit items that require:

- VS Code Copilot tool names such as `open_browser_page`, `screenshot_page`, `click_element`, `navigate_page`, or `run_playwright_code`
- Copilot plugin lifecycle commands such as `copilot plugin install`, `copilot plugin list`, or marketplace management as the main action
- `.github/agents` worker definitions that are not shipped with the Scout package
- VS Code setting keys as the primary behavior
- host-specific slash-command routing that has no Scout equivalent

Examples omitted from this package:

- `browser-tools`
- `platform-awareness`
- `configure-vscode.prompt.md`
- `configure-vscode-verify.prompt.md`

### Link source provenance

Keep Scout-relevant source references under `docs/` only when they help users understand the converted package. Do not copy large source changelogs, Copilot plugin install guides, or raw manifests unless they are needed for Scout maintenance. Prefer links to the source repository for source-project history and metadata.

## Mapping process

1. Inventory the source repository:

   ```powershell
   Get-ChildItem .github\skills
   Get-ChildItem .github\instructions
   Get-ChildItem .github\prompts
   ```

2. Classify each source skill:

   | Decision | Destination |
   | --- | --- |
   | Keep | `skills/<skill-name>/SKILL.md` |
   | Keep with source context | `skills/<skill-name>/SKILL.md` plus `resources/` |
   | Omit | Document reason in README or conversion notes |

3. Map source instructions and prompts to related skills. Prefer semantic fit over filename similarity. For example, an emotional-intelligence instruction belongs with `communication-craft`, while a terminal-safety instruction belongs with `systematic-debugging`.

4. Copy supporting files into the selected skill folder:

   ```text
   resources/instructions/<source-name>.instructions.md
   resources/prompts/<source-name>.prompt.md
   resources/references/<source-file>
   resources/examples/<source-file>
   ```

5. Add a `resources/RESOURCE-INDEX.md` file for each resource-backed skill.

6. Update `SKILL.md` with a short "Complementary Scout resources" section pointing to `resources/RESOURCE-INDEX.md`.

7. Generate or refresh `scout-skills.json` from the actual top-level skill folders. Do not include resource-only files as top-level skills.

8. Update the installer:

   - copy all folders under `skills/`
   - run in dry-run mode by default
   - require an explicit apply flag before changing files
   - skip existing skills unless the force flag is passed
   - remove stale converted prompt/instruction skills if the package shape changed
   - remove omitted host-specific skills from previous installs
   - replace skill folders on force, not merge into them
   - reject empty or filesystem-root destinations

9. Update user documentation:

   - explain install and update commands
   - list the public skill surface
   - explain resource-backed prompts and instructions
   - name omitted host-specific skills and why they were omitted

10. Validate the result.

## Validation checklist

Run these checks before committing:

```powershell
# Every top-level skill has SKILL.md.
Get-ChildItem .\skills -Directory |
  Where-Object { -not (Test-Path (Join-Path $_.FullName 'SKILL.md')) }

# Catalog count matches top-level skill folders.
$skillCount = (Get-ChildItem .\skills -Directory).Count
$catalogCount = (Get-Content .\scout-skills.json -Raw | ConvertFrom-Json).Count
"skills=$skillCount catalog=$catalogCount"

# Installer dry run. This must not create the destination.
$temp = Join-Path $env:TEMP ('scout-skills-' + [guid]::NewGuid())
.\install.ps1 -Destination $temp
Test-Path $temp

# Installer apply into a temporary destination.
$temp = Join-Path $env:TEMP ('scout-skills-' + [guid]::NewGuid())
.\install.ps1 -Destination $temp -Apply
Get-ChildItem $temp -Directory
Remove-Item -Recurse -Force $temp

# Force must replace folders, not merge into them.
$temp = Join-Path $env:TEMP ('scout-skills-' + [guid]::NewGuid())
.\install.ps1 -Destination $temp -Apply
Set-Content (Join-Path $temp 'act-tenets\STALE.txt') 'stale'
.\install.ps1 -Destination $temp -Apply -Force
Test-Path (Join-Path $temp 'act-tenets\STALE.txt')
Remove-Item -Recurse -Force $temp

# Git whitespace check.
git diff --check
```

Also inspect the converted package for host-specific terms:

```powershell
rg "VS Code|vscode|open_browser_page|screenshot_page|click_element|navigate_page|run_playwright_code|copilot plugin" skills docs README.md
```

Some references may remain in preserved source artifacts. Top-level skills should not depend on those terms for core behavior unless the package explicitly documents a Scout equivalent.

Also scan for actual scripts under `skills/`:

```powershell
Get-ChildItem .\skills -Recurse -File |
  Where-Object { $_.FullName -match '\\scripts\\|\.(ps1|sh|cmd|bat|py|js|cjs|mjs|ts|tsx)$' }
```

If scripts exist inside skills, review them as code:

- no hardcoded user paths
- no Copilot config paths such as `~/.copilot`
- no assumptions about Windows-only path separators unless the skill is Windows-only
- no destructive operations without explicit apply/confirm semantics
- no dependency on GNU-only shell flags if the script claims macOS support
- no merge-style update that can leave stale files behind

## Gotchas from this conversion

### Resource files can still be host-specific

Moving prompts and instructions into `resources/` is better than exposing them as top-level skills, but resources can still contain non-Scout behavior. We removed resource files that referenced Copilot plugin lifecycle commands, `~/.copilot`, or Copilot bootstrap drift checks because a Scout user could otherwise follow stale host-specific guidance.

Rule: after moving resources, scan the resource folders too. Do not stop at top-level `SKILL.md`.

### Scripts in skills need the same audit as root installers

This package ships executable helpers under `component-evidence`,
`scout-knowledge-base`, and `flint-chart-mcp`. They are part of the package
contract and require code review, dry-run or explicit-apply behavior for
mutations, and focused regression coverage. Do not assume skill folders are
documentation-only.

### Dry-run by default prevents accidental installs

Installers should preview by default and require explicit apply flags:

| Platform | Apply flag |
| --- | --- |
| Windows PowerShell | `-Apply` |
| macOS/Linux | `--apply` |

This protects users from copying or deleting skill folders just by running a downloaded script.

### Force must replace, not merge

The first PowerShell installer used `Copy-Item -Recurse -Force` into an existing folder. That overwrites matching files but leaves removed files behind. The fixed behavior removes the target skill folder first, then copies the current folder. This matches the shell installer and prevents stale resources from surviving package reshapes.

### Root destinations must be rejected

Both installers reject empty destinations and filesystem roots. This prevents cleanup logic from ever running against a dangerous path.

### macOS support means avoiding GNU-only flags

The shell installer avoids GNU-only options such as `sort -z`. A plain Bash glob over `skills/*` is portable enough for macOS and Linux.

### Executable bit matters

Track `install.sh` as executable in git:

```powershell
git update-index --chmod=+x install.sh
```

Verify with:

```powershell
git ls-files --stage install.sh
```

The mode should start with `100755`.

### SVG image references may not render everywhere

An SVG that references a sibling PNG with `href="scout.png"` can fail in README renderers. Embedding the PNG as a data URI inside the SVG made the banner self-contained.

### Do not hardcode maintainer paths

Replace machine-specific paths and IDs with placeholders:

| Do not commit | Prefer |
| --- | --- |
| `C:\Users\<name>\...` | `%USERPROFILE%\...` or `<shared-sync-root>` |
| local repo paths | `<repo-root>` or `<source-repo-root>` |
| maintainer Scout IDs | `SCOUT-A`, `SCOUT-B`, `<instance-id>` |
| personal GitHub owner in generic docs | `OWNER` |

### Count drift is easy

Whenever skills or resources are added/removed, update all visible counts:

- README package table
- banner text
- `scout-skills.json`
- end-user guide
- conversion guide current mapping
- installer expected output if the top-level skill count changes

### Source docs are not product docs

Large copied source artifacts like plugin manifests, source install docs, and changelogs made the Scout package noisier. We removed them and kept only Scout-relevant docs plus source links.

### Scout-native additions are allowed

Not every useful skill must come from the source plugin. Adopted skills must be
compatible with Scout and documented as separately maintained package content.

## Current Alex ACT Scout mapping

This package currently exposes 30 top-level Scout skills: 27 core workflow
skills, the package orientation skill, and the adopted `compile-brain` and
`component-evidence` skills. Two Core source skills were removed because they
are VS Code-specific:

| Omitted source skill | Reason |
| --- | --- |
| `browser-tools` | Depends on VS Code Copilot browser tool names rather than Scout browser tools. |
| `platform-awareness` | Primarily describes VS Code Copilot platform behavior and settings. |

Former Copilot prompts and instructions are attached as resources to the related skill where they add context and remain Scout-compatible. For example:

| Related skill | Attached resources |
| --- | --- |
| `act-tenets` | ACT pass and system-prompt skepticism instructions |
| `critical-thinking` | critical-thinking instruction, epistemic calibration instruction, critical-thinking prompt |
| `status-reporting` | status, note, and save-session-note prompts |
| `systematic-debugging` | terminal command safety instruction |
| `alex-act-core` | package-level personality, lint discipline, and proactive awareness instructions |

Alex Finch personality is also promoted to a top-level Scout skill because Scout's exposed personality selector has fixed presets. The top-level skill makes the personality available to Scout users without pretending it is a native Scout personality preset.


The shared knowledge-base and meditation skills are also Scout-native additions. The knowledge-base skill defines durable storage; meditation is the end-of-session capture workflow that extracts reusable lessons, anti-patterns, gotchas, and failure modes into that store.

`deep-review` was folded into `code-review` as a high-stakes review mode to avoid duplicate review routing. `token-waste-elimination` was removed because it was a meta brain-maintenance skill with low user-facing value in Scout.

## Maintenance rules

- Keep the public skill surface small and task-oriented.
- Prefer resource-backed context over top-level prompt/instruction skills.
- Do not ship skills whose main behavior depends on a missing host.
- Preserve source provenance through links and small Scout-relevant references; avoid copying source-only docs into the Scout package.
- Update `scout-skills.json`, README, and end-user docs together whenever the top-level skill set changes.

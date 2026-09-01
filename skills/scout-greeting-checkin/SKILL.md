---
name: scout-greeting-checkin
description: "Run a read-only Alex ACT Scout session-start check when the user opens with hello, hi, or a greeting. Verify package setup, shared data, Flint, and available package releases, then offer explicit maintenance actions."
---

# Scout Greeting Check-In

Use this skill when a user begins a new session with a greeting such as "hello,"
"hi," or "good morning." It is the session-opening companion to `meditation`.

## Scope

Run a short, read-only health check for Alex ACT Scout-owned state:

- installed core and visual skill folders;
- shared component-evidence and knowledge-base readiness;
- Flint MCP registration and launcher presence; and
- available tagged releases from the configured public release repository.

Do not inspect, change, or report on unrelated Scout skills, MCP servers,
repositories, accounts, or user files.

## Run

The installed skill carries its package manifest, so no repository checkout is
required:

```text
node <this-skill>/scripts/scout-greeting-checkin.cjs status
```

For a local development checkout, compare against its current catalogs:

```text
node <this-skill>/scripts/scout-greeting-checkin.cjs status --package-root <absolute-path>
```

The command is read-only. It does not install skills, modify shared storage,
switch GitHub accounts, update Git references, or alter the MCP registry.

## Response

Report only actionable deviations:

| Finding | Offer |
| --- | --- |
| Core or visual skills missing | Preview the relevant package installer. |
| Shared data missing or incomplete | Use `scout-shared-data-setup` to preview a user-selected synchronized root. |
| Flint absent or launcher missing | Preview `install-visual` with the Flint MCP option. |
| New tagged release available | Offer to review and install the release; do not install automatically. |
| Remote check unavailable | State that version availability could not be checked and continue. |

When all checks are healthy, respond briefly and proceed with the user's actual
request. Do not turn every greeting into a maintenance conversation.

## Boundaries

- Greeting detection starts a read-only check, not automatic maintenance.
- Ask before every write, installation, registry update, or account switch.
- A missing optional visual install is a finding, not an error.
- Do not create a shared-data fallback path. Use
  [`scout-shared-data-setup`](../scout-shared-data-setup/SKILL.md) only with an
  explicit user-selected synchronized root.
- Do not let the check block productive work. Surface the deviation once, then
  proceed unless the user requests the repair.

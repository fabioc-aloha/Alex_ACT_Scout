---
name: meditation
description: >-
  End-of-session consolidation workflow that extracts reusable lessons, anti-patterns, gotchas,
  failure modes, and decisions into the shared Scout knowledge base.
---

# Meditation

Use this skill near the end of a meaningful session, before closing, compacting, deleting, or moving on from work that produced reusable learning.

Meditation is the capture workflow. `scout-knowledge-base` is the storage pattern. Together, they preserve battle-tested lessons so future Scout sessions and peer Scout instances do not have to relearn the same failure modes.

## Goal

Extract durable knowledge from the session:

- what failed
- what surprised us
- what fixed the issue
- what anti-pattern should be avoided
- what decision should persist
- what procedure is now battle-tested
- what should be checked proactively next time

Do not preserve raw transcript or private source content.

## When to use

- The session involved a real bug, failed assumption, or near miss.
- A workflow was improved through iteration.
- A cross-platform, installer, rendering, privacy, or conversion gotcha was discovered.
- A decision changed because evidence contradicted the first plan.
- The user is about to delete or close a session that contains reusable learning.
- Another Scout instance would benefit from the lesson.

## When not to use

- Nothing reusable was learned.
- The only output is routine task completion.
- The lesson depends on private data that cannot be safely summarized.
- The lesson is still speculative or unverified.

## Process

1. Identify candidate lessons.
2. Filter out raw private data, secrets, personal details, and transcript-like content.
3. Keep only lessons that are reusable, specific, verified, safe, and searchable.
4. Choose the right knowledge-base category:
   - `decisions`
   - `failure-modes`
   - `anti-patterns`
   - `procedures`
   - `gotchas`
5. Inventory the unique Alex ACT Scout skills explicitly traceable to this
   session. Do not infer use from installed skills, incidental references, or
   available tools; do not inventory similarly named skills from another
   package.
6. Use only the configured component-evidence ledger. If it is not configured,
   use [`scout-shared-data-setup`](../scout-shared-data-setup/SKILL.md) to
   preview a user-selected synchronized root. Do not create or suggest an
   inferred local fallback. Confirm each candidate appears in the configured
   `assessment.json`, preview the exact component names, and apply only after
   the user explicitly approves. The ledger records no task content, transcript,
   session ID, paths, or personal data.
7. Draft one Markdown record per lesson using the `scout-knowledge-base` template.
8. Add or update the shared `knowledge-base\index.md`.

Use the `component-evidence` inventory command:

```text
node <component-evidence>/scripts/component-evidence.cjs inventory --components <skill-name,skill-name>
node <component-evidence>/scripts/component-evidence.cjs inventory --components <skill-name,skill-name> --apply
```

## Session Compaction

After all approved inventory and knowledge-base work is complete, ask whether
the user wants to compact the current session. Explain that compaction reduces
conversation context while preserving the durable lessons already captured.

Do not compact automatically. Only call the host session-compaction capability
after the user explicitly approves. If the user declines, finish meditation
without further action.

## Output format

When reporting to the user, keep it concise:

```text
Captured 2 knowledge-base records:

1. gotchas/svg-data-uri-rendering.md — SVG sibling PNG references can fail in README renderers; embed as data URI.
2. procedures/dry-run-installers.md — Installers should preview by default and require explicit apply flags.
```

If no record is warranted:

```text
No knowledge-base record created: this session did not produce a reusable, verified, privacy-safe lesson.
```

## Quality gate

Before writing a record, answer:

| Gate | Question |
| --- | --- |
| Reusable | Would this help a future task? |
| Specific | Does it name a signal and response? |
| Verified | Did we observe evidence? |
| Safe | Is private data removed? |
| Searchable | Does it have useful title, category, and tags? |

If any answer is no, do not write the record yet.

## Relationship to other skills

| Skill | Relationship |
| --- | --- |
| `scout-knowledge-base` | Defines the folder structure, record template, and consult workflow. |
| `doc-hygiene` | Helps keep knowledge-base records concise, current, and non-drifting. |
| `critical-thinking` | Helps decide whether a supposed lesson is actually supported by evidence. |
| `component-evidence` | Records a privacy-minimizing inventory of explicitly traceable skill use. |

---
name: scout-shared-data-setup
description: "Prepare a user-selected synchronized folder for Alex ACT Scout component evidence and shared knowledge-base records. Use when meditation, component-evidence, or scout-knowledge-base needs its OneDrive-backed infrastructure configured."
---

# Scout Shared Data Setup

Prepare the shared storage required by `component-evidence`, `meditation`, and
`scout-knowledge-base` without inventing a local fallback location.

## When To Use

Use this skill when:

- `component-evidence` is not configured on the current device;
- `meditation` cannot record approved skill use because its ledger is missing;
- `scout-knowledge-base` has no initialized shared root; or
- a new device needs to join the existing synchronized data location.

## Boundaries

- Ask the user for an explicit synchronized root. Do not guess OneDrive,
  SharePoint, or any other cloud path.
- Preview before creating folders or writing the local configuration.
- This setup creates only the evidence ledger and knowledge-base structure.
- It does not create usage events, usefulness outcomes, knowledge records, or
  a Brain Compiler assessment.
- The local configuration contains only the chosen evidence-root path.

## Commands

Use the same shared root on every device, expressed through that device's local
sync path:

```text
node <this-skill>/scripts/scout-shared-data-setup.cjs status --shared-root <absolute-synchronized-root>
node <this-skill>/scripts/scout-shared-data-setup.cjs bootstrap --shared-root <absolute-synchronized-root>
node <this-skill>/scripts/scout-shared-data-setup.cjs bootstrap --shared-root <absolute-synchronized-root> --apply
```

The bootstrap command:

1. Configures `component-evidence` for
   `<shared-root>/component-evidence-data`.
2. Creates `component-evidence/events.ndjson`.
3. Creates the shared `<shared-root>/knowledge-base` folders and `index.md`.
4. Reports whether `<shared-root>/component-evidence-data/assessment.json`
   exists.

Generate a missing assessment separately with Alex ACT Brain Compiler before
recording meditation usage. Setup does not run external analyzers or invent
structural-importance data.

## Meditation Handoff

When `meditation` detects missing shared infrastructure:

1. Explain that usage capture is unavailable until a synchronized root is
   configured.
2. Use this skill to preview the requested root.
3. Show the exact folders and local configuration that would be created.
4. Obtain approval before running `bootstrap --apply`.
5. Resume meditation after an assessment is available.

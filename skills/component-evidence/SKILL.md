---
name: component-evidence
description: "Measure package components with transparent static importance from Brain Compiler and opt-in local usefulness outcomes. Use when recording whether an installed skill helped, or when combining those records with a Brain Compiler assessment."
---

# Component Evidence

Measure the package without pretending that installation or static structure
proves usefulness. Combine two separate evidence sources:

1. A read-only Alex ACT Brain Compiler assessment provides structural importance
   for each skill.
2. An explicit local meditation inventory captures traceable skill use.
3. An explicit local outcome record captures whether a component helped a task.

## Boundaries

- Inventory only skills explicitly traceable to the session and present in the
  configured static assessment. Do not infer usage from installation, filenames,
  incidental prose, or skills from another package.
- Record an outcome only when the user explicitly provides it.
- Store only a component identifier, event type or outcome, and timestamp. Do
  not store task text, prompts, source bodies, paths, identities, session IDs,
  or other private content.
- Static importance is a structural proxy, not semantic meaning, host discovery,
  invocation telemetry, or proof of usefulness.
- A hybrid score is unavailable until both static and outcome evidence exist.

## Static Assessment

Run Brain Compiler's assessor against the package or another target. It does not
change the target:

```powershell
node <brain-compiler>\scripts\assess-brain.cjs --root <target-root> --out <outside-target>\assessment.json
```

For each skill, `skillImportance` reports a score out of 60 with its raw
signals:

| Signal | Maximum contribution | Meaning |
| --- | ---: | --- |
| Inbound Markdown routes | 40 | Other assessed artifacts explicitly route to the skill. |
| Outbound Markdown routes | 10 | The skill explicitly composes with other artifacts. |
| Bundled resources | 5 | The skill has directly nested supporting Markdown resources. |
| Unique normalized body | 5 | The body is not duplicated by another skill, prompt, or agent. |

Treat these signals as an explainable integration measure. A low score can mean
the skill is intentionally independent, not unimportant.

## Configure The Shared Ledger

Configure the shared evidence root once on each device. The configuration is
local to the device; point it to that device's synchronized view of the same
OneDrive folder:

```text
node <this-skill>/scripts/component-evidence.cjs configure --evidence-root <absolute-onedrive-path>
node <this-skill>/scripts/component-evidence.cjs configure --evidence-root <absolute-onedrive-path> --apply
```

Applied configuration is stored at `~/.scout/component-evidence.json`. It
contains only the selected evidence-root path. Later commands use this
configured location when `--evidence-root` is omitted and fail rather than
creating an inferred local ledger.

## Local Outcome Ledger

After configuration, bootstrap the ledger once:

```text
node <this-skill>/scripts/component-evidence.cjs bootstrap
node <this-skill>/scripts/component-evidence.cjs bootstrap --apply
```

Record only an explicit user outcome:

```text
node <this-skill>/scripts/component-evidence.cjs record --component <skill-name> --outcome <helped|neutral|not-helpful>
node <this-skill>/scripts/component-evidence.cjs record --component <skill-name> --outcome helped --apply
```

Every mutation previews by default. Applied records are newline-delimited JSON
at `<evidence-root>/component-evidence/events.ndjson`.

## Meditation Inventory

At meditation, inventory each unique skill explicitly traceable to the current
session and present in the configured `assessment.json`. Do not list a skill
merely because it was installed, mentioned, available, or supplied by another
package. Preview the exact component names, then apply only after explicit
approval:

```text
node <this-skill>/scripts/component-evidence.cjs inventory --components <skill-name,skill-name>
node <this-skill>/scripts/component-evidence.cjs inventory --components <skill-name,skill-name> --apply
```

The command deduplicates names within one inventory pass. It records `used`
events separately from outcomes; an inventory establishes usage evidence, not
usefulness evidence.

## Hybrid Report

Combine the static assessment and local outcome ledger:

```text
node <this-skill>/scripts/component-evidence.cjs report
```

Each component reports:

- `staticImportance`: the Brain Compiler score and raw signals;
- `usage`: recorded meditation inventories and the latest use timestamp;
- `usefulness`: outcome counts, a smoothed 0-100 score, confidence based on
  record count, and the latest outcome timestamp; and
- `hybridScore`: 40% structural importance and 60% usefulness, only when both
  inputs exist.

The usefulness score applies a neutral prior so a single outcome cannot produce
a misleading 0 or 100. Confidence is `low` for 1-4 outcomes, `medium` for
5-14, and `high` for 15 or more. Use the raw counts with the score.

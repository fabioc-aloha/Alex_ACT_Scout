# Changelog

All notable changes to Alex ACT Scout are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [2.0.5] - 2026-09-01

### Changed

- Rebuilt `markdown-mermaid` around claim-led, raw Mermaid or custom SVG
  diagrams and document-drift detection. Removed its stylesheet and
  styling-focused reference payload.

## [2.0.4] - 2026-09-01

### Changed

- Applied conservative, behavior-preserving first-pass compilation to 12
  high-priority skills. An independent semantic review and package-layout
  validation found no behavioral losses; the pass reduced estimated token
  volume by 1.9%.

## [2.0.3] - 2026-09-01

### Added

- Added `scout-greeting-checkin`, a read-only session-start companion to
  meditation that checks package setup, shared data, Flint, and available
  releases before offering explicit maintenance actions.
- Added `scout-shared-data-setup`, an approval-first bootstrap for a
  user-selected synchronized evidence ledger and shared knowledge base.

### Changed

- Added preview-first GitHub CLI account routing to `git-workflow`. Personal
  repository owners are matched to configured account names; organization-owned
  repositories require explicit account selection.
- Added non-blocking shared knowledge consultation gates to decision, planning,
  investigation, review, security, MCP, reporting, and visual-analysis
  workflows.

## [2.0.2] - 2026-08-31

### Changed

- Archived superseded planning, refinement, and source-candidate assessments
  outside the tracked package documentation.
- Clarified the conversion guide's executable skill-helper contract and aligned
  tester-feedback review windows across affected skills.

## [2.0.1] - 2026-08-31

### Fixed

- Replaced stale Copilot slash-command and automatic-resource-loading guidance
  with Scout-native skill requests and supporting-resource descriptions.
- Reset review windows to the v2.0.0 tester-feedback period.
- Silenced expected child-process errors in the component-evidence regression
  test output.

## [2.0.0] - 2026-08-31

### Added

- Added per-device configuration for the shared component-evidence root. The
  meditation protocol now rejects inferred local ledgers and skills outside the
  configured package assessment.
- Added a meditation-compatible component-usage inventory. It records each
  unique, explicitly traceable skill separately from usefulness outcomes.
- Added `component-evidence`, which combines Brain Compiler's static
  importance report with explicit, privacy-minimizing local outcome records.
- Added the `compile-brain` Scout skill, adapted from Alex ACT Brain Compiler.
  It produces reviewable, optimized drafts for one explicitly selected
  instruction, skill, prompt, agent, or brain contract before any write.

### Removed

- Removed the unused `scout-message-bus` and
  `scout-message-bus-heartbeat` skills, including their documentation and
  regression coverage. The core installers now clean up their folders from
  existing installs.

## [1.0.0] - 2026-08-15

### Added

- Added correlated `send-task` and `send-result` message-bus commands. Task
	requests declare a task kind and stable correlation ID; non-read-only work
	requires an approval ID, and Scout returns completed, refused, or failed
	results without treating a request as authority.
- Added deterministic, preview-first Scout continuity scripts for message-bus
	bootstrap/status/send/process/dead-letter and shared knowledge-base
	bootstrap/status/validate/deposit. Tests cover real disposable shared roots
	and verify the Scout installer preserves the scripts.
- Added `-NpmRegistry` and `--npm-registry` options to the visual installers and Flint runtime setup scripts. These options route only the Flint package installation through a selected npm registry without changing user or global npm configuration.
- Added Microsoft package feed examples using `https://packagefeedproxy.microsoft.io/npm/` to the root README, end-user guide, installer reference, visual add-on guide, and Flint MCP skill.
- Added a PowerShell regression suite for registry forwarding and failed npm updates when an older Flint CLI remains installed.
- Added end-user guidance for installing, refreshing, registering, and troubleshooting the optional visual skills and Flint MCP runtime.

### Changed

- Updated the Windows and Unix Flint setup scripts to pass the selected or configured npm registry explicitly to `npm install`.
- Expanded the documentation index and visual add-on reference with separate wrapper and manual setup paths.
- Redirected converted skill and prompt links from removed source-plugin paths to their packaged `resources/instructions` and `resources/prompts` locations.

### Fixed

- Fixed the Windows Flint setup script so a failed `npm install` stops setup immediately instead of reporting success when a stale CLI file already exists.
- Fixed broken local links in ACT tenets, anti-hallucination, Big Idea, communication craft, critical thinking, ethical reasoning, and problem-framing skill resources.

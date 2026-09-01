---
name: alex-act-core
description: >-
  Alex ACT Core for Microsoft Scout. Use to orient yourself to the converted ACT skill set, Scout
  install layout, and where the original skills, instructions, prompts, and references live.
---

# Alex ACT Core for Scout

This repository converts Alex ACT Core into Scout's skill-folder format and
adopts selected compatible capabilities. It includes:

- 29 native skill folders copied from `.github/skills`.
- 3 independently adopted skills: `compile-brain`, `component-evidence`, and
  `scout-shared-data-setup`.
- 1 package orientation skill named `alex-act-core`.
- 14 instruction files attached as supporting resources under related skills.
- 5 prompt files attached as supporting resources under related skills.

Scout loads skills from folders containing `SKILL.md` with frontmatter. Install this package by copying the folders under `skills/` into `%USERPROFILE%\.scout\skills`, or run `install.ps1` from the repository root.

The original Alex Finch identity reference is preserved in `docs/ALEX-FINCH.md`. For resource-backed skills, read `resources/RESOURCE-INDEX.md` to find the attached source prompts and instructions.

## Complementary Scout resources

This Scout skill includes original Alex ACT Core prompts and/or instructions as supporting files. Read resources/RESOURCE-INDEX.md when you need the source prompt workflow or always-on instruction context that complemented this skill in the GitHub Copilot implementation.

- resources/instructions/alex-finch-personality.instructions.md
- resources/instructions/lint-discipline.instructions.md
- resources/instructions/proactive-awareness.instructions.md

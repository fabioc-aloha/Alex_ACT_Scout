---
name: status-reporting
description: >-
  Create stakeholder-friendly project status updates and progress reports. Use when writing a
  status update, progress report, weekly or milestone recap, release summary, or any
  stakeholder-facing account of where work stands.
---

# Status Reporting Skill

Generate clear, audience-appropriate project status updates that translate
technical progress into stakeholder-friendly communication.

Status reports serve different audiences with different needs:

- **Executives**: Impact, risk, timeline
- **Managers**: Progress, blockers, resources
- **Teams**: Details, dependencies, next steps
- **Customers**: Value delivered, what's coming

## Shared Knowledge Gate

Before preparing a consequential stakeholder report containing risks,
commitments, or decisions, consult
[`scout-knowledge-base`](../scout-knowledge-base/SKILL.md) for relevant prior
decisions, failure modes, procedures, and gotchas. Read only records whose
signals or preconditions match the report, and treat them as context rather than
authority. If unavailable, state that once and continue with current evidence;
do not create a local fallback while reporting.

## Report Templates

### Executive Summary (30 seconds)

```markdown
## Project Status: [Project Name]
**Date**: [Date] | **Status**: 🟢 On Track / 🟡 At Risk / 🔴 Blocked

### One-Line Summary
[Single sentence: what happened and what it means]

### Key Metrics
| Metric | Current | Target | Trend |
|--------|---------|--------|-------|
| [Metric 1] | [Value] | [Goal] | ↑/↓/→ |
| [Metric 2] | [Value] | [Goal] | ↑/↓/→ |

### Decisions Needed
- [ ] [Decision 1 with deadline]

### Timeline Impact
[On schedule / X days ahead / X days behind — why]
```

### Weekly Team Update

```markdown
## Week of [Date Range]

### Completed ✅
- [Achievement 1] — [impact]
- [Achievement 2] — [impact]

### In Progress 🔄
- [Task 1] — [% complete, ETA]
- [Task 2] — [% complete, ETA]

### Blocked 🚫
- [Blocker] — need [resolution] from [who] by [when]

### Next Week Focus
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]

### Metrics
- Velocity: [X] story points
- Bugs: [X] open, [Y] closed
- Coverage: [X]%

### Risks & Mitigations
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk] | H/M/L | H/M/L | [Action] |
```

### Stakeholder Email

```markdown
Subject: [Project] Status — [Date] — [Status Emoji]

Hi [Name],

**Quick Summary**: [One sentence on where we are]

**This Week's Wins**:
• [Win 1 — business impact]
• [Win 2 — business impact]

**Coming Up**:
• [Next milestone] — [Date]
• [Key deliverable] — [Date]

**Need Your Input On**:
• [Decision needed] — [Context, options, recommendation]

Happy to jump on a call if you have questions.

[Sign-off]
```

### Sprint Retrospective Summary

```markdown
## Sprint [N] Retrospective

### What Went Well 🎉
- [Positive 1]
- [Positive 2]

### What Could Improve 🔧
- [Improvement 1]
- [Improvement 2]

### Action Items
| Action | Owner | Due |
|--------|-------|-----|
| [Action] | [Who] | [When] |

### Sprint Metrics
- Planned: [X] points | Completed: [Y] points
- Carry-over: [Z] items
- Team satisfaction: [Score]/5
```

## Audience Adaptation

### Language Translation

| Technical Term | Executive Translation |
|----------------|----------------------|
| "Refactored the authentication module" | "Improved security and login reliability" |
| "Reduced technical debt" | "Reduced maintenance costs and risk" |
| "Implemented CI/CD pipeline" | "Automated our release process — faster, safer updates" |
| "Fixed race condition" | "Resolved intermittent bug causing data issues" |
| "Migrated to microservices" | "Made the system more scalable and reliable" |

### Detail Levels

| Audience | Detail Level | Focus On |
|----------|--------------|----------|
| **C-Suite** | Minimal | Business impact, risks, decisions |
| **VP/Director** | Summary | Progress, resources, timeline |
| **Manager** | Moderate | Tasks, blockers, team health |
| **Team** | Detailed | Technical specifics, dependencies |
| **Customer** | Outcome | Value delivered, what's next |

## Status Indicators

### Traffic Light System

| Status | Symbol | Meaning | Action |
|--------|--------|---------|--------|
| **Green** | 🟢 | On track, no issues | Continue |
| **Yellow** | 🟡 | At risk, needs attention | Monitor closely |
| **Red** | 🔴 | Blocked, needs escalation | Immediate action |
| **Blue** | 🔵 | Complete | Celebrate |
| **Gray** | ⚪ | Not started | Plan |

### Trend Indicators

| Symbol | Meaning |
|--------|---------|
| ↑ | Improving |
| ↓ | Declining |
| → | Stable |
| ⚠️ | Needs attention |

## Automation Triggers

### When to Generate Status

| Trigger | Report Type |
|---------|-------------|
| End of day Friday | Weekly summary |
| Sprint end | Sprint report |
| Before stakeholder meeting | Executive summary |
| Milestone completion | Achievement update |
| Blocker encountered | Escalation notice |
| User asks "what did we do" | Session/period summary |

### Data Sources

Pull information from:

- Git commits and PR descriptions
- Issue tracker (completed, in-progress, blocked)
- Calendar (milestones, deadlines)
- Session history (what we worked on)
- Metrics dashboards (if available)

## Best Practices

### DO ✅

- Lead with the most important information
- Use consistent formatting across reports
- Include specific dates and numbers
- Highlight decisions needed
- Acknowledge blockers honestly
- Show progress, not just activity

### DON'T ❌

- Bury bad news
- Use jargon with non-technical audiences
- Include unnecessary detail
- Report activity without outcomes
- Over-promise on timelines
- Skip risk assessment

## Session Protocol

### Generating a Status Report

1. **Clarify audience**: Who will read this?
2. **Determine scope**: What period? What project?
3. **Gather data**: Commits, issues, conversations
4. **Identify highlights**: What matters most?
5. **Draft report**: Use appropriate template
6. **Adapt language**: Match audience level
7. **Review for clarity**: Can a newcomer understand?

### Sample requests

```text
Use status-reporting to create a session status report.
Use status-reporting to create this week's team update.
Use status-reporting to create an executive summary for this project.
Use status-reporting to draft a stakeholder email for [name].
```

## Integration Points

### Triggers for This Skill

- "status update", "status report"
- "what did we accomplish", "summarize progress"
- "stakeholder update", "email to [stakeholder]"
- "sprint report", "weekly summary"
- End of day/week (proactive)

## Metrics

- **Clarity score**: Can reader understand in 30 seconds?
- **Completeness**: All sections filled appropriately
- **Accuracy**: Numbers and dates verified
- **Audience fit**: Language matches recipient

## Would Revise If

Revisit this skill by **2026-11-30** or sooner if any of the following fires:

- Stakeholder feedback reports the templates as unclear, jargon-heavy, or missing decisions-needed sections ≥3 times within a quarter
- The audience-adaptation table produces tone mismatches when applied verbatim ≥2 times in observed reports
- Reports generated via these templates consistently bury bad news or miss escalation triggers that surface later as preventable surprises

## Complementary Scout resources

This Scout skill includes original Alex ACT Core prompts and/or instructions as supporting files. Read resources/RESOURCE-INDEX.md when you need the source prompt workflow or always-on instruction context that complemented this skill in the GitHub Copilot implementation.

- resources/prompts/note.prompt.md
- resources/prompts/save-session-note.prompt.md
- resources/prompts/status.prompt.md

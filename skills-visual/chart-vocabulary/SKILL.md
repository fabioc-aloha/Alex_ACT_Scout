---
name: chart-vocabulary
description: >-
  Choose appropriate chart types and Flint encodings from the analytical task, data shape,
  and reader goal. Use when selecting among bar, line, scatter, heatmap, histogram, KPI,
  waterfall, area, donut, and other Flint chart templates.
---

# Chart Vocabulary

Select chart types by analytical job—not visual novelty.

## Shared Knowledge Gate

Before selecting chart encodings or types for consequential analysis, consult
[`scout-knowledge-base`](../../skills/scout-knowledge-base/SKILL.md) for
relevant prior decisions, failure modes, procedures, and gotchas. Read only
records whose signals or preconditions match the analysis, and treat them as
context rather than authority. If unavailable, state that once and continue with
the current evidence; do not create a local fallback while selecting a chart.

## Chart selection matrix

| Task | Prefer | Avoid |
| --- | --- | --- |
| Compare categories | Bar, grouped bar, lollipop | Pie with many slices |
| Compare values over time | Line, area, slope, sparkline | Unsorted bars for dense time series |
| Part-to-whole with few categories | Donut, stacked bar | Donut with many small categories |
| Show relationship | Scatter, regression, connected scatter | Dual-axis line charts |
| Show distribution | Histogram, density, boxplot, violin | Average-only bar charts |
| Show matrix intensity | Heatmap | 3D surface charts |
| Show progress to target | KPI card, bullet chart | Gauge-like decoration |
| Explain additive drivers | Waterfall | Pie or stacked area |
| Show schedule or duration | Gantt | Calendar screenshots |
| Show geography | Map, choropleth | Map when location is not the point |

## Flint encoding reminders

Common Flint channels:

| Chart type | Required channels |
| --- | --- |
| Bar Chart | `x`, `y` |
| Grouped Bar Chart | `x`, `y`, `group` |
| Line Chart | `x`, `y`; optional `color`, `detail` |
| Scatter Plot | `x`, `y`; optional `color`, `size`, `shape` |
| Heatmap | `x`, `y`, `color` |
| Histogram | `x`; optional `color` |
| Donut Chart | `size`, `color` |
| Waterfall Chart | `x`, `y`; optional `color` |
| KPI Card | `metric`, `value`; optional `goal` |
| Area Chart | `x`, `y`; optional `color` |
| Lollipop Chart | `x`, `y`; optional `color` |

Call `list_chart_types` when uncertain. Flint's available chart set is runtime-specific.

## Semantic type guidance

Use semantic types to make intent explicit:

| Data meaning | Example semantic type |
| --- | --- |
| Category labels | `Category` |
| Dates, months, quarters | `Time` |
| Counts and quantities | `Quantity` |
| Money | `Currency` |
| Percent values | `Percentage` |
| Ratings or scores | `Score` |
| Countries or regions | `Country`, `Region` |

## Review questions

Before rendering:

1. What is the comparison?
2. Is the visual sorted or sequenced correctly?
3. Will the legend be readable?
4. Are units explicit?
5. Does the chosen chart type make the Big Idea easier to see?

## Label strategy

Choose the label plan with the chart type. Do not bolt labels on after rendering.

| Visual shape | Label strategy |
| --- | --- |
| Single-series vertical bar | Value labels above bars only when there is headroom; otherwise inside with contrast text or omit. |
| Single-series horizontal bar | Value labels outside the bar end when space allows; otherwise inside the bar with contrast text. |
| Grouped bar | Prefer a legend and axis values; use tooltips or selective labels instead of labeling every bar. |
| Stacked bar | Label totals or the most important segment only; labeling every segment usually collides. |
| Line | Label endpoints or annotated inflection points; avoid labeling every point. |
| Heatmap or matrix | Use theme-derived intensity plus optional direct values; ensure text contrast holds at the darkest and lightest cells. |
| KPI or gauge | Make the primary number dominant; keep range labels and target markers secondary. |
| Small multiples or sparklines | Label panel names and endpoints, not every point. |

## Theme fit

When choosing a chart type for a themed gallery or dashboard:

- Prefer chart types that survive both brand palettes and colorblind-safe palettes.
- Avoid designs that depend on red-vs-green distinction unless there is also text, position, pattern, or sign.
- For table/matrix visuals, theme headers, heatmap cells, totals, row labels, borders, and helper text together.
- For custom Canvas/SVG renderers, theme all marks and helper text through shared tokens. A themed page with an unthemed custom chart is visually broken.

## Anti-patterns

- Use a donut chart for more than five or six categories.
- Use a line chart for unordered categories.
- Use a heatmap when exact value comparison matters.
- Use color for categories when color should encode intensity.
- Use size and color together unless both encodings earn their complexity.
- Add value labels to dense, grouped, or stacked charts without proving that the labels do not overlap.

---
name: flint-chart
description: >-
  Author Flint charts in Scout from data, intent, and audience context. Use when creating,
  selecting, rendering, or refining charts with the Flint MCP tools; pairs with chart-big-idea,
  chart-vocabulary, and render-verify.
---

# Flint Chart

Author charts with Flint in Microsoft Scout. This skill turns a user request into a chart brief, a valid Flint payload, and a rendered artifact.

## When to use

Use this when the user asks to:

- create a chart, graph, dashboard figure, or data visualization
- choose a chart type for a dataset
- render a static chart through Flint MCP
- repair a Flint chart that validates but does not communicate well
- produce chart examples for documentation

Do not use this for freeform diagrams, screenshots, or whiteboard-style graphics. Use Mermaid, Excalidraw, image annotation, or other visual skills for those.

## Default Scout display path

Prefer `render_chart` when the chart must be visible in the conversation. In current Scout UI surfaces, `create_chart_view` may appear as a tool-output card instead of an embedded interactive chart.

Use `create_chart_view` only when the user specifically asks to test interactive chart views or when the host UI is known to support MCP app views.

## Workflow

1. **Frame the claim.** Use `chart-big-idea` discipline before chart selection. A chart title should state the finding, not just name the metric.
2. **Inspect the data.** Identify rows, fields, semantic types, units, missing values, categorical cardinality, and whether the data is already aggregated.
3. **Choose a chart type.** Use `chart-vocabulary` to match the analytical task to a Flint chart type and required encodings.
4. **Assemble the Flint payload.** Include:
   - `data`
   - `semantic_types`
   - `chart_spec.chartType`
   - `chart_spec.title`
   - `chart_spec.subtitle` when units, population, or time period matter
   - `chart_spec.encodings`
   - `theme_spec`
   - `field_display_names`
   - `backend`
5. **Validate before rendering.** Call `validate_chart` for unfamiliar chart types or complex encodings.
6. **Render and inspect.** Call `render_chart` for static output, then run `render-verify` before calling the task complete.
7. **Revise if needed.** Fix invalid encodings, unreadable labels, poor titles, too many categories, or unsuitable chart type.

## Theme propagation for galleries and custom renderers

When a page mixes Flint-themed charts with custom HTML, Canvas, SVG, D3, Chart.js, or hand-authored renderers, Flint is often the theme vocabulary rather than the renderer for every mark. Treat the palette as a shared contract across all renderers.

1. Define one active palette object near the top of the rendering code.
2. Derive semantic tokens from it, such as `primary`, `secondary`, `positive`, `negative`, `warning`, `neutral`, `text`, `muted`, `grid`, `panel`, and `surface`.
3. Route every custom renderer through those tokens. Do not leave fixed blues, grays, reds, greens, or heatmap ramps in custom Canvas/SVG/HTML just because the main chart library is themed.
4. Use alpha variants from the same palette for heatmaps, range bands, table totals, small multiples, sparkline panels, gauges, bullet bands, and process-control zones.
5. Keep white only when it is intentional contrast text or an in-mark separator; otherwise theme it.
6. Test at least two visually different themes: one brand/low-variety palette and one high-contrast or colorblind-safe palette.

## Value labels and collision control

Value labels are useful only when they improve reading without fighting the marks.

- Prefer automatic labels on single-series bar and line charts with a small number of points.
- Suppress automatic labels on grouped, stacked, dense, or multi-series charts unless each label has a proven non-overlapping position.
- For vertical bars, put labels above the bar only when there is room; otherwise place them inside the bar with contrast text or omit them.
- For horizontal bars, prefer just outside the bar end; fall back inside the bar only when there is enough width for the text.
- For line charts, label the endpoint rather than every point unless the chart is intentionally sparse.
- Re-render after label changes and check the actual pixels, not just the data labels option.

## Payload defaults

Use these defaults unless the user or document context says otherwise:

| Field | Default |
| --- | --- |
| `backend` | `vegalite` |
| `format` | `png` for Scout-visible output |
| `scale` | `2` |
| `theme_spec` | `powerbi-light` for dashboard-like output, `economist` for publication-style examples |
| `options.addTooltips` | `true` |
| `baseSize.width` | 640-800 px for most charts |
| `baseSize.height` | 360-480 px for most charts |

## Chart brief

Before rendering, be able to answer:

| Brief field | Question |
| --- | --- |
| Big Idea | What should the reader learn at a glance? |
| Audience | Who is reading the chart and what decision are they making? |
| Measure | What is measured and in what units? |
| Grain | What does each row represent? |
| Comparison | What is being compared: time, category, distribution, relationship, composition, or flow? |
| Risk | What could mislead the reader? |

## Anti-patterns

- **Title-as-axis-label:** `Revenue by quarter` instead of `Scout shows the fastest revenue climb by Q4`.
- **Decorative chart type:** pie, donut, radar, or rose charts when a bar or line chart would be clearer.
- **Unlabeled units:** a y-axis of `42` with no clue whether it means dollars, users, percent, or days.
- **Overloaded encodings:** color, size, shape, opacity, row, and column all at once.
- **Too many categories:** more series than the legend can support.
- **Silent invalid render:** assuming a tool result is acceptable without checking whether the chart image is present and readable.

## Related skills

- `chart-big-idea` for the chart claim and title.
- `chart-vocabulary` for chart-type selection.
- `render-verify` for post-render quality checks.
- `flint-chart-mcp` for runtime setup and diagnostics.

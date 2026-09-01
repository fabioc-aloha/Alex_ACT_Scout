---
name: render-verify
description: >-
  Verify rendered visual artifacts before delivery. Use after rendering Flint charts,
  Mermaid diagrams, SVG figures, screenshots, or image assets to catch invisible output,
  broken links, unreadable labels, clipped marks, and misleading presentation.
---

# Render Verify

Rendered output can fail even when specs validate. This skill is the final visual quality gate.

## When to use

Use after any visual render:

- Flint chart PNG/SVG output
- Mermaid diagram render
- generated SVG or HTML figure
- screenshot or annotated image
- documentation page with embedded images

## Verification checklist

| Check | Pass condition |
| --- | --- |
| Output exists | File or inline image is present and non-empty. |
| Link resolves | Markdown image paths resolve from the document location. |
| Visible render | The visual appears in the target UI, not just a tool card. |
| Readability | Labels, legend, title, and values are legible at expected display size. |
| No clipping | Titles, labels, legends, marks, and annotations are not cut off. |
| No collisions | Value labels, legends, callouts, and dense marks do not overlap each other or obscure bars, lines, points, or table cells. |
| Honest encodings | Axes, scale, color, and aggregation do not mislead. |
| Units visible | Measures identify units, population, and time window where needed. |
| Big Idea supported | The rendered visual proves the title's claim. |
| Theme applied | All marks, custom renderers, tables, heatmaps, legends, and helper text follow the selected theme unless a contrasting color is intentional and documented by the design. |

## Flint-specific checks

1. Confirm `render_chart` returned image content when user-visible output is required.
2. Confirm `validate_chart` reports `valid: true` for non-trivial specs.
3. Confirm `theme_spec` is one of the installed themes from `list_themes`.
4. Confirm chart dimensions are suitable for the target document or UI.
5. If a chart is missing in markdown, check relative image paths from the markdown file's folder.

## HTML gallery and dashboard checks

For interactive pages or chart galleries with mixed renderers:

1. Open the page in the target browser, not just as source.
2. Check the browser console for errors.
3. Check for horizontal page overflow.
4. Check each chart body for internal scroll or clipped content unless scrolling is the design.
5. Switch between at least two visually different themes and confirm custom Canvas, SVG, D3, Chart.js, HTML tables, legends, and badges all change together.
6. Inspect label placement on bar, line, table, heatmap, gauge, and custom canvas cards. Overlapping labels are a render failure even when the page has no console errors.
7. Preserve interaction state that matters, such as scroll position after a theme change.

Useful browser-side probes:

```js
Array.from(document.querySelectorAll('.chart-card')).map((card, index) => {
  const body = card.querySelector('.chart-body');
  const title = card.querySelector('h3')?.textContent?.replace(/\s+/g, ' ').trim();
  return {
    index,
    title,
    overflowX: body ? body.scrollWidth - body.clientWidth : 0,
    overflowY: body ? body.scrollHeight - body.clientHeight : 0
  };
}).filter(item => item.overflowX > 2 || item.overflowY > 2);
```

```js
document.documentElement.scrollWidth - document.documentElement.clientWidth;
```

## Documentation image checks

For markdown docs:

- keep image paths relative to the markdown file
- avoid absolute local paths in committed docs
- place generated assets under a stable folder such as `docs/assets/<topic>/`
- verify every `![alt](path)` resolves
- use concise alt text that names the chart or figure

## Failure response

If any check fails:

1. Name the failure specifically.
2. Fix the source spec, render command, image path, or layout.
3. Re-render if source changed.
4. Re-run the verification checklist.

Do not call a visual task complete when only the JSON spec exists and the user asked to see charts.

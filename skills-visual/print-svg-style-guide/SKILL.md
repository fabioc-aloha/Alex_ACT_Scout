---
name: print-svg-style-guide
description: >-
  Produce clean, print-safe SVG and chart styling guidance for documentation and reports.
  Use when visual artifacts need consistent typography, margins, contrast, export behavior,
  or compatibility with markdown, PDF, and print workflows.
---

# Print SVG Style Guide

Create visual artifacts that survive markdown preview, PDF export, and print.

## Scope

Use for:

- SVG figures in documentation
- exported chart SVGs
- print/PDF-ready visual assets
- style guidance for generated figures
- visual consistency across Alex ACT Scout docs

## Style rules

| Area | Rule |
| --- | --- |
| Canvas | Use a clear viewBox and avoid unnecessary whitespace. |
| Typography | Prefer system fonts; keep body labels at readable sizes. |
| Contrast | Meet strong contrast for text and essential marks. |
| Stroke | Use consistent stroke widths; avoid hairlines below print-safe thickness. |
| Color | Do not rely on color alone; labels or direct values should carry meaning. |
| Margins | Leave space for titles, legends, axis labels, and annotations. |
| Export | Prefer SVG for scalable docs, PNG for Scout conversation display. |
| Theme | Define semantic color tokens once and reuse them across SVG, Canvas, HTML, and chart-library marks. |
| Labels | Give labels explicit collision rules; do not rely on the renderer's default label placement. |

## SVG hygiene

- Include `role="img"` and a useful `<title>` when authoring standalone SVG.
- Keep IDs stable and descriptive when the SVG will be styled or tested.
- Avoid external font and image dependencies.
- Avoid scripts in committed SVG assets.
- Use inline styles or attributes that survive GitHub and markdown sanitization.
- Test the SVG in the target renderer, not just a browser tab.

## Chart export guidance

For Flint charts:

- Use `format: "png"` when the immediate target is Scout chat display.
- Use `format: "svg"` when the target is documentation or print and the backend supports SVG.
- Use a white or explicit background when the chart will appear in unknown themes.
- Keep titles and subtitles in the chart when the image may be separated from its surrounding prose.

## Mixed-renderer gallery guidance

When a visual artifact combines generated charts with custom SVG, Canvas, D3, or HTML widgets:

- Put the active palette and semantic tokens at the top of the script or stylesheet.
- Theme custom tables, legends, badges, annotations, grid lines, range bands, and helper text, not just the chart marks.
- Use alpha variants of palette colors for heatmaps and background bands instead of fixed RGB ramps.
- Keep contrast text intentional: white is acceptable inside dark marks, but fixed gray helper text should usually become a theme token.
- Preserve page position when changing themes or palettes so exploration does not reset the reader to the top.
- Run a browser overflow check on each visual container after changes.

## Print readiness checklist

1. Open the artifact at 100 percent zoom.
2. Confirm all text is readable.
3. Confirm the figure still works in grayscale.
4. Confirm no marks are clipped.
5. Confirm the artifact has enough context if copied alone.
6. Confirm file size is reasonable for repository storage.
7. Confirm labels do not overlap marks or each other at the intended display size.
8. Confirm two representative themes still render coherently if the artifact supports theme switching.

## Related skills

- `render-verify` for final output inspection.
- `flint-chart` for chart rendering.
- `markdown-mermaid` for diagrams rather than data charts.

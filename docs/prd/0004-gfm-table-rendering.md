# sourcedown GFM table rendering PRD

## Problem Statement

GFM (GitHub Flavored Markdown) pipe tables are a common output format for AI streaming. The current sourcedown v1 ships with table support listed as a non-goal, but the site dogfood prototype converts props/syntax references to markdown tables, which requires table rendering to work. Without table support, those sections break visually.

## Solution

Enable GFM table parsing in the CM6 markdown language and add semantic mark decorations for table node types. Source-as-is invariant is preserved: `|` pipes, `---` delimiters, and all cell text stay visible and copyable as raw markdown. Styling is applied on top via CSS classes.

## Implementation Decisions

- Add `GFM` extension from `@lezer/markdown` to `markdownLanguage({ extensions: [GFM] })` in `Sourcedown.tsx`.
- Add `Decoration.mark` entries for: `Table`, `TableHeader`, `TableDelimiter`, `TableRow`, `TableCell`.
- CSS classes: `sd-table`, `sd-table-header`, `sd-table-delimiter`, `sd-table-row`, `sd-table-cell`.
- `TableHeader` row: `fontWeight: "600"` (same as heading/strong weight).
- `TableDelimiter` (pipes and dashes row): muted color to de-emphasize punctuation.
- `Table`: no background. Keep it clean; source text is sufficient visual cue.
- Add `tableHeaderWeight` and `tableDelimiterColor` to `markdownStyleDefaults` for testability and CSS var override.
- No change to `applyMarkdown()` or auto-scroll logic.

## Node Tree (verified)

```
Table 0-29
  TableHeader 0-9          "| A | B |"
    TableDelimiter 0-1     "|"
    TableCell 2-3          "A"
    TableDelimiter 4-5     "|"
    TableCell 6-7          "B"
    TableDelimiter 8-9     "|"
  TableDelimiter 10-19     "|---|---|"   (full delimiter row)
  TableRow 20-29           "| 1 | 2 |"
    TableDelimiter 20-21   "|"
    TableCell 22-23        "1"
    ...
```

## Testing Decisions

- Test: GFM table markdown renders with `sd-table` class.
- Test: Header row has `sd-table-header` class and text is bold (via `sd-table-header` fontWeight).
- Test: Delimiter row/pipes have `sd-table-delimiter` class.
- Test: Data rows have `sd-table-row` class.
- Test: Source-as-is — raw `|` and `---` are present in the rendered text.
- Test: `markdownStyleDefaults.tableHeaderWeight` and `tableDelimiterColor` are exported with correct values.
- Test: Incomplete streaming table (`| A |`) does not crash.

## Out of Scope

- Replacing `|` pipes with invisible separators (breaks source-as-is).
- Aligned column widths or proportional spacing.
- Shiki or custom code highlighting for table cells.
- Multi-line cell content.
- Table of contents or anchor links from table headers.

# sourcedown GFM table widget PRD

Status: superseded.

This PRD was implemented as an experiment and then rejected after validation: `Decoration.replace` + a rendered table widget aligned columns, but browser copy returned the widget text instead of the raw markdown table source. That violated sourcedown's source-as-is invariant.

The accepted direction is the source-preserving table layout in `markdownDecorations.ts`: keep the original markdown text in the CodeMirror document, add line/mark decorations for table cells, and preserve raw markdown selection/copy.

## Problem Statement

PRD 0004 implemented GFM table support with `Decoration.mark`. This correctly preserves source-as-is but produces no column alignment — each row is a plain text line. NK's feedback: "看着像没渲染" (looks unrendered). Column-aligned table rendering is the requirement.

## Solution

Rejected experiment: replace the `Decoration.mark` approach for `Table` nodes with `Decoration.replace` + a `TableWidget`. The widget renders a proper HTML `<table>` element with `<th>` and `<td>` cells, letting the browser's table layout engine handle column alignment.

Source-as-is copy invariant was not preserved in real browser copy. The underlying CM6 document string stayed unchanged, but selected widget DOM copied rendered cell text rather than the raw markdown (`| A | B |\n|---|---|\n| 1 | 2 |`).

Trade-off rejected: individual `|` pipe characters were no longer cursor-selectable inside the widget, and full-range copy did not reliably return raw markdown.

## Implementation Decisions

- Add `TableWidget extends WidgetType` to `markdownDecorations.ts`.
- Parse table cell data from the lezer syntax tree during decoration build (without separate DOM query).
- `buildDecorations`: when cursor hits `Table` node, call `parseTable()`, create `Decoration.replace({ widget })`, and return `false` to skip children.
- Remove `Table`, `TableHeader`, `TableDelimiter`, `TableRow`, `TableCell` from `decs` mark map (they are now handled by the widget).
- Keep `markdownStyleDefaults.tableHeaderWeight` and `tableDelimiterColor` (usable as CSS var hints for the widget theme).
- Widget CSS (via `markdownDecorationsTheme`): `border-collapse`, `th` bold + subtle bg, `td` bordered, optional row striping.
- CSS custom properties: `--sd-table-border`, `--sd-table-header-bg`, `--sd-table-cell-pad`.
- Incomplete tables (e.g. during streaming, no `Table` node yet) fall through gracefully as plain text.
- No change to `applyMarkdown()` or auto-scroll logic.

## Table Parse Logic

```
Table
  TableHeader → collect TableCell children as header[]
  TableDelimiter (row) → skip
  TableRow → collect TableCell children as rows[][]
```

Cell text extracted with `doc.sliceString(cell.from, cell.to).trim()`.

## Testing Decisions

- Replace existing `sd-table`, `sd-table-header`, `sd-table-delimiter`, `sd-table-row`, `sd-table-cell` tests with widget tests.
- Test: table renders as `<table>` element.
- Test: header cells in `<th>` with correct trimmed content.
- Test: data cells in `<td>` with correct trimmed content.
- Test: incomplete table (`| A |`, no delimiter row) does not crash — just renders as text.
- Existing `tableHeaderWeight` / `tableDelimiterColor` default tests: keep (they remain in `markdownStyleDefaults`).

## Out of Scope

- Markdown syntax within cells (bold, links, inline code — deferred; cells show plain text).
- Multi-line cell content.
- Editable table cells.
- Table of contents from headers.
- Shiki or special highlighting inside table cells.

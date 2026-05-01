import { syntaxTree } from "@codemirror/language";
import { type EditorState, type Text, StateField } from "@codemirror/state";
import { Decoration, type DecorationSet, EditorView } from "@codemirror/view";
import type { SyntaxNodeRef } from "@lezer/common";

/** Default style tokens — exported so they are testable and overridable via CSS vars. */
export const markdownStyleDefaults = {
  headingWeight: "600",
  strongWeight: "600",
  // heading sizes — rem matches Tailwind text-3xl/2xl/xl/lg/base/sm
  h1Size: "1.875rem",
  h2Size: "1.5rem",
  h3Size: "1.25rem",
  h4Size: "1.125rem",
  h5Size: "1rem",
  h6Size: "0.875rem",
  // heading line-heights — Tailwind defaults for those text sizes
  h1LineHeight: "2.25rem",
  h2LineHeight: "2rem",
  h3LineHeight: "1.75rem",
  // inline code — streamdown bg-muted (oklch) + text-sm (rem)
  inlineCodeBg: "oklch(0.97 0 0)",
  inlineCodeSize: "0.875rem",
  // link — streamdown's --primary oklch value
  linkColor: "oklch(57.61% 0.2508 258.23)",
  linkUnderline: "oklch(57.61% 0.2508 258.23 / 0.4)",
  // blockquote — muted-foreground, border at 30% opacity
  blockquoteColor: "#737373",
  blockquoteBorder: "4px solid rgb(115 115 115 / 0.3)",
  // table — header semibold, delimiter pipes muted
  tableHeaderWeight: "600",
  tableDelimiterColor: "#9ca3af",
  // fenced code block background — light and dark defaults
  codeBlockBg: "oklch(0.95 0 0)",
  codeBlockBgDark: "oklch(0.22 0 0)",
} as const;

const decs: Record<string, Decoration> = {
  ATXHeading1: Decoration.mark({ class: "sd-h1" }),
  ATXHeading2: Decoration.mark({ class: "sd-h2" }),
  ATXHeading3: Decoration.mark({ class: "sd-h3" }),
  ATXHeading4: Decoration.mark({ class: "sd-h4" }),
  ATXHeading5: Decoration.mark({ class: "sd-h5" }),
  ATXHeading6: Decoration.mark({ class: "sd-h6" }),
  SetextHeading1: Decoration.mark({ class: "sd-h1" }),
  SetextHeading2: Decoration.mark({ class: "sd-h2" }),
  StrongEmphasis: Decoration.mark({ class: "sd-strong" }),
  Emphasis: Decoration.mark({ class: "sd-em" }),
  InlineCode: Decoration.mark({ class: "sd-inline-code" }),
  FencedCode: Decoration.mark({ class: "sd-code-block" }),
  CodeBlock: Decoration.mark({ class: "sd-code-block" }),
  Link: Decoration.mark({ class: "sd-link" }),
  Blockquote: Decoration.mark({ class: "sd-blockquote" }),
  ListItem: Decoration.mark({ class: "sd-list-item" }),
  HorizontalRule: Decoration.mark({ class: "sd-hr" }),
};

type TableCellKind = "header" | "delimiter" | "body";

interface TableCellRange {
  from: number;
  to: number;
  column: number;
  kind: TableCellKind;
  text: string;
}

interface TableLayout {
  cells: TableCellRange[];
  widths: number[];
  lineStarts: number[];
}

function trimSegmentRange(
  rowFrom: number,
  segmentStart: number,
  segmentEnd: number,
  rawRow: string
): { from: number; to: number; text: string } | null {
  const segment = rawRow.slice(segmentStart, segmentEnd);
  const leading = segment.length - segment.trimStart().length;
  const trailing = segment.length - segment.trimEnd().length;
  const from = rowFrom + segmentStart + leading;
  const to = rowFrom + segmentEnd - trailing;
  if (from >= to) return null;

  return {
    from,
    to,
    text: rawRow.slice(segmentStart + leading, segmentEnd - trailing),
  };
}

function tableRowCellRanges(
  from: number,
  to: number,
  doc: Text,
  kind: TableCellKind
): TableCellRange[] {
  const rawRow = doc.sliceString(from, to);
  const pipes: number[] = [];
  for (let i = 0; i < rawRow.length; i++) {
    if (rawRow[i] === "|") pipes.push(i);
  }
  if (pipes.length === 0) return [];

  const boundaries = [-1, ...pipes, rawRow.length];
  const cells: TableCellRange[] = [];
  let column = 0;

  for (let i = 0; i < boundaries.length - 1; i++) {
    const segmentStart = boundaries[i] + 1;
    const segmentEnd = boundaries[i + 1];
    const segment = rawRow.slice(segmentStart, segmentEnd);
    const isLeadingEdge =
      i === 0 && rawRow.startsWith("|") && segment.trim() === "";
    const isTrailingEdge =
      i === boundaries.length - 2 &&
      rawRow.endsWith("|") &&
      segment.trim() === "";

    if (isLeadingEdge || isTrailingEdge) {
      continue;
    }

    const trimmed = trimSegmentRange(from, segmentStart, segmentEnd, rawRow);
    if (trimmed) {
      cells.push({ ...trimmed, column, kind });
    }
    column++;
  }

  return cells;
}

function tableCellWidth(text: string): number {
  return Math.max(text.length, 3);
}

function parseTableLayout(tableNode: SyntaxNodeRef, doc: Text): TableLayout {
  const cells: TableCellRange[] = [];
  const widths: number[] = [];
  const lineStarts: number[] = [];
  const startLine = doc.lineAt(tableNode.from);
  const endLine = doc.lineAt(Math.max(tableNode.from, tableNode.to - 1));

  for (let line = startLine.number; line <= endLine.number; line++) {
    lineStarts.push(doc.line(line).from);
  }

  const cursor = tableNode.node.cursor();
  if (cursor.firstChild()) {
    do {
      if (cursor.name === "TableHeader") {
        cells.push(...tableRowCellRanges(cursor.from, cursor.to, doc, "header"));
      } else if (cursor.name === "TableDelimiter") {
        cells.push(
          ...tableRowCellRanges(cursor.from, cursor.to, doc, "delimiter")
        );
      } else if (cursor.name === "TableRow") {
        cells.push(...tableRowCellRanges(cursor.from, cursor.to, doc, "body"));
      }
    } while (cursor.nextSibling());
  }

  for (const cell of cells) {
    widths[cell.column] = Math.max(
      widths[cell.column] ?? 0,
      tableCellWidth(cell.text)
    );
  }

  return { cells, widths, lineStarts };
}

function tableCellDecoration(cell: TableCellRange, width: number): Decoration {
  const classes = ["sd-table-cell"];
  if (cell.kind === "header") classes.push("sd-table-header-cell");
  if (cell.kind === "delimiter") classes.push("sd-table-delimiter-cell");

  return Decoration.mark({
    class: classes.join(" "),
    attributes: {
      style: `display: inline-block; min-width: ${width}ch;`,
    },
  });
}

function buildDecorations(state: EditorState): DecorationSet {
  const marks: Array<{ from: number; to: number; dec: Decoration }> = [];

  syntaxTree(state)
    .cursor()
    .iterate((node) => {
      if (node.name === "Table") {
        const layout = parseTableLayout(node, state.doc);
        for (const lineStart of layout.lineStarts) {
          marks.push({
            from: lineStart,
            to: lineStart,
            dec: Decoration.line({ class: "sd-table-line" }),
          });
        }
        for (const cell of layout.cells) {
          marks.push({
            from: cell.from,
            to: cell.to,
            dec: tableCellDecoration(cell, layout.widths[cell.column] ?? 3),
          });
        }
        return false; // table children are handled as source-preserving marks
      }

      // Code block card: add line decorations for block-level background
      if (node.name === "FencedCode" || node.name === "CodeBlock") {
        const startLine = state.doc.lineAt(node.from);
        const endLine = state.doc.lineAt(Math.max(node.from, node.to - 1));
        for (let lineNum = startLine.number; lineNum <= endLine.number; lineNum++) {
          const line = state.doc.line(lineNum);
          const classes = ["sd-code-line"];
          if (lineNum === startLine.number) classes.push("sd-code-line-first");
          if (lineNum === endLine.number) classes.push("sd-code-line-last");
          marks.push({ from: line.from, to: line.from, dec: Decoration.line({ class: classes.join(" ") }) });
        }
        // fall through to add sd-code-block mark for font/size
      }

      const dec = decs[node.name];
      if (dec) {
        marks.push({ from: node.from, to: node.to, dec });
      }
    });

  return Decoration.set(
    marks.map(({ from, to, dec }) => dec.range(from, to)),
    true
  );
}

// StateField keeps semantic decorations derived from the current syntax tree.
export const markdownDecorationsExtension = StateField.define<DecorationSet>({
  create(state) {
    return buildDecorations(state);
  },
  update(decorations, transaction) {
    if (transaction.docChanged) {
      return buildDecorations(transaction.state);
    }
    return decorations;
  },
  provide(field) {
    return EditorView.decorations.from(field);
  },
});

export const markdownDecorationsTheme = EditorView.baseTheme({
  ".sd-h1": {
    fontSize: `var(--sd-h1-size, ${markdownStyleDefaults.h1Size})`,
    fontWeight: `var(--sd-heading-weight, ${markdownStyleDefaults.headingWeight})`,
    lineHeight: `var(--sd-h1-line-height, ${markdownStyleDefaults.h1LineHeight})`,
  },
  ".sd-h2": {
    fontSize: `var(--sd-h2-size, ${markdownStyleDefaults.h2Size})`,
    fontWeight: `var(--sd-heading-weight, ${markdownStyleDefaults.headingWeight})`,
    lineHeight: `var(--sd-h2-line-height, ${markdownStyleDefaults.h2LineHeight})`,
  },
  ".sd-h3": {
    fontSize: `var(--sd-h3-size, ${markdownStyleDefaults.h3Size})`,
    fontWeight: `var(--sd-heading-weight, ${markdownStyleDefaults.headingWeight})`,
    lineHeight: `var(--sd-h3-line-height, ${markdownStyleDefaults.h3LineHeight})`,
  },
  ".sd-h4": {
    fontSize: `var(--sd-h4-size, ${markdownStyleDefaults.h4Size})`,
    fontWeight: `var(--sd-heading-weight, ${markdownStyleDefaults.headingWeight})`,
  },
  ".sd-h5": {
    fontSize: `var(--sd-h5-size, ${markdownStyleDefaults.h5Size})`,
    fontWeight: `var(--sd-heading-weight, ${markdownStyleDefaults.headingWeight})`,
  },
  ".sd-h6": {
    fontSize: `var(--sd-h6-size, ${markdownStyleDefaults.h6Size})`,
    fontWeight: `var(--sd-heading-weight, ${markdownStyleDefaults.headingWeight})`,
  },
  ".sd-strong": { fontWeight: markdownStyleDefaults.strongWeight },
  ".sd-em": { fontStyle: "italic" },
  ".sd-inline-code": {
    fontFamily:
      "var(--sd-code-font, ui-monospace, 'Cascadia Code', monospace)",
    backgroundColor: `var(--sd-inline-code-bg, ${markdownStyleDefaults.inlineCodeBg})`,
    borderRadius: "0.25rem",
    padding: "2px 6px",
    fontSize: `var(--sd-inline-code-size, ${markdownStyleDefaults.inlineCodeSize})`,
  },
  ".sd-code-block": {
    fontFamily:
      "var(--sd-code-font, ui-monospace, 'Cascadia Code', monospace)",
    fontSize: "0.875em",
  },
  ".cm-line.sd-code-line": {
    background: `var(--sd-code-bg, ${markdownStyleDefaults.codeBlockBg})`,
    padding: "0 12px",
  },
  ".cm-line.sd-code-line-first": {
    borderTopLeftRadius: "6px",
    borderTopRightRadius: "6px",
    paddingTop: "6px",
  },
  ".cm-line.sd-code-line-last": {
    borderBottomLeftRadius: "6px",
    borderBottomRightRadius: "6px",
    paddingBottom: "6px",
  },
  "&dark .cm-line.sd-code-line": {
    background: `var(--sd-code-bg, ${markdownStyleDefaults.codeBlockBgDark})`,
  },
  ".sd-link": {
    color: `var(--sd-link-color, ${markdownStyleDefaults.linkColor})`,
    textDecoration: "underline",
    textDecorationColor: `var(--sd-link-underline, ${markdownStyleDefaults.linkUnderline})`,
    cursor: "pointer",
  },
  ".sd-blockquote": {
    color: `var(--sd-blockquote-color, ${markdownStyleDefaults.blockquoteColor})`,
    fontStyle: "italic",
    borderLeft: `var(--sd-blockquote-border, ${markdownStyleDefaults.blockquoteBorder})`,
    paddingLeft: "1rem",
  },
  ".sd-hr": {
    opacity: "0.4",
  },
  ".cm-line.sd-table-line": {
    fontFamily:
      "var(--sd-code-font, ui-monospace, 'Cascadia Code', monospace)",
  },
  ".sd-table-cell": {
    boxSizing: "border-box",
    padding: "0 0.6ch",
  },
  ".sd-table-header-cell": {
    fontWeight: `var(--sd-table-header-weight, ${markdownStyleDefaults.tableHeaderWeight})`,
  },
  ".sd-table-delimiter-cell": {
    color: `var(--sd-table-delimiter-color, ${markdownStyleDefaults.tableDelimiterColor})`,
    fontFamily:
      "var(--sd-code-font, ui-monospace, 'Cascadia Code', monospace)",
  },
});

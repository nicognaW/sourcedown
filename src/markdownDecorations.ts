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
  // fenced code block card — background + border (streamdown-aligned)
  codeBlockBg: "oklch(0.97 0 0)",
  codeBlockBgDark: "oklch(0.20 0 0)",
  codeBlockBorder: "oklch(0.922 0 0)",
  codeBlockBorderDark: "oklch(1 0 0 / 10%)",
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

interface EmptyTableCellPipeRange {
  from: number;
  column: number;
}

interface TableLayout {
  cells: TableCellRange[];
  emptyCellPipes: EmptyTableCellPipeRange[];
  widths: number[];
  lineStarts: number[];
}

interface TableRowLayout {
  cells: TableCellRange[];
  emptyCellPipes: EmptyTableCellPipeRange[];
}

function segmentRange(
  rowFrom: number,
  segmentStart: number,
  segmentEnd: number,
  rawRow: string
): { from: number; to: number; text: string } | null {
  const from = rowFrom + segmentStart;
  const to = rowFrom + segmentEnd;
  if (from >= to) return null;

  return {
    from,
    to,
    text: rawRow.slice(segmentStart, segmentEnd),
  };
}

function isEscapedPipe(rawRow: string, index: number): boolean {
  let slashCount = 0;
  for (let i = index - 1; i >= 0 && rawRow[i] === "\\"; i--) {
    slashCount++;
  }
  return slashCount % 2 === 1;
}

function unescapedPipeOffsets(rawRow: string): number[] {
  const pipes: number[] = [];
  let inlineCodeOpen = false;
  for (let i = 0; i < rawRow.length; i++) {
    if (rawRow[i] === "`" && !isEscapedPipe(rawRow, i)) {
      inlineCodeOpen = !inlineCodeOpen;
    }
    if (rawRow[i] === "|" && !inlineCodeOpen && !isEscapedPipe(rawRow, i)) {
      pipes.push(i);
    }
  }
  return pipes;
}

function tableRowLayout(
  from: number,
  to: number,
  doc: Text,
  kind: TableCellKind
): TableRowLayout {
  const rawRow = doc.sliceString(from, to);
  const pipes = unescapedPipeOffsets(rawRow);
  if (pipes.length === 0) return { cells: [], emptyCellPipes: [] };

  const boundaries = [-1, ...pipes, rawRow.length];
  const cells: TableCellRange[] = [];
  const emptyCellPipes: EmptyTableCellPipeRange[] = [];
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

    const range = segmentRange(from, segmentStart, segmentEnd, rawRow);
    if (range) {
      cells.push({ ...range, column, kind });
    } else if (segmentEnd < rawRow.length && rawRow[segmentEnd] === "|") {
      emptyCellPipes.push({ from: from + segmentEnd, column });
    }
    column++;
  }

  return { cells, emptyCellPipes };
}

function isWideCodePoint(codePoint: number): boolean {
  return (
    (codePoint >= 0x1100 && codePoint <= 0x115f) ||
    (codePoint >= 0x2e80 && codePoint <= 0xa4cf) ||
    (codePoint >= 0xac00 && codePoint <= 0xd7a3) ||
    (codePoint >= 0xf900 && codePoint <= 0xfaff) ||
    (codePoint >= 0xfe10 && codePoint <= 0xfe19) ||
    (codePoint >= 0xfe30 && codePoint <= 0xfe6f) ||
    (codePoint >= 0xff00 && codePoint <= 0xff60) ||
    (codePoint >= 0xffe0 && codePoint <= 0xffe6)
  );
}

function displayWidth(text: string): number {
  let width = 0;
  for (const char of text) {
    const codePoint = char.codePointAt(0) ?? 0;
    width += isWideCodePoint(codePoint) ? 2 : 1;
  }
  return width;
}

function tableCellWidth(text: string): number {
  return Math.max(displayWidth(text), 3);
}

function parseTableLayout(tableNode: SyntaxNodeRef, doc: Text): TableLayout {
  const cells: TableCellRange[] = [];
  const emptyCellPipes: EmptyTableCellPipeRange[] = [];
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
        const row = tableRowLayout(cursor.from, cursor.to, doc, "header");
        cells.push(...row.cells);
        emptyCellPipes.push(...row.emptyCellPipes);
      } else if (cursor.name === "TableDelimiter") {
        const row = tableRowLayout(cursor.from, cursor.to, doc, "delimiter");
        cells.push(...row.cells);
        emptyCellPipes.push(...row.emptyCellPipes);
      } else if (cursor.name === "TableRow") {
        const row = tableRowLayout(cursor.from, cursor.to, doc, "body");
        cells.push(...row.cells);
        emptyCellPipes.push(...row.emptyCellPipes);
      }
    } while (cursor.nextSibling());
  }

  for (const cell of cells) {
    widths[cell.column] = Math.max(
      widths[cell.column] ?? 0,
      tableCellWidth(cell.text)
    );
  }

  for (const emptyCellPipe of emptyCellPipes) {
    widths[emptyCellPipe.column] = Math.max(widths[emptyCellPipe.column] ?? 0, 3);
  }

  return { cells, emptyCellPipes, widths, lineStarts };
}

function tableCellDecoration(cell: TableCellRange, width: number): Decoration {
  const classes = ["sd-table-cell"];
  if (cell.kind === "header") classes.push("sd-table-header-cell");
  if (cell.kind === "delimiter") classes.push("sd-table-delimiter-cell");

  return Decoration.mark({
    class: classes.join(" "),
    attributes: {
      style: `display: inline-block; width: ${width}ch; min-width: ${width}ch; white-space: pre;`,
    },
  });
}

function emptyCellPipeDecoration(width: number): Decoration {
  return Decoration.mark({
    class: "sd-table-empty-cell-pipe",
    attributes: {
      style: `margin-left: ${width}ch;`,
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
        for (const pipe of layout.emptyCellPipes) {
          marks.push({
            from: pipe.from,
            to: pipe.from + 1,
            dec: emptyCellPipeDecoration(layout.widths[pipe.column] ?? 3),
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
    padding: "0 16px",
    borderLeft: `1px solid var(--sd-code-border, ${markdownStyleDefaults.codeBlockBorder})`,
    borderRight: `1px solid var(--sd-code-border, ${markdownStyleDefaults.codeBlockBorder})`,
  },
  ".cm-line.sd-code-line-first": {
    borderTop: `1px solid var(--sd-code-border, ${markdownStyleDefaults.codeBlockBorder})`,
    borderTopLeftRadius: "6px",
    borderTopRightRadius: "6px",
    paddingTop: "12px",
  },
  ".cm-line.sd-code-line-last": {
    borderBottom: `1px solid var(--sd-code-border, ${markdownStyleDefaults.codeBlockBorder})`,
    borderBottomLeftRadius: "6px",
    borderBottomRightRadius: "6px",
    paddingBottom: "12px",
  },
  "&dark .cm-line.sd-code-line": {
    background: `var(--sd-code-bg, ${markdownStyleDefaults.codeBlockBgDark})`,
    borderLeft: `1px solid var(--sd-code-border, ${markdownStyleDefaults.codeBlockBorderDark})`,
    borderRight: `1px solid var(--sd-code-border, ${markdownStyleDefaults.codeBlockBorderDark})`,
  },
  "&dark .cm-line.sd-code-line-first": {
    borderTop: `1px solid var(--sd-code-border, ${markdownStyleDefaults.codeBlockBorderDark})`,
  },
  "&dark .cm-line.sd-code-line-last": {
    borderBottom: `1px solid var(--sd-code-border, ${markdownStyleDefaults.codeBlockBorderDark})`,
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
    overflowWrap: "normal",
    verticalAlign: "top",
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

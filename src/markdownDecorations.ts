import { syntaxTree } from "@codemirror/language";
import {
  type EditorState,
  type Text,
  RangeSetBuilder,
  StateField,
} from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  WidgetType,
} from "@codemirror/view";
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

/** Parsed cell data extracted from the lezer syntax tree. */
interface TableData {
  headers: string[];
  delimiters: string[];
  rows: string[][];
}

function splitPipeRow(row: string): string[] {
  return row
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function parseTable(tableNode: SyntaxNodeRef, doc: Text): TableData {
  const headers: string[] = [];
  let delimiters: string[] = [];
  const rows: string[][] = [];

  const cursor = tableNode.node.cursor();
  if (!cursor.firstChild()) return { headers, delimiters, rows };

  do {
    if (cursor.name === "TableHeader") {
      const hCursor = cursor.node.cursor();
      if (hCursor.firstChild()) {
        do {
          if (hCursor.name === "TableCell") {
            headers.push(doc.sliceString(hCursor.from, hCursor.to).trim());
          }
        } while (hCursor.nextSibling());
      }
    } else if (cursor.name === "TableDelimiter") {
      delimiters = splitPipeRow(doc.sliceString(cursor.from, cursor.to));
    } else if (cursor.name === "TableRow") {
      const cells: string[] = [];
      const rCursor = cursor.node.cursor();
      if (rCursor.firstChild()) {
        do {
          if (rCursor.name === "TableCell") {
            cells.push(doc.sliceString(rCursor.from, rCursor.to).trim());
          }
        } while (rCursor.nextSibling());
      }
      rows.push(cells);
    }
  } while (cursor.nextSibling());

  return { headers, delimiters, rows };
}

/** Widget that renders a GFM table as a proper HTML <table> element. */
class TableWidget extends WidgetType {
  constructor(
    private readonly headers: string[],
    private readonly delimiters: string[],
    private readonly rows: string[][],
    private readonly rawMarkdown: string
  ) {
    super();
  }

  private appendPipe(row: HTMLTableRowElement): void {
    const pipe = row.appendChild(document.createElement("td"));
    pipe.className = "sd-table-pipe";
    pipe.textContent = "|";
  }

  private appendSourceRow(
    row: HTMLTableRowElement,
    cells: string[],
    tagName: "th" | "td",
    className?: string
  ): void {
    this.appendPipe(row);
    for (const cell of cells) {
      const td = row.appendChild(document.createElement(tagName));
      if (className) td.className = className;
      td.textContent = cell;
      this.appendPipe(row);
    }
  }

  toDOM(): HTMLElement {
    const table = document.createElement("table");
    table.className = "sd-table-widget";
    table.dataset.sdRawMarkdown = this.rawMarkdown;
    table.addEventListener("copy", (event) => {
      if (!event.clipboardData) return;

      event.clipboardData.setData("text/plain", this.rawMarkdown);
      event.preventDefault();
    });

    if (this.headers.length > 0) {
      const thead = table.appendChild(document.createElement("thead"));
      const tr = thead.appendChild(document.createElement("tr"));
      this.appendSourceRow(tr, this.headers, "th");
    }

    if (this.delimiters.length > 0 || this.rows.length > 0) {
      const tbody = table.appendChild(document.createElement("tbody"));
      if (this.delimiters.length > 0) {
        const tr = tbody.appendChild(document.createElement("tr"));
        tr.className = "sd-table-delimiter-row";
        this.appendSourceRow(
          tr,
          this.delimiters,
          "td",
          "sd-table-delimiter-cell"
        );
      }
      for (const row of this.rows) {
        const tr = tbody.appendChild(document.createElement("tr"));
        this.appendSourceRow(tr, row, "td");
      }
    }

    return table;
  }

  eq(other: WidgetType): boolean {
    if (!(other instanceof TableWidget)) return false;
    return (
      JSON.stringify(this.headers) === JSON.stringify(other.headers) &&
      JSON.stringify(this.delimiters) ===
        JSON.stringify(other.delimiters) &&
      JSON.stringify(this.rows) === JSON.stringify(other.rows) &&
      this.rawMarkdown === other.rawMarkdown
    );
  }
}

function closestTableWidget(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Node)) return null;

  const element =
    target instanceof Element ? target : target.parentElement;
  return element?.closest<HTMLElement>(".sd-table-widget") ?? null;
}

function rawMarkdownForCopy(
  event: ClipboardEvent,
  view: EditorView
): string | null {
  const selection = view.state.selection.main;
  if (!selection.empty) {
    return view.state.sliceDoc(selection.from, selection.to);
  }

  return closestTableWidget(event.target)?.dataset.sdRawMarkdown ?? null;
}

export const markdownCopyExtension = EditorView.domEventHandlers({
  copy(event, view) {
    const rawMarkdown = rawMarkdownForCopy(event, view);
    if (!rawMarkdown || !event.clipboardData) return false;

    event.clipboardData.setData("text/plain", rawMarkdown);
    event.preventDefault();
    return true;
  },
});

function buildDecorations(state: EditorState): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const marks: Array<{ from: number; to: number; dec: Decoration }> = [];

  syntaxTree(state)
    .cursor()
    .iterate((node) => {
      if (node.name === "Table") {
        const { headers, delimiters, rows } = parseTable(node, state.doc);
        const rawMarkdown = state.doc.sliceString(node.from, node.to);
        marks.push({
          from: node.from,
          to: node.to,
          dec: Decoration.replace({
            widget: new TableWidget(
              headers,
              delimiters,
              rows,
              rawMarkdown
            ),
          }),
        });
        return false; // skip children — widget handles the entire table
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

  // RangeSetBuilder requires ascending from, then by startSide (line decs have
  // startSide=-1 and must precede marks at the same position), then descending to
  // (outer mark before inner mark).
  marks.sort((a, b) => {
    if (a.from !== b.from) return a.from - b.from;
    // Line decorations (from === to, startSide=-1) come before marks at the same pos.
    const aIsLine = a.from === a.to;
    const bIsLine = b.from === b.to;
    if (aIsLine !== bIsLine) return aIsLine ? -1 : 1;
    return b.to - a.to; // outer mark (larger to) before inner
  });

  for (const { from, to, dec } of marks) {
    builder.add(from, to, dec);
  }

  return builder.finish();
}

// StateField is required for Decoration.replace that spans line breaks (multi-line).
// ViewPlugin cannot provide such decorations per CM6 constraints.
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
  ".sd-table-widget": {
    borderCollapse: "collapse",
    width: "100%",
    margin: "6px 0",
    fontSize: "0.9em",
  },
  ".sd-table-widget th, .sd-table-widget td": {
    border: `1px solid var(--sd-table-border, #e5e5e5)`,
    padding: `var(--sd-table-cell-pad, 5px 12px)`,
    textAlign: "left",
    verticalAlign: "top",
  },
  ".sd-table-widget th": {
    background: `var(--sd-table-header-bg, oklch(0.96 0 0))`,
    fontWeight: `var(--sd-table-header-weight, ${markdownStyleDefaults.tableHeaderWeight})`,
  },
  ".sd-table-widget .sd-table-pipe, .sd-table-widget .sd-table-delimiter-cell": {
    color: `var(--sd-table-delimiter-color, ${markdownStyleDefaults.tableDelimiterColor})`,
    fontFamily:
      "var(--sd-code-font, ui-monospace, 'Cascadia Code', monospace)",
  },
  ".sd-table-widget .sd-table-pipe": {
    width: "1%",
    padding: "var(--sd-table-pipe-pad, 5px 4px)",
    textAlign: "center",
  },
  ".sd-table-widget tbody tr:nth-child(even) td": {
    background: `var(--sd-table-row-alt-bg, oklch(0.99 0 0))`,
  },
});

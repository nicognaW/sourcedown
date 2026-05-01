import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
} from "@codemirror/view";

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
  Table: Decoration.mark({ class: "sd-table" }),
  TableHeader: Decoration.mark({ class: "sd-table-header" }),
  TableDelimiter: Decoration.mark({ class: "sd-table-delimiter" }),
  TableRow: Decoration.mark({ class: "sd-table-row" }),
  TableCell: Decoration.mark({ class: "sd-table-cell" }),
};

function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const marks: Array<{ from: number; to: number; dec: Decoration }> = [];

  syntaxTree(view.state)
    .cursor()
    .iterate((node) => {
      const dec = decs[node.name];
      if (dec) {
        marks.push({ from: node.from, to: node.to, dec });
      }
    });

  // RangeSetBuilder requires ascending from, then descending to (outer before inner)
  marks.sort((a, b) =>
    a.from !== b.from ? a.from - b.from : b.to - a.to
  );

  for (const { from, to, dec } of marks) {
    builder.add(from, to, dec);
  }

  return builder.finish();
}

export const markdownDecorationsExtension = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }

    update(update: ViewUpdate): void {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  { decorations: (v) => v.decorations }
);

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
    background: `var(--sd-code-bg, ${markdownStyleDefaults.codeBlockBg})`,
    borderRadius: "0.25rem",
  },
  "&dark .sd-code-block": {
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
  ".sd-table-header": {
    fontWeight: `var(--sd-table-header-weight, ${markdownStyleDefaults.tableHeaderWeight})`,
  },
  ".sd-table-delimiter": {
    color: `var(--sd-table-delimiter-color, ${markdownStyleDefaults.tableDelimiterColor})`,
  },
});

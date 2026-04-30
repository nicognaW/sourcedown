import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
} from "@codemirror/view";

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
    fontSize: "var(--sd-h1-size, 1.5em)",
    fontWeight: "var(--sd-heading-weight, 700)",
    lineHeight: "1.3",
  },
  ".sd-h2": {
    fontSize: "var(--sd-h2-size, 1.3em)",
    fontWeight: "var(--sd-heading-weight, 700)",
    lineHeight: "1.3",
  },
  ".sd-h3": {
    fontSize: "var(--sd-h3-size, 1.15em)",
    fontWeight: "var(--sd-heading-weight, 700)",
    lineHeight: "1.3",
  },
  ".sd-h4": { fontWeight: "var(--sd-heading-weight, 700)" },
  ".sd-h5": { fontWeight: "var(--sd-heading-weight, 700)" },
  ".sd-h6": { fontWeight: "var(--sd-heading-weight, 700)" },
  ".sd-strong": { fontWeight: "bold" },
  ".sd-em": { fontStyle: "italic" },
  ".sd-inline-code": {
    fontFamily:
      "var(--sd-code-font, ui-monospace, 'Cascadia Code', monospace)",
    backgroundColor: "var(--sd-inline-code-bg, rgba(0,0,0,0.06))",
    borderRadius: "3px",
    padding: "0.1em 0.25em",
    fontSize: "0.9em",
  },
  ".sd-code-block": {
    fontFamily:
      "var(--sd-code-font, ui-monospace, 'Cascadia Code', monospace)",
    fontSize: "0.9em",
  },
  ".sd-link": {
    color: "var(--sd-link-color, #0969da)",
    textDecoration: "underline",
    textDecorationColor: "var(--sd-link-underline, rgba(9,105,218,0.4))",
    cursor: "pointer",
  },
  ".sd-blockquote": {
    color: "var(--sd-blockquote-color, rgba(0,0,0,0.6))",
  },
  ".sd-hr": {
    opacity: "0.4",
  },
});

import { syntaxTree } from "@codemirror/language";
import { RangeSetBuilder } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
} from "@codemirror/view";

const decs = {
  strong: Decoration.mark({ class: "sd-strong" }),
  em: Decoration.mark({ class: "sd-em" }),
  h1: Decoration.mark({ class: "sd-h1" }),
  h2: Decoration.mark({ class: "sd-h2" }),
  h3: Decoration.mark({ class: "sd-h3" }),
  h4: Decoration.mark({ class: "sd-h4" }),
  h5: Decoration.mark({ class: "sd-h5" }),
  h6: Decoration.mark({ class: "sd-h6" }),
  inlineCode: Decoration.mark({ class: "sd-inline-code" }),
  codeBlock: Decoration.mark({ class: "sd-code-block" }),
  link: Decoration.mark({ class: "sd-link" }),
  blockquote: Decoration.mark({ class: "sd-blockquote" }),
  listItem: Decoration.mark({ class: "sd-list-item" }),
  hr: Decoration.mark({ class: "sd-hr" }),
};

function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const marks: Array<{ from: number; to: number; dec: Decoration }> = [];

  syntaxTree(view.state)
    .cursor()
    .iterate((node) => {
      switch (node.name) {
        case "ATXHeading1":
        case "SetextHeading1":
          marks.push({ from: node.from, to: node.to, dec: decs.h1 });
          break;
        case "ATXHeading2":
        case "SetextHeading2":
          marks.push({ from: node.from, to: node.to, dec: decs.h2 });
          break;
        case "ATXHeading3":
          marks.push({ from: node.from, to: node.to, dec: decs.h3 });
          break;
        case "ATXHeading4":
          marks.push({ from: node.from, to: node.to, dec: decs.h4 });
          break;
        case "ATXHeading5":
          marks.push({ from: node.from, to: node.to, dec: decs.h5 });
          break;
        case "ATXHeading6":
          marks.push({ from: node.from, to: node.to, dec: decs.h6 });
          break;
        case "StrongEmphasis":
          marks.push({ from: node.from, to: node.to, dec: decs.strong });
          break;
        case "Emphasis":
          marks.push({ from: node.from, to: node.to, dec: decs.em });
          break;
        case "InlineCode":
          marks.push({ from: node.from, to: node.to, dec: decs.inlineCode });
          break;
        case "FencedCode":
        case "CodeBlock":
          marks.push({ from: node.from, to: node.to, dec: decs.codeBlock });
          break;
        case "Link":
          marks.push({ from: node.from, to: node.to, dec: decs.link });
          break;
        case "Blockquote":
          marks.push({ from: node.from, to: node.to, dec: decs.blockquote });
          break;
        case "ListItem":
          marks.push({ from: node.from, to: node.to, dec: decs.listItem });
          break;
        case "HorizontalRule":
          marks.push({ from: node.from, to: node.to, dec: decs.hr });
          break;
      }
    });

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

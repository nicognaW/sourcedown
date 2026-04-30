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
  h1: Decoration.mark({ class: "sd-h1" }),
  h2: Decoration.mark({ class: "sd-h2" }),
  h3: Decoration.mark({ class: "sd-h3" }),
  h4: Decoration.mark({ class: "sd-h4" }),
  h5: Decoration.mark({ class: "sd-h5" }),
  h6: Decoration.mark({ class: "sd-h6" }),
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
  ".sd-strong": {
    fontWeight: "bold",
  },
});

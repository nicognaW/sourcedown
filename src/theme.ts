import { EditorView } from "@codemirror/view";

export const sourcedownBaseTheme = EditorView.theme({
  "&": {
    color: "var(--sd-foreground, #171717)",
    backgroundColor: "var(--sd-background, transparent)",
    fontFamily:
      "var(--sd-font-family, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, \"Segoe UI\", sans-serif)",
    fontSize: "var(--sd-font-size, 14px)",
    lineHeight: "var(--sd-line-height, 1.65)",
  },
  ".cm-scroller": {
    fontFamily: "inherit",
    lineHeight: "inherit",
    overflow: "auto",
  },
  ".cm-content": {
    caretColor: "transparent",
    padding: "0",
    whiteSpace: "pre-wrap",
  },
  ".cm-line": {
    padding: "0",
  },
  ".cm-cursor, .cm-dropCursor": {
    display: "none",
  },
  ".cm-focused": {
    outline: "none",
  },
  ".cm-selectionBackground, ::selection": {
    backgroundColor: "var(--sd-selection-background, #b4d5ff)",
  },
});

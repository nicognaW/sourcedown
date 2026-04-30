import { syntaxTree } from "@codemirror/language";
import type { Extension } from "@codemirror/state";
import type { SyntaxNode } from "@lezer/common";
import { EditorView } from "@codemirror/view";
import type { MutableRefObject } from "react";
import type { SourcedownProps } from "./Sourcedown";

function extractHref(view: EditorView, pos: number): string | null {
  const tree = syntaxTree(view.state);
  let node: SyntaxNode | null = tree.resolveInner(pos, 1);

  // Walk up to find the enclosing Link node
  while (node) {
    if (node.name === "Link") {
      const urlNode = node.getChild("URL");
      if (urlNode) {
        return view.state.doc.sliceString(urlNode.from, urlNode.to);
      }
      return null;
    }
    node = node.parent;
  }

  return null;
}

export function linkClickExtension(
  onLinkClickRef: MutableRefObject<SourcedownProps["onLinkClick"]>
): Extension {
  return EditorView.domEventHandlers({
    click(event, view) {
      const target = event.target as HTMLElement;
      const linkEl = target.closest(".sd-link");
      if (!linkEl) return false;

      let pos: number;
      try {
        pos = view.posAtDOM(linkEl);
      } catch {
        return false;
      }

      const href = extractHref(view, pos);
      if (!href) return false;

      const handler = onLinkClickRef.current;
      if (handler) {
        handler(event as MouseEvent, href);
      } else {
        window.open(href, "_blank", "noopener,noreferrer");
      }

      return true;
    },
  });
}

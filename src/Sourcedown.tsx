"use client";

import { markdown as markdownLanguage } from "@codemirror/lang-markdown";
import { EditorState, type Extension } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { useEffect, useRef } from "react";
import { linkClickExtension } from "./linkClick";
import {
  markdownDecorationsExtension,
  markdownDecorationsTheme,
} from "./markdownDecorations";
import { sourcedownBaseTheme } from "./theme";

export interface SourcedownProps {
  markdown: string;
  className?: string;
  autoScroll?: boolean;
  onLinkClick?: (event: MouseEvent, href: string) => void;
}

function createExtensions(
  onLinkClickRef: React.MutableRefObject<SourcedownProps["onLinkClick"]>
): Extension[] {
  return [
    EditorState.readOnly.of(true),
    EditorView.editable.of(false),
    EditorView.lineWrapping,
    markdownLanguage(),
    sourcedownBaseTheme,
    markdownDecorationsExtension,
    markdownDecorationsTheme,
    linkClickExtension(onLinkClickRef),
    EditorView.contentAttributes.of({
      "aria-label": "markdown source",
      role: "textbox",
    }),
  ];
}

function isAtScrollBottom(element: HTMLElement): boolean {
  return (
    element.scrollTop + element.clientHeight >= element.scrollHeight - 2
  );
}

function scrollToBottom(view: EditorView): void {
  view.scrollDOM.scrollTop = view.scrollDOM.scrollHeight;
}

function applyMarkdown(
  view: EditorView,
  previous: string,
  next: string,
  shouldAutoScroll: boolean
): void {
  if (previous === next) {
    return;
  }

  const shouldFollow =
    shouldAutoScroll && isAtScrollBottom(view.scrollDOM);

  if (next.startsWith(previous)) {
    view.dispatch({
      changes: {
        from: previous.length,
        insert: next.slice(previous.length),
      },
    });
    if (shouldFollow) {
      scrollToBottom(view);
    }
    return;
  }

  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: next,
    },
  });
  if (shouldFollow) {
    scrollToBottom(view);
  }
}

export function Sourcedown({
  markdown,
  className,
  autoScroll = true,
  onLinkClick,
}: SourcedownProps): React.ReactElement {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const markdownRef = useRef(markdown);
  const onLinkClickRef = useRef(onLinkClick);

  useEffect(() => {
    onLinkClickRef.current = onLinkClick;
  }, [onLinkClick]);

  useEffect(() => {
    const parent = rootRef.current;
    if (!parent) {
      return;
    }

    const view = new EditorView({
      parent,
      state: EditorState.create({
        doc: markdownRef.current,
        extensions: createExtensions(onLinkClickRef),
      }),
    });

    viewRef.current = view;
    if (autoScroll) {
      scrollToBottom(view);
    }

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) {
      markdownRef.current = markdown;
      return;
    }

    applyMarkdown(view, markdownRef.current, markdown, autoScroll);
    markdownRef.current = markdown;
  }, [markdown, autoScroll]);

  return (
    <div
      className={["sourcedown", className].filter(Boolean).join(" ")}
      data-sourcedown=""
      ref={rootRef}
    />
  );
}

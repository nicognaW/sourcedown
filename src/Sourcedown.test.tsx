import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sourcedown } from "./Sourcedown";

function contentText(container: HTMLElement): string {
  return container.querySelector(".cm-content")?.textContent ?? "";
}

function scroller(container: HTMLElement): HTMLElement {
  const element = container.querySelector(".cm-scroller");
  if (!(element instanceof HTMLElement)) {
    throw new Error("missing CodeMirror scroller");
  }
  return element;
}

function setScrollMetrics(
  element: HTMLElement,
  {
    clientHeight,
    scrollHeight,
    scrollTop,
  }: { clientHeight: number; scrollHeight: number; scrollTop: number }
): void {
  Object.defineProperties(element, {
    clientHeight: { configurable: true, value: clientHeight },
    scrollHeight: { configurable: true, value: scrollHeight },
  });
  element.scrollTop = scrollTop;
}

describe("Sourcedown", () => {
  it("renders markdown source as the editor text", async () => {
    const markdown = "# Title\n\n**bold**\n\n```ts\nconst x = 1;\n```";
    const { container } = render(<Sourcedown markdown={markdown} />);

    await waitFor(() => {
      expect(contentText(container)).toContain("# Title");
    });

    expect(contentText(container)).toContain("**bold**");
    expect(contentText(container)).toContain("```ts");
    expect(contentText(container)).toContain("const x = 1;");
  });

  it("keeps the CodeMirror document read-only", async () => {
    const { container } = render(<Sourcedown markdown="hello" />);

    await waitFor(() => {
      expect(container.querySelector(".cm-content")).toHaveAttribute(
        "contenteditable",
        "false"
      );
    });
  });

  it("applies append-only updates without losing existing source text", async () => {
    const { container, rerender } = render(<Sourcedown markdown="# Tit" />);

    rerender(<Sourcedown markdown="# Title\n\n[text](https://example.com)" />);

    await waitFor(() => {
      expect(contentText(container)).toContain("# Title");
    });

    expect(contentText(container)).toContain("[text](https://example.com)");
  });

  it("keeps the viewport pinned when streaming while already at the bottom", async () => {
    const { container, rerender } = render(<Sourcedown markdown="line 1" />);

    await waitFor(() => {
      expect(contentText(container)).toContain("line 1");
    });

    const scrollElement = scroller(container);
    setScrollMetrics(scrollElement, {
      clientHeight: 100,
      scrollHeight: 100,
      scrollTop: 0,
    });

    rerender(<Sourcedown markdown={"line 1\nline 2"} />);

    await waitFor(() => {
      expect(contentText(container)).toContain("line 2");
    });

    expect(scrollElement.scrollTop).toBe(100);
  });

  it("does not force scroll when the user has scrolled away from the bottom", async () => {
    const { container, rerender } = render(<Sourcedown markdown="line 1" />);

    await waitFor(() => {
      expect(contentText(container)).toContain("line 1");
    });

    const scrollElement = scroller(container);
    setScrollMetrics(scrollElement, {
      clientHeight: 100,
      scrollHeight: 400,
      scrollTop: 40,
    });

    rerender(<Sourcedown markdown={"line 1\nline 2"} />);

    await waitFor(() => {
      expect(contentText(container)).toContain("line 2");
    });

    expect(scrollElement.scrollTop).toBe(40);
  });

  it("can disable auto-scroll", async () => {
    const { container, rerender } = render(
      <Sourcedown autoScroll={false} markdown="line 1" />
    );

    await waitFor(() => {
      expect(contentText(container)).toContain("line 1");
    });

    const scrollElement = scroller(container);
    setScrollMetrics(scrollElement, {
      clientHeight: 100,
      scrollHeight: 100,
      scrollTop: 0,
    });

    rerender(<Sourcedown autoScroll={false} markdown={"line 1\nline 2"} />);

    await waitFor(() => {
      expect(contentText(container)).toContain("line 2");
    });

    expect(scrollElement.scrollTop).toBe(0);
  });

  it("resets safely when markdown is replaced instead of appended", async () => {
    const { container, rerender } = render(<Sourcedown markdown="# Old" />);

    rerender(<Sourcedown markdown="**New**" />);

    await waitFor(() => {
      expect(contentText(container)).toContain("**New**");
    });

    expect(contentText(container)).not.toContain("# Old");
  });

  it("does not remount the editor for append-only streaming updates", async () => {
    const { container, rerender } = render(<Sourcedown markdown="a" />);

    await waitFor(() => {
      expect(contentText(container)).toContain("a");
    });

    const editor = container.querySelector(".cm-editor");
    rerender(<Sourcedown markdown="ab" />);

    await waitFor(() => {
      expect(contentText(container)).toContain("ab");
    });

    expect(container.querySelector(".cm-editor")).toBe(editor);
  });

  it("keeps incomplete streaming markdown visible", async () => {
    const { container, rerender } = render(<Sourcedown markdown="[text](" />);

    await waitFor(() => {
      expect(contentText(container)).toContain("[text](");
    });

    rerender(<Sourcedown markdown="[text](https://example.com" />);

    await waitFor(() => {
      expect(contentText(container)).toContain(
        "[text](https://example.com"
      );
    });
  });
});

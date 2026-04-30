import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sourcedown } from "./Sourcedown";

function contentText(container: HTMLElement): string {
  return container.querySelector(".cm-content")?.textContent ?? "";
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

  it("resets safely when markdown is replaced instead of appended", async () => {
    const { container, rerender } = render(<Sourcedown markdown="# Old" />);

    rerender(<Sourcedown markdown="**New**" />);

    await waitFor(() => {
      expect(contentText(container)).toContain("**New**");
    });

    expect(contentText(container)).not.toContain("# Old");
  });
});

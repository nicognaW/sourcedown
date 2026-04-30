import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sourcedown } from "./Sourcedown";

function contentText(container: HTMLElement): string {
  return container.querySelector(".cm-content")?.textContent ?? "";
}

describe("code highlighting", () => {
  it("highlights javascript fenced code without changing raw markdown text", async () => {
    const markdown = "```js\nconst answer = 42;\n```";
    const { container } = render(<Sourcedown markdown={markdown} />);

    await waitFor(() => {
      expect(container.querySelector(".sd-code-keyword")).not.toBeNull();
    });

    expect(contentText(container)).toContain("```js");
    expect(contentText(container)).toContain("const answer = 42;");
    expect(contentText(container)).toContain("```");
  });

  it("highlights json fenced code", async () => {
    const markdown = '```json\n{"answer": 42}\n```';
    const { container } = render(<Sourcedown markdown={markdown} />);

    await waitFor(() => {
      expect(container.querySelector(".sd-code-string")).not.toBeNull();
    });

    expect(contentText(container)).toContain('{"answer": 42}');
  });
});

import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sourcedown } from "./Sourcedown";

function contentText(container: HTMLElement): string {
  return container.querySelector(".cm-content")?.textContent ?? "";
}

function highlightedCode(container: HTMLElement): Element | null {
  return container.querySelector(
    [
      ".sd-code-keyword",
      ".sd-code-string",
      ".sd-code-number",
      ".sd-code-variable",
      ".sd-code-definition",
      ".sd-code-function",
      ".sd-code-operator",
      ".sd-code-punctuation",
      ".sd-code-tag",
      ".sd-code-attribute",
    ].join(",")
  );
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

  it("highlights css fenced code", async () => {
    const markdown = "```css\n.card { display: grid; }\n```";
    const { container } = render(<Sourcedown markdown={markdown} />);

    await waitFor(() => {
      expect(container.querySelector(".sd-code-string")).not.toBeNull();
    });

    expect(contentText(container)).toContain(".card { display: grid; }");
  });

  it("highlights html fenced code", async () => {
    const markdown = "```html\n<section class=\"hero\">hi</section>\n```";
    const { container } = render(<Sourcedown markdown={markdown} />);

    await waitFor(() => {
      expect(container.querySelector(".sd-code-tag")).not.toBeNull();
    });

    expect(contentText(container)).toContain(
      '<section class="hero">hi</section>'
    );
  });

  it("highlights bash fenced code", async () => {
    const markdown = "```bash\nif [ -f file ]; then echo ok; fi\n```";
    const { container } = render(<Sourcedown markdown={markdown} />);

    await waitFor(() => {
      expect(highlightedCode(container)).not.toBeNull();
    });

    expect(contentText(container)).toContain(
      "if [ -f file ]; then echo ok; fi"
    );
  });

  it("highlights markdown fenced code", async () => {
    const markdown = "```md\n# Heading\n**bold**\n```";
    const { container } = render(<Sourcedown markdown={markdown} />);

    await waitFor(() => {
      expect(container.querySelector(".sd-code-strong")).not.toBeNull();
    });

    expect(contentText(container)).toContain("# Heading");
    expect(contentText(container)).toContain("**bold**");
  });

  it("highlights typescript and tsx aliases", async () => {
    for (const markdown of [
      "```ts\nconst answer: number = 42;\n```",
      "```tsx\nconst node = <span>hi</span>;\n```",
    ]) {
      const { container, unmount } = render(<Sourcedown markdown={markdown} />);

      await waitFor(() => {
        expect(highlightedCode(container)).not.toBeNull();
      });

      expect(contentText(container)).toContain("const");
      unmount();
    }
  });

  it("falls back to plaintext for unknown code fences", async () => {
    const markdown = "```unknown\nplain source stays plain\n```";
    const { container } = render(<Sourcedown markdown={markdown} />);

    await waitFor(() => {
      expect(contentText(container)).toContain("plain source stays plain");
    });

    expect(highlightedCode(container)).toBeNull();
  });
});

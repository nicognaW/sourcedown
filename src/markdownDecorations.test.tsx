import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { markdownStyleDefaults } from "./markdownDecorations";
import { Sourcedown } from "./Sourcedown";

function dec(container: HTMLElement, cls: string): Element | null {
  return container.querySelector(`.${cls}`);
}

function decText(container: HTMLElement, cls: string): string {
  return Array.from(container.querySelectorAll(`.${cls}`))
    .map((el) => el.textContent ?? "")
    .join("");
}

describe("markdown semantic decorations", () => {
  it("marks bold ranges with sd-strong", async () => {
    const { container } = render(<Sourcedown markdown="**bold**" />);

    await waitFor(() => {
      expect(dec(container, "sd-strong")).not.toBeNull();
    });

    expect(decText(container, "sd-strong")).toContain("bold");
    expect(decText(container, "sd-strong")).toContain("**");
  });

  it("marks ATX headings with sd-h1 through sd-h6", async () => {
    const { container } = render(
      <Sourcedown markdown={"# H1\n\n## H2\n\n### H3"} />
    );

    await waitFor(() => {
      expect(dec(container, "sd-h1")).not.toBeNull();
    });

    expect(decText(container, "sd-h1")).toContain("H1");
    expect(decText(container, "sd-h1")).toContain("#");
    expect(dec(container, "sd-h2")).not.toBeNull();
    expect(dec(container, "sd-h3")).not.toBeNull();
  });

  it("does not apply code heading color to document headings", async () => {
    const { container } = render(<Sourcedown markdown="# H1" />);

    await waitFor(() => {
      expect(dec(container, "sd-h1")).not.toBeNull();
    });

    expect(
      container.querySelector(".sd-h1 .sd-code-heading, .sd-h1.sd-code-heading")
    ).toBeNull();
  });

  it("marks italic ranges with sd-em", async () => {
    const { container } = render(<Sourcedown markdown="_italic_" />);

    await waitFor(() => {
      expect(dec(container, "sd-em")).not.toBeNull();
    });

    expect(decText(container, "sd-em")).toContain("italic");
    expect(decText(container, "sd-em")).toContain("_");
  });

  it("marks inline code with sd-inline-code", async () => {
    const { container } = render(<Sourcedown markdown="`code`" />);

    await waitFor(() => {
      expect(dec(container, "sd-inline-code")).not.toBeNull();
    });

    expect(decText(container, "sd-inline-code")).toContain("code");
    expect(decText(container, "sd-inline-code")).toContain("`");
  });

  it("marks fenced code blocks with sd-code-block", async () => {
    const { container } = render(
      <Sourcedown markdown={"```ts\nconst x = 1;\n```"} />
    );

    await waitFor(() => {
      expect(dec(container, "sd-code-block")).not.toBeNull();
    });

    expect(decText(container, "sd-code-block")).toContain("const x = 1;");
    expect(decText(container, "sd-code-block")).toContain("```");
  });

  it("marks link ranges with sd-link", async () => {
    const { container } = render(
      <Sourcedown markdown="[text](https://example.com)" />
    );

    await waitFor(() => {
      expect(dec(container, "sd-link")).not.toBeNull();
    });

    expect(decText(container, "sd-link")).toContain("text");
    expect(decText(container, "sd-link")).toContain("[");
    expect(decText(container, "sd-link")).toContain("]");
  });

  it("marks blockquotes with sd-blockquote", async () => {
    const { container } = render(<Sourcedown markdown="> quote" />);

    await waitFor(() => {
      expect(dec(container, "sd-blockquote")).not.toBeNull();
    });

    expect(decText(container, "sd-blockquote")).toContain("quote");
    expect(decText(container, "sd-blockquote")).toContain(">");
  });

  it("marks list items with sd-list-item", async () => {
    const { container } = render(<Sourcedown markdown="- item" />);

    await waitFor(() => {
      expect(dec(container, "sd-list-item")).not.toBeNull();
    });

    expect(decText(container, "sd-list-item")).toContain("item");
    expect(decText(container, "sd-list-item")).toContain("-");
  });

  it("marks horizontal rules with sd-hr", async () => {
    const { container } = render(<Sourcedown markdown="---" />);

    await waitFor(() => {
      expect(dec(container, "sd-hr")).not.toBeNull();
    });
  });

  describe("streamdown-aligned default styles", () => {
    it("heading weight default is semibold 600", () => {
      expect(markdownStyleDefaults.headingWeight).toBe("600");
    });

    it("strong weight default is semibold 600, not bold/700", () => {
      expect(markdownStyleDefaults.strongWeight).toBe("600");
    });

    it("link color default is oklch primary (streamdown --primary)", () => {
      expect(markdownStyleDefaults.linkColor).toBe(
        "oklch(57.61% 0.2508 258.23)"
      );
    });

    it("blockquote color default is muted gray #737373", () => {
      expect(markdownStyleDefaults.blockquoteColor).toBe("#737373");
    });

    it("h1 size default is 1.875rem (text-3xl, rem not em)", () => {
      expect(markdownStyleDefaults.h1Size).toBe("1.875rem");
    });

    it("h4/h5/h6 have explicit size defaults", () => {
      expect(markdownStyleDefaults.h4Size).toBe("1.125rem");
      expect(markdownStyleDefaults.h5Size).toBe("1rem");
      expect(markdownStyleDefaults.h6Size).toBe("0.875rem");
    });

    it("inline code size is 0.875rem not em (rem, like text-sm)", () => {
      expect(markdownStyleDefaults.inlineCodeSize).toBe("0.875rem");
    });

    it("inline code bg is oklch muted token not rgba", () => {
      expect(markdownStyleDefaults.inlineCodeBg).toBe("oklch(0.97 0 0)");
    });
  });

  describe("GFM table decorations", () => {
    const tableMarkdown = `| A | B |\n|---|---|\n| 1 | 2 |`;

    it("marks table ranges with sd-table", async () => {
      const { container } = render(<Sourcedown markdown={tableMarkdown} />);

      await waitFor(() => {
        expect(dec(container, "sd-table")).not.toBeNull();
      });
    });

    it("marks header row with sd-table-header", async () => {
      const { container } = render(<Sourcedown markdown={tableMarkdown} />);

      await waitFor(() => {
        expect(dec(container, "sd-table-header")).not.toBeNull();
      });

      expect(decText(container, "sd-table-header")).toContain("A");
      expect(decText(container, "sd-table-header")).toContain("B");
    });

    it("marks delimiter pipes and dashes row with sd-table-delimiter", async () => {
      const { container } = render(<Sourcedown markdown={tableMarkdown} />);

      await waitFor(() => {
        expect(dec(container, "sd-table-delimiter")).not.toBeNull();
      });

      const delimText = decText(container, "sd-table-delimiter");
      expect(delimText).toContain("|");
    });

    it("marks data rows with sd-table-row", async () => {
      const { container } = render(<Sourcedown markdown={tableMarkdown} />);

      await waitFor(() => {
        expect(dec(container, "sd-table-row")).not.toBeNull();
      });

      expect(decText(container, "sd-table-row")).toContain("1");
      expect(decText(container, "sd-table-row")).toContain("2");
    });

    it("marks cells with sd-table-cell", async () => {
      const { container } = render(<Sourcedown markdown={tableMarkdown} />);

      await waitFor(() => {
        expect(dec(container, "sd-table-cell")).not.toBeNull();
      });
    });

    it("preserves source-as-is: | pipes and --- are visible in rendered text", async () => {
      const { container } = render(<Sourcedown markdown={tableMarkdown} />);

      await waitFor(() => {
        expect(container.querySelector(".cm-content")).toBeTruthy();
      });

      const text = container.querySelector(".cm-content")?.textContent ?? "";
      expect(text).toContain("|");
      expect(text).toContain("---");
    });

    it("does not crash on incomplete streaming table", async () => {
      const { container, unmount } = render(
        <Sourcedown markdown="| A |" />
      );

      await waitFor(() => {
        expect(container.querySelector(".cm-content")).toBeTruthy();
      });

      unmount();
    });

    it("tableHeaderWeight default is semibold 600", () => {
      expect(markdownStyleDefaults.tableHeaderWeight).toBe("600");
    });

    it("tableDelimiterColor default is muted gray", () => {
      expect(markdownStyleDefaults.tableDelimiterColor).toBe("#9ca3af");
    });
  });

  describe("code block background", () => {
    it("codeBlockBg default is subtle light oklch gray", () => {
      expect(markdownStyleDefaults.codeBlockBg).toBe("oklch(0.95 0 0)");
    });

    it("codeBlockBgDark default is dark oklch gray", () => {
      expect(markdownStyleDefaults.codeBlockBgDark).toBe("oklch(0.22 0 0)");
    });

    it("fenced code block renders with sd-code-block class", async () => {
      const { container } = render(
        <Sourcedown markdown={"```ts\nconst x = 1;\n```"} />
      );

      await waitFor(() => {
        expect(container.querySelector(".sd-code-block")).not.toBeNull();
      });
    });
  });

  it("does not crash on incomplete streaming markdown", async () => {
    const incompletes = [
      "**bold",
      "[text](",
      "```ts\nconst x =",
      "> ",
      "# ",
    ];

    for (const md of incompletes) {
      const { container, unmount } = render(<Sourcedown markdown={md} />);

      await waitFor(() => {
        expect(container.querySelector(".cm-content")).toBeTruthy();
      });

      unmount();
    }
  });
});

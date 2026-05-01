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

function lineTexts(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll(".cm-line")).map(
    (line) => line.textContent ?? ""
  );
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

    it("does not replace the raw markdown table with an HTML table widget", async () => {
      const { container } = render(<Sourcedown markdown={tableMarkdown} />);

      await waitFor(() => {
        expect(container.querySelector(".cm-content")).toBeTruthy();
      });

      expect(container.querySelector("table")).toBeNull();
      expect(container.querySelector(".sd-table-widget")).toBeNull();
      expect(lineTexts(container)).toEqual(["| A | B |", "|---|---|", "| 1 | 2 |"]);
    });

    it("marks header cells on the original source text", async () => {
      const { container } = render(<Sourcedown markdown={tableMarkdown} />);

      await waitFor(() => {
        expect(container.querySelector(".sd-table-header-cell")).not.toBeNull();
      });

      const cells = Array.from(
        container.querySelectorAll(".sd-table-header-cell")
      ).map(
        (el) => el.textContent ?? ""
      );
      expect(cells).toContain("A");
      expect(cells).toContain("B");
    });

    it("marks data cells on the original source text", async () => {
      const { container } = render(<Sourcedown markdown={tableMarkdown} />);

      await waitFor(() => {
        expect(container.querySelector(".sd-table-cell")).not.toBeNull();
      });

      const cells = Array.from(container.querySelectorAll(".sd-table-cell")).map(
        (el) => el.textContent ?? ""
      );
      expect(cells).toContain("1");
      expect(cells).toContain("2");
    });

    it("uses inline-block cell widths to align columns without replacing source", async () => {
      const { container } = render(<Sourcedown markdown={tableMarkdown} />);

      await waitFor(() => {
        expect(container.querySelector(".sd-table-cell")).not.toBeNull();
      });

      expect(container.querySelector(".sd-table-cell")).toHaveStyle({
        display: "inline-block",
      });
      expect(
        container.querySelector<HTMLElement>(".sd-table-cell")?.style.minWidth
      ).toMatch(/ch$/);
    });

    it("keeps pipe and delimiter source markers as original text", async () => {
      const { container } = render(<Sourcedown markdown={tableMarkdown} />);

      await waitFor(() => {
        expect(container.querySelector(".cm-content")).toBeTruthy();
      });

      const text = container.querySelector(".cm-content")?.textContent ?? "";
      expect(text).toContain("|");
      expect(text).toContain("---");
      expect(lineTexts(container)).toEqual(["| A | B |", "|---|---|", "| 1 | 2 |"]);
      expect(container.querySelector(".sd-table-delimiter-cell")?.textContent).toBe(
        "---"
      );
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

    it("marks each line in a fenced code block with sd-code-line", async () => {
      const { container } = render(
        <Sourcedown markdown={"```ts\nconst x = 1;\n```"} />
      );

      await waitFor(() => {
        expect(container.querySelector(".cm-line.sd-code-line")).not.toBeNull();
      });
    });

    it("marks the opening fence line with sd-code-line-first", async () => {
      const { container } = render(
        <Sourcedown markdown={"```ts\nconst x = 1;\n```"} />
      );

      await waitFor(() => {
        expect(
          container.querySelector(".cm-line.sd-code-line-first")
        ).not.toBeNull();
      });
    });

    it("marks the closing fence line with sd-code-line-last", async () => {
      const { container } = render(
        <Sourcedown markdown={"```ts\nconst x = 1;\n```"} />
      );

      await waitFor(() => {
        expect(
          container.querySelector(".cm-line.sd-code-line-last")
        ).not.toBeNull();
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

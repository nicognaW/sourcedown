import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./main";

function sourceText(element: HTMLElement): string {
  return element.querySelector(".cm-content")?.textContent ?? "";
}

describe("sourcedown site", () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("renders the landing hero and source-mode rationale", () => {
    render(<App />);

    const hero = screen.getByRole("region", { name: "Hero" });
    expect(sourceText(hero)).toContain(
      "# Source-Mode Markdown for Streaming AI Output"
    );
    expect(sourceText(hero)).toContain(
      "Keep every markdown character visible and copyable"
    );

    const rationale = screen.getByRole("region", {
      name: "Why Source Mode Markdown",
    });
    expect(sourceText(rationale)).toContain("# Why Source Mode Markdown");
    expect(sourceText(rationale)).toContain("WYSIWYG renderers hide syntax");
  });

  it("uses product-site copy casing and no status dot in the hero demo", () => {
    const { container } = render(<App />);

    expect(screen.getByText("Streaming Markdown")).toBeInTheDocument();
    expect(container.querySelector(".demo-status span")).toBeNull();
    expect(screen.queryByText("streaming markdown")).not.toBeInTheDocument();
  });

  it("keeps one compact anchor nav and links to GitHub", () => {
    const { container } = render(<App />);

    const githubLink = screen.getByRole("link", { name: "GitHub repository" });
    expect(githubLink).toHaveAttribute(
      "href",
      "https://github.com/nicognaW/sourcedown"
    );
    expect(githubLink).toHaveAttribute("target", "_blank");

    const anchorHrefs = Array.from(
      container.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
    ).map((link) => link.getAttribute("href"));

    expect(anchorHrefs).toEqual(["#top", "#docs", "#roadmap"]);
  });

  it("renders docs snippets through sourcedown with fenced highlighted code", () => {
    const { container } = render(<App />);

    const docs = screen.getByRole("region", { name: "Docs" });
    expect(sourceText(docs)).toContain("# Install");
    expect(sourceText(docs)).toContain("```tsx");
    expect(sourceText(docs)).toContain('import { Sourcedown } from "sourcedown";');
    expect(docs.querySelector(".sd-code-keyword")).toBeInTheDocument();

    expect(container.querySelector("#docs pre")).toBeNull();
  });

  it("autoplays streamed markdown in the live demo", async () => {
    vi.useFakeTimers();
    render(<App />);

    const demo = screen.getByRole("region", {
      name: "Autoplay Sourcedown Stream",
    });

    expect(demo).toHaveClass("autoplay-demo--hero");

    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(sourceText(demo)).toContain("# Sourcedown");
    expect(sourceText(demo)).not.toContain("Zero config");

    await act(async () => {
      vi.advanceTimersByTime(9500);
    });

    expect(sourceText(demo)).toContain("Zero config");
  });
});

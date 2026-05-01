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

    expect(
      screen.getByRole("heading", {
        name: "Source-Mode Markdown for Streaming AI Output",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Keep every markdown character visible and copyable/
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Why Source Mode Markdown" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/WYSIWYG renderers hide syntax/i)
    ).toBeInTheDocument();
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

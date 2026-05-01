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
        name: "source-mode markdown for streaming AI output",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /keep every markdown character visible and copyable/i
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "why source mode markdown" })
    ).toBeInTheDocument();
    expect(
      screen.getByText(/WYSIWYG renderers hide syntax/i)
    ).toBeInTheDocument();
  });

  it("autoplays streamed markdown in the live demo", async () => {
    vi.useFakeTimers();
    render(<App />);

    const demo = screen.getByRole("region", {
      name: "autoplay sourcedown stream",
    });

    expect(demo).toHaveClass("autoplay-demo--hero");

    await act(async () => {
      vi.advanceTimersByTime(120);
    });

    expect(sourceText(demo)).toContain("# sourcedown");
    expect(sourceText(demo)).not.toContain("zero config");

    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    expect(sourceText(demo)).toContain("zero config");
  });
});

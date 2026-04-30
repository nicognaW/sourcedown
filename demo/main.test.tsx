import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./main";

function sourceText(element: HTMLElement): string {
  return element.querySelector(".cm-content")?.textContent ?? "";
}

describe("sourcedown site", () => {
  afterEach(() => {
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

    const demo = screen.getByLabelText("autoplay sourcedown stream");

    act(() => {
      vi.advanceTimersByTime(120);
    });

    await waitFor(() => {
      expect(sourceText(demo)).toContain("# live source stream");
    });
    expect(sourceText(demo)).not.toContain("copy remains raw markdown");

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(sourceText(demo)).toContain("copy remains raw markdown");
    });
  });
});

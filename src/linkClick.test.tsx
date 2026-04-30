import { fireEvent, render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Sourcedown } from "./Sourcedown";

describe("link click behavior", () => {
  it("calls onLinkClick with href when a link is clicked", async () => {
    const onLinkClick = vi.fn();
    const { container } = render(
      <Sourcedown
        markdown="[text](https://example.com)"
        onLinkClick={onLinkClick}
      />
    );

    await waitFor(() => {
      expect(container.querySelector(".sd-link")).toBeTruthy();
    });

    const linkSpan = container.querySelector(".sd-link")!;
    fireEvent.click(linkSpan);

    expect(onLinkClick).toHaveBeenCalledWith(
      expect.any(MouseEvent),
      "https://example.com"
    );
  });

  it("opens href in new tab by default when no onLinkClick provided", async () => {
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);

    const { container } = render(
      <Sourcedown markdown="[text](https://example.com)" />
    );

    await waitFor(() => {
      expect(container.querySelector(".sd-link")).toBeTruthy();
    });

    const linkSpan = container.querySelector(".sd-link")!;
    fireEvent.click(linkSpan);

    expect(openSpy).toHaveBeenCalledWith(
      "https://example.com",
      "_blank",
      "noopener,noreferrer"
    );

    openSpy.mockRestore();
  });
});

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

  it("does not open unsafe href schemes by default", async () => {
    const openSpy = vi.spyOn(window, "open").mockReturnValue(null);

    const { container } = render(
      <Sourcedown markdown="[text](javascript:alert(1))" />
    );

    await waitFor(() => {
      expect(container.querySelector(".sd-link")).toBeTruthy();
    });

    const linkSpan = container.querySelector(".sd-link")!;
    fireEvent.click(linkSpan);

    expect(openSpy).not.toHaveBeenCalled();

    openSpy.mockRestore();
  });

  it("link source text remains raw markdown (source-as-is invariant)", async () => {
    const { container } = render(
      <Sourcedown markdown="[text](https://example.com)" />
    );

    await waitFor(() => {
      expect(container.querySelector(".cm-content")).toBeTruthy();
    });

    const content = container.querySelector(".cm-content")!;
    expect(content.textContent).toContain("[text](https://example.com)");
  });

  it("does not call onLinkClick when clicking outside a link", async () => {
    const onLinkClick = vi.fn();
    const { container } = render(
      <Sourcedown
        markdown={"[link](https://example.com)\n\nplain text"}
        onLinkClick={onLinkClick}
      />
    );

    await waitFor(() => {
      expect(container.querySelector(".cm-content")).toBeTruthy();
    });

    // Click on the content element itself (not a link span)
    const content = container.querySelector(".cm-content")!;
    fireEvent.click(content);

    expect(onLinkClick).not.toHaveBeenCalled();
  });
});

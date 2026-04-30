import { render, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Sourcedown } from "./Sourcedown";

function dec(container: HTMLElement, cls: string): Element | null {
  return container.querySelector(`.${cls}`);
}

function decText(container: HTMLElement, cls: string): string {
  return dec(container, cls)?.textContent ?? "";
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
});

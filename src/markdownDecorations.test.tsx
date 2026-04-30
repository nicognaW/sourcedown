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
});

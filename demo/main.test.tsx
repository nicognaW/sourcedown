import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./main";

describe("sourcedown site", () => {
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
});

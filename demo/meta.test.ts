import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const siteUrl = "https://sourcedown.vercel.app";
const html = readFileSync(join(process.cwd(), "index.html"), "utf8");
const compactHtml = html.replace(/\s+/g, " ");

describe("landing page social metadata", () => {
  it("uses a Twitter-ready large image preview", () => {
    expect(html).toContain(
      '<meta name="twitter:card" content="summary_large_image" />'
    );
    expect(compactHtml).toContain(
      `<meta property="og:image" content="${siteUrl}/og-image.png" />`
    );
    expect(compactHtml).toContain(
      `<meta name="twitter:image" content="${siteUrl}/og-image.png" />`
    );
    expect(existsSync(join(process.cwd(), "public/og-image.png"))).toBe(true);
  });
});

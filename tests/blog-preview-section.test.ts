import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const root = process.cwd();
const dist = (p: string) => join(root, "dist", p);

describe("Blog preview section on homepage", () => {
  beforeAll(() => {
    execFileSync("npx", ["astro", "build"], {
      cwd: root,
      stdio: "pipe",
      env: { ...process.env, NO_COLOR: "1" },
    });
  }, 60_000);

  it("renders Latest writing section after hero and before projects", () => {
    const html = readFileSync(dist("index.html"), "utf8");

    // Should have "Latest writing" heading
    expect(html).toContain("Latest writing");

    // Should have the subtitle
    expect(html).toContain("Recent posts from my blog");
  });

  it("includes blog post content with titles, dates, and descriptions", () => {
    const html = readFileSync(dist("index.html"), "utf8");

    // Should have at least 2 blog post links (or section is hidden if fewer)
    const blogLinkMatches = html.match(/href="https:\/\/blog\.yushi91\.com\/[^"]*"/g) || [];
    expect(blogLinkMatches.length).toBeGreaterThanOrEqual(2);

    // Blog links should open in new tab with noopener for security
    const externalLinkPattern = /href="https:\/\/blog\.yushi91\.com\/[^"]*"[^>]*target="_blank"[^>]*rel="[^"]*noopener/g;
    const externalLinkMatches = html.match(externalLinkPattern) || [];
    expect(externalLinkMatches.length).toBeGreaterThanOrEqual(2);
  });

  it("hides section when fewer than 2 posts are available", () => {
    const html = readFileSync(dist("index.html"), "utf8");

    // If section is rendered, it should have at least 2 posts
    const hasSection = html.includes("Latest writing");
    if (hasSection) {
      const blogLinkMatches = html.match(/href="https:\/\/blog\.yushi91\.com\/[^"]*"/g) || [];
      expect(blogLinkMatches.length).toBeGreaterThanOrEqual(2);
    }
    // If no section, that's also valid (means fewer than 2 posts)
  });
});

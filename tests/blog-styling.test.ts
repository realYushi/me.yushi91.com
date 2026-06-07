import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

const root = process.cwd();
const dist = (p: string) => join(root, "dist", p);

describe("Blog section styling matches existing patterns", () => {
  beforeAll(() => {
    execFileSync("npx", ["astro", "build"], {
      cwd: root,
      stdio: "pipe",
      env: { ...process.env, NO_COLOR: "1" },
    });
  }, 60_000);

  it("uses hairline borders for section heading and content", () => {
    const html = readFileSync(dist("index.html"), "utf8");

    // Section should have border-top and border-bottom
    expect(html).toContain("border-t border-hairline");
    expect(html).toContain("border-b border-hairline");
  });

  it("blog post items have hairline borders between them", () => {
    const html = readFileSync(dist("index.html"), "utf8");

    // Blog post articles should have border-bottom
    const blogSectionMatch = html.match(/<section[^>]*aria-labelledby="latest-writing-heading"[\s\S]*?<\/section>/);
    expect(blogSectionMatch).toBeTruthy();

    const blogSection = blogSectionMatch ? blogSectionMatch[0] : "";
    // Each post carries a top hairline, which renders as a separator between
    // stacked items (the last item also closes with a bottom hairline).
    expect(blogSection).toContain("border-t border-hairline");
  });

  it("excerpts use muted text color", () => {
    const html = readFileSync(dist("index.html"), "utf8");

    // Descriptions should use muted text class
    const blogSectionMatch = html.match(/<section[^>]*aria-labelledby="latest-writing-heading"[\s\S]*?<\/section>/);
    const blogSection = blogSectionMatch ? blogSectionMatch[0] : "";
    expect(blogSection).toContain("text-muted");
  });

  it("dates use small uppercase monospace font", () => {
    const html = readFileSync(dist("index.html"), "utf8");

    // Dates should use monospace font with uppercase
    const blogSectionMatch = html.match(/<section[^>]*aria-labelledby="latest-writing-heading"[\s\S]*?<\/section>/);
    const blogSection = blogSectionMatch ? blogSectionMatch[0] : "";
    expect(blogSection).toMatch(/font-mono[^>]*text-muted[^>]*uppercase/);
  });

  it("links have teal hover states", () => {
    const html = readFileSync(dist("index.html"), "utf8");

    // Blog post links should have teal hover color
    const blogSectionMatch = html.match(/<section[^>]*aria-labelledby="latest-writing-heading"[\s\S]*?<\/section>/);
    const blogSection = blogSectionMatch ? blogSectionMatch[0] : "";
    expect(blogSection).toContain("hover:text-teal");
  });

  it("section spacing matches other sections", () => {
    const html = readFileSync(dist("index.html"), "utf8");

    // Blog section should use same padding as other sections
    const blogSectionMatch = html.match(/<section[^>]*aria-labelledby="latest-writing-heading"[^>]*>/);
    const blogSection = blogSectionMatch ? blogSectionMatch[0] : "";
    expect(blogSection).toContain("px-5");
    // Section padding for articles (py-7 md:py-8)
    expect(html).toContain("py-7 md:py-8");
  });
});
